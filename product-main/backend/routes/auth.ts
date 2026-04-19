import { Router, Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { z } from 'zod';
import { findUserByEmail, createUser, findUserById } from '../repositories/users';
import { addPointTransaction } from '../repositories/points';
import { JWT_SECRET } from '../config/constants';
import type { ApiResponse, AuthResponse, User as ApiUser } from '../../shared/types/api';

const router = Router();

const signupSchema = z.object({
  username: z.string().min(2).max(50),
  email: z.string().email(),
  password: z.string().min(6),
});

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1),
});

function mapUser(u: Awaited<ReturnType<typeof findUserById>>): ApiUser {
  if (!u) throw new Error('User not found');
  return {
    id: u.id,
    username: u.username,
    email: u.email,
    role: u.role as ApiUser['role'],
    points: u.points,
    creditScore: u.creditScore,
    avatarUrl: u.avatarUrl || undefined,
    isTeacherCertified: u.isTeacherCertified,
    teacherCertStatus: (u.teacherCertStatus as ApiUser['teacherCertStatus']) || 'none',
    consecutiveCheckIn: u.consecutiveCheckIn,
    lastCheckIn: u.lastCheckIn?.toISOString(),
    createdAt: u.createdAt.toISOString(),
  };
}

router.post('/signup', async (req: Request, res: Response) => {
  try {
    const validated = signupSchema.parse(req.body);
    const existing = await findUserByEmail(validated.email);
    if (existing) {
      return res.status(400).json({ success: false, message: '该邮箱已被注册' } as ApiResponse<null>);
    }
    const hashed = await bcrypt.hash(validated.password, 10);
    const user = await createUser({ ...validated, password: hashed });
    // Grant registration bonus
    await addPointTransaction(user.id, 'register', 50, 50, '新用户注册奖励');
    const token = jwt.sign({ id: user.id }, JWT_SECRET, { expiresIn: '30d' });
    const fresh = await findUserById(user.id);
    return res.json({ success: true, data: { token, user: mapUser(fresh) } } as ApiResponse<AuthResponse>);
  } catch (error) {
    console.error('Signup error:', error);
    if (error instanceof z.ZodError) {
      return res.status(400).json({ success: false, message: error.errors[0].message });
    }
    return res.status(500).json({ success: false, message: '注册失败，请稍后重试' });
  }
});

router.post('/login', async (req: Request, res: Response) => {
  try {
    const validated = loginSchema.parse(req.body);
    const user = await findUserByEmail(validated.email);
    if (!user) {
      return res.status(401).json({ success: false, message: '邮箱或密码错误' });
    }
    const valid = await bcrypt.compare(validated.password, user.password);
    if (!valid) {
      return res.status(401).json({ success: false, message: '邮箱或密码错误' });
    }
    const token = jwt.sign({ id: user.id }, JWT_SECRET, { expiresIn: '30d' });
    return res.json({ success: true, data: { token, user: mapUser(user) } } as ApiResponse<AuthResponse>);
  } catch (error) {
    console.error('Login error:', error);
    return res.status(500).json({ success: false, message: '登录失败，请稍后重试' });
  }
});

router.get('/me', async (req: Request, res: Response) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader?.startsWith('Bearer ')) {
      return res.status(401).json({ success: false, message: '未授权' });
    }
    const token = authHeader.slice(7);
    const payload = jwt.verify(token, JWT_SECRET) as { id: string };
    const user = await findUserById(payload.id);
    if (!user) return res.status(404).json({ success: false, message: '用户不存在' });
    return res.json({ success: true, data: mapUser(user) } as ApiResponse<ApiUser>);
  } catch (error) {
    console.error('Auth me error:', error);
    return res.status(401).json({ success: false, message: '令牌无效' });
  }
});

export default router;
