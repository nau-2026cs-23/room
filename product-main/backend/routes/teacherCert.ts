import { Router, Request, Response } from 'express';
import jwt from 'jsonwebtoken';
import { z } from 'zod';
import { findUserById, updateUserCertStatus, getAllUsers } from '../repositories/users';
import { getPendingCertApplications, createCertApplication, updateCertApplicationStatus, getCertApplicationsByUser } from '../repositories/teacherCert';
import { addPointTransaction } from '../repositories/points';
import { JWT_SECRET } from '../config/constants';
import type { ApiResponse } from '../../shared/types/api';

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

// POST /api/teacher-cert/apply
router.post('/apply', async (req: Request, res: Response) => {
  try {
    const userId = requireUser(req, res);
    if (!userId) return;
    const user = await findUserById(userId);
    if (!user) return res.status(404).json({ success: false, message: '用户不存在' });
    if (user.isTeacherCertified) {
      return res.status(400).json({ success: false, message: '您已完成教师认证' });
    }

    const schema = z.object({
      certLevel: z.enum(['v1', 'v2', 'v3']),
      institution: z.string().min(2).max(100),
      department: z.string().min(2).max(100),
      position: z.string().min(2).max(100),
      materials: z.array(z.string()).min(1),
    });
    const validated = schema.parse(req.body);

    const application = await createCertApplication({
      userId,
      username: user.username,
      email: user.email,
      certLevel: validated.certLevel,
      institution: validated.institution,
      department: validated.department,
      position: validated.position,
      materials: JSON.stringify(validated.materials),
      status: 'pending',
    });

    await updateUserCertStatus(userId, 'pending', false);
    return res.json({ success: true, data: application });
  } catch (error) {
    console.error('Teacher cert apply error:', error);
    if (error instanceof z.ZodError) {
      return res.status(400).json({ success: false, message: error.errors[0].message });
    }
    return res.status(500).json({ success: false, message: '申请失败' });
  }
});

// GET /api/teacher-cert/my
router.get('/my', async (req: Request, res: Response) => {
  try {
    const userId = requireUser(req, res);
    if (!userId) return;
    const apps = await getCertApplicationsByUser(userId);
    const mapped = apps.map(a => ({
      ...a,
      materials: JSON.parse(a.materials || '[]'),
      createdAt: a.createdAt.toISOString(),
      updatedAt: a.updatedAt.toISOString(),
    }));
    return res.json({ success: true, data: mapped });
  } catch (error) {
    console.error('Get cert apps error:', error);
    return res.status(500).json({ success: false, message: '获取失败' });
  }
});

// Admin: GET /api/teacher-cert/pending
router.get('/pending', async (req: Request, res: Response) => {
  try {
    const userId = requireUser(req, res);
    if (!userId) return;
    const user = await findUserById(userId);
    if (!user || (user.role !== 'admin' && user.role !== 'reviewer')) {
      return res.status(403).json({ success: false, message: '无权限' });
    }
    const apps = await getPendingCertApplications();
    const mapped = apps.map(a => ({
      ...a,
      materials: JSON.parse(a.materials || '[]'),
      createdAt: a.createdAt.toISOString(),
      updatedAt: a.updatedAt.toISOString(),
    }));
    return res.json({ success: true, data: mapped });
  } catch (error) {
    console.error('Get pending cert apps error:', error);
    return res.status(500).json({ success: false, message: '获取失败' });
  }
});

// Admin: POST /api/teacher-cert/:id/review
router.post('/:id/review', async (req: Request, res: Response) => {
  try {
    const userId = requireUser(req, res);
    if (!userId) return;
    const user = await findUserById(userId);
    if (!user || (user.role !== 'admin' && user.role !== 'reviewer')) {
      return res.status(403).json({ success: false, message: '无权限' });
    }
    const id = req.params.id as string;
    const schema = z.object({
      decision: z.enum(['approved', 'rejected']),
      reviewNote: z.string().max(500).optional(),
    });
    const validated = schema.parse(req.body);
    const app = await updateCertApplicationStatus(id, validated.decision, validated.reviewNote);
    if (!app) return res.status(404).json({ success: false, message: '申请不存在' });

    if (validated.decision === 'approved') {
      await updateUserCertStatus(app.userId, 'approved', true);
      const applicant = await findUserById(app.userId);
      if (applicant) {
        await addPointTransaction(app.userId, 'teacher_certified', 100, applicant.points, '教师认证通过奖励');
      }
    } else {
      await updateUserCertStatus(app.userId, 'rejected', false);
    }
    return res.json({ success: true, data: null });
  } catch (error) {
    console.error('Review cert app error:', error);
    return res.status(500).json({ success: false, message: '审核失败' });
  }
});

export default router;
