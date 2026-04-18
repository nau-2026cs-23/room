import { Router, Request, Response, NextFunction } from 'express';
import { authenticateJWT } from '../middleware/auth';
import { AuthRequest } from '../middleware/auth';
import { resourceRepository, pointsRepository } from '../repositories/resources';
import { db } from '../db';
import { users, reports } from '../db/schema';
import { eq, desc } from 'drizzle-orm';
import { AppError } from '../middleware/errorHandler';

const router = Router();

// Middleware: require admin or teacher role
const requireAdmin = (req: Request, res: Response, next: NextFunction) => {
  const user = (req as AuthRequest).user!;
  if ((user.role as string) !== 'admin' && (user.role as string) !== 'teacher') {
    return next(new AppError('Admin access required', 403));
  }
  next();
};

// GET /api/admin/pending - pending resources
router.get('/pending', authenticateJWT, requireAdmin, async (_req: Request, res: Response, next: NextFunction) => {
  try {
    const items = await resourceRepository.findPending();
    res.json({ success: true, data: items });
  } catch (error) {
    next(error);
  }
});

// POST /api/admin/resources/:id/approve
router.post('/resources/:id/approve', authenticateJWT, requireAdmin, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const resource = await resourceRepository.findById(req.params.id as string);
    if (!resource) throw new AppError('Resource not found', 404);
    const updated = await resourceRepository.updateStatus(req.params.id as string, 'approved');
    // Award points to uploader
    await pointsRepository.addTransaction({
      userId: resource.uploaderId,
      amount: 100,
      type: 'upload',
      description: `?????${resource.title}???????????`,
      resourceId: resource.id,
    });
    res.json({ success: true, data: updated });
  } catch (error) {
    next(error);
  }
});

// POST /api/admin/resources/:id/reject
router.post('/resources/:id/reject', authenticateJWT, requireAdmin, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { reason } = req.body;
    if (!reason) throw new AppError('Reject reason is required', 400);
    const updated = await resourceRepository.updateStatus(req.params.id as string, 'rejected', reason);
    res.json({ success: true, data: updated });
  } catch (error) {
    next(error);
  }
});

// GET /api/admin/reports
router.get('/reports', authenticateJWT, requireAdmin, async (_req: Request, res: Response, next: NextFunction) => {
  try {
    const allReports = await db.select().from(reports).orderBy(desc(reports.createdAt));
    res.json({ success: true, data: allReports });
  } catch (error) {
    next(error);
  }
});

// GET /api/admin/users
router.get('/users', authenticateJWT, requireAdmin, async (_req: Request, res: Response, next: NextFunction) => {
  try {
    const allUsers = await db.select({ id: users.id, name: users.name, email: users.email, role: users.role, points: users.points, isTeacherVerified: users.isTeacherVerified, teacherVerifyStatus: users.teacherVerifyStatus, createdAt: users.createdAt }).from(users).orderBy(desc(users.createdAt));
    res.json({ success: true, data: allUsers });
  } catch (error) {
    next(error);
  }
});

// POST /api/admin/users/:id/verify-teacher
router.post('/users/:id/verify-teacher', authenticateJWT, requireAdmin, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const [updated] = await db.update(users).set({ isTeacherVerified: true, teacherVerifyStatus: 'approved', role: 'teacher', updatedAt: new Date() }).where(eq(users.id, req.params.id as string)).returning();
    res.json({ success: true, data: updated });
  } catch (error) {
    next(error);
  }
});

export default router;
