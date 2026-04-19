import { Router, Request, Response } from 'express';
import jwt from 'jsonwebtoken';
import { z } from 'zod';
import { createAIService } from '../services/aiService';
import { findUserById } from '../repositories/users';
import { addPointTransaction } from '../repositories/points';
import { aiChatSessions } from '../db/schema';
import { db } from '../db';
import { eq, desc } from 'drizzle-orm';
import { JWT_SECRET } from '../config/constants';
import type { ApiResponse, AIChatResponse, AIChatSession } from '../../shared/types/api';

const router = Router();

function requireUser(req: Request, res: Response): string | null {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader?.startsWith('Bearer ')) {
      res.status(401).json({ success: false, message: '请先登录' });
      return null;
    }
    const token = authHeader.slice(7);
    const payload = jwt.verify(token, JWT_SECRET) as { id: string };
    return payload.id;
  } catch {
    res.status(401).json({ success: false, message: '令牌无效' });
    return null;
  }
}

// GET /api/ai/sessions
router.get('/sessions', async (req: Request, res: Response) => {
  try {
    const userId = requireUser(req, res);
    if (!userId) return;
    const sessions = await db.select().from(aiChatSessions).where(eq(aiChatSessions.userId, userId)).orderBy(desc(aiChatSessions.updatedAt)).limit(20);
    const mapped = sessions.map(s => ({
      id: s.id,
      userId: s.userId,
      title: s.title,
      resourceId: s.resourceId || undefined,
      messages: JSON.parse(s.messages || '[]'),
      createdAt: s.createdAt.toISOString(),
      updatedAt: s.updatedAt.toISOString(),
    }));
    return res.json({ success: true, data: mapped });
  } catch (error) {
    console.error('Get AI sessions error:', error);
    return res.status(500).json({ success: false, message: '获取对话历史失败' });
  }
});

// POST /api/ai/chat
router.post('/chat', async (req: Request, res: Response) => {
  try {
    const userId = requireUser(req, res);
    if (!userId) return;
    const user = await findUserById(userId);
    if (!user) return res.status(404).json({ success: false, message: '用户不存在' });

    const schema = z.object({
      message: z.string().min(1).max(2000),
      sessionId: z.string().uuid().optional(),
      resourceId: z.string().uuid().optional(),
    });
    const validated = schema.parse(req.body);

    // Check daily free queries (5 per day)
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const todaySessions = await db.select().from(aiChatSessions).where(eq(aiChatSessions.userId, userId));
    let totalTodayQueries = 0;
    for (const s of todaySessions) {
      const msgs = JSON.parse(s.messages || '[]') as Array<{ role: string; createdAt: string }>;
      totalTodayQueries += msgs.filter(m => m.role === 'user' && new Date(m.createdAt) >= today).length;
    }

    const freeQueries = 5;
    const remainingFree = Math.max(0, freeQueries - totalTodayQueries);
    let pointsUsed = 0;

    if (remainingFree === 0) {
      if (user.points < 2) {
        return res.status(400).json({ success: false, message: '积分不足，每次AI问答消耗2积分' });
      }
      pointsUsed = 2;
      await addPointTransaction(userId, 'ai_query', -2, user.points, 'AI智能问答');
    }

    const aiService = createAIService();
    const systemPrompt = `你是学研社平台的智能学习助手，专门帮助学生解答学习问题、推荐学习资料和提供学习建议。
请用中文回答，回答要简洁、专业、有帮助。如果问题涉及具体资料，请基于平台的学习资料库给出建议。`;

    let reply = '';
    try {
      reply = await aiService.chat(validated.message, systemPrompt);
    } catch {
      reply = '抱歉，AI助手暂时无法响应，请稍后再试。';
    }

    // Save to session
    let sessionId = validated.sessionId;
    const userMsg = { id: crypto.randomUUID(), role: 'user', content: validated.message, createdAt: new Date().toISOString() };
    const assistantMsg = { id: crypto.randomUUID(), role: 'assistant', content: reply, createdAt: new Date().toISOString() };

    if (sessionId) {
      const existing = await db.select().from(aiChatSessions).where(eq(aiChatSessions.id, sessionId)).limit(1);
      if (existing[0]) {
        const msgs = JSON.parse(existing[0].messages || '[]');
        msgs.push(userMsg, assistantMsg);
        await db.update(aiChatSessions).set({ messages: JSON.stringify(msgs), updatedAt: new Date() }).where(eq(aiChatSessions.id, sessionId));
      }
    } else {
      const title = validated.message.slice(0, 30) + (validated.message.length > 30 ? '...' : '');
      const newSession = await db.insert(aiChatSessions).values({
        userId,
        title,
        resourceId: validated.resourceId || null,
        messages: JSON.stringify([userMsg, assistantMsg]),
      }).returning();
      sessionId = newSession[0].id;
    }

    return res.json({ success: true, data: { reply, sessionId, pointsUsed, remainingFreeQueries: Math.max(0, remainingFree - 1) } } as ApiResponse<AIChatResponse>);
  } catch (error) {
    console.error('AI chat error:', error);
    if (error instanceof z.ZodError) {
      return res.status(400).json({ success: false, message: error.errors[0].message });
    }
    return res.status(500).json({ success: false, message: 'AI问答失败' });
  }
});

export default router;
