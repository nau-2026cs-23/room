import { Router, Request, Response } from 'express';
import jwt from 'jsonwebtoken';
import { getAllUsers, findUserById } from '../repositories/users';
import { getPendingResources } from '../repositories/resources';
import { getPendingCertApplications } from '../repositories/teacherCert';
import { db } from '../db';
import { users, resources, downloads } from '../db/schema';
import { count } from 'drizzle-orm';
import { JWT_SECRET } from '../config/constants';
import type { ApiResponse, AdminStats } from '../../shared/types/api';

const router = Router();

function requireAdmin(req: Request, res: Response): string | null {
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

// GET /api/admin/stats
router.get('/stats', async (req: Request, res: Response) => {
  try {
    const userId = requireAdmin(req, res);
    if (!userId) return;
    const user = await findUserById(userId);
    if (!user || (user.role !== 'admin' && user.role !== 'reviewer')) {
      return res.status(403).json({ success: false, message: '无权限' });
    }

    const [totalUsers, totalResources, totalDownloads, pendingReviews, pendingCerts] = await Promise.all([
      db.select({ count: count() }).from(users),
      db.select({ count: count() }).from(resources),
      db.select({ count: count() }).from(downloads),
      getPendingResources(),
      getPendingCertApplications(),
    ]);

    const stats: AdminStats = {
      totalUsers: totalUsers[0]?.count || 0,
      totalResources: totalResources[0]?.count || 0,
      pendingReviews: pendingReviews.length,
      pendingCertifications: pendingCerts.length,
      totalDownloads: totalDownloads[0]?.count || 0,
      dailyActiveUsers: 0,
    };
    return res.json({ success: true, data: stats } as ApiResponse<AdminStats>);
  } catch (error) {
    console.error('Admin stats error:', error);
    return res.status(500).json({ success: false, message: '获取统计失败' });
  }
});

export default router;
