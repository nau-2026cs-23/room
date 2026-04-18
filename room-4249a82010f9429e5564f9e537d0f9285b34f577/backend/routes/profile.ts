import { Router, Request, Response, NextFunction } from 'express';
import { authenticateJWT } from '../middleware/auth';
import { AuthRequest } from '../middleware/auth';
import { resourceRepository, favoriteRepository, downloadRepository, pointsRepository } from '../repositories/resources';
import { db } from '../db';
import { users } from '../db/schema';
import { eq } from 'drizzle-orm';

const router = Router();

// GET /api/profile/uploads
router.get('/uploads', authenticateJWT, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const user = (req as AuthRequest).user!;
    const items = await resourceRepository.findByUploaderId(user.id as string);
    res.json({ success: true, data: items });
  } catch (error) {
    next(error);
  }
});

// GET /api/profile/favorites
router.get('/favorites', authenticateJWT, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const user = (req as AuthRequest).user!;
    const favs = await favoriteRepository.findByUserId(user.id as string);
    const folders = await favoriteRepository.getFolders(user.id as string);
    res.json({ success: true, data: { favorites: favs, folders } });
  } catch (error) {
    next(error);
  }
});

// GET /api/profile/downloads
router.get('/downloads', authenticateJWT, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const user = (req as AuthRequest).user!;
    const items = await downloadRepository.findByUserId(user.id as string);
    res.json({ success: true, data: items });
  } catch (error) {
    next(error);
  }
});

// GET /api/profile/points
router.get('/points', authenticateJWT, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const user = (req as AuthRequest).user!;
    const transactions = await pointsRepository.findByUserId(user.id as string);
    const balance = await pointsRepository.getUserPoints(user.id as string);
    res.json({ success: true, data: { balance, transactions } });
  } catch (error) {
    next(error);
  }
});

// POST /api/profile/checkin
router.post('/checkin', authenticateJWT, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const user = (req as AuthRequest).user!;
    const tx = await pointsRepository.addTransaction({
      userId: user.id as string,
      amount: 50,
      type: 'daily_checkin',
      description: '??????????',
    });
    res.json({ success: true, data: tx });
  } catch (error) {
    next(error);
  }
});

// PUT /api/profile - update profile
router.put('/', authenticateJWT, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const user = (req as AuthRequest).user!;
    const { name, bio } = req.body;
    const [updated] = await db.update(users).set({ name, bio, updatedAt: new Date() }).where(eq(users.id, user.id as string)).returning();
    res.json({ success: true, data: { id: updated.id, name: updated.name, email: updated.email, bio: updated.bio, points: updated.points, role: updated.role, isTeacherVerified: updated.isTeacherVerified } });
  } catch (error) {
    next(error);
  }
});

// POST /api/profile/teacher-verify
router.post('/teacher-verify', authenticateJWT, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const user = (req as AuthRequest).user!;
    const [updated] = await db.update(users).set({ teacherVerifyStatus: 'pending', updatedAt: new Date() }).where(eq(users.id, user.id as string)).returning();
    res.json({ success: true, data: { message: 'Application submitted', status: updated.teacherVerifyStatus } });
  } catch (error) {
    next(error);
  }
});

export default router;
