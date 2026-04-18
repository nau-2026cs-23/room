import { Router, Request, Response, NextFunction } from 'express';
import { resourceRepository, reviewRepository, favoriteRepository, downloadRepository, pointsRepository } from '../repositories/resources';
import { reports, insertReportSchema } from '../db/schema';
import { db } from '../db';
import { authenticateJWT } from '../middleware/auth';
import { AuthRequest } from '../middleware/auth';
import { AppError } from '../middleware/errorHandler';
import { insertResourceSchema } from '../db/schema';

const router = Router();

// GET /api/resources - list resources (public)
router.get('/', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { category, subject, stage, resourceType, search, sortBy } = req.query;
    const items = await resourceRepository.findAll({
      category: category as string,
      subject: subject as string,
      stage: stage as string,
      resourceType: resourceType as string,
      search: search as string,
      sortBy: sortBy as string,
    });

    // Attach avg rating to each resource
    const enriched = await Promise.all(
      items.map(async (r) => {
        const { avg, count } = await reviewRepository.getAverageRating(r.id);
        return { ...r, avgRating: avg, reviewCount: count };
      })
    );

    res.json({ success: true, data: enriched });
  } catch (error) {
    next(error);
  }
});

// GET /api/resources/stats
router.get('/stats', async (_req: Request, res: Response, next: NextFunction) => {
  try {
    const stats = await resourceRepository.getStats();
    res.json({ success: true, data: stats });
  } catch (error) {
    next(error);
  }
});

// GET /api/resources/:id
router.get('/:id', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const resource = await resourceRepository.findById(req.params.id as string);
    if (!resource) throw new AppError('Resource not found', 404);
    const { avg, count } = await reviewRepository.getAverageRating(resource.id);
    const reviewList = await reviewRepository.findByResourceId(resource.id);
    res.json({ success: true, data: { ...resource, avgRating: avg, reviewCount: count, reviews: reviewList } });
  } catch (error) {
    next(error);
  }
});

// POST /api/resources - upload resource (auth required)
router.post('/', authenticateJWT, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const user = (req as AuthRequest).user!;
    const validated = insertResourceSchema.parse({
      ...req.body,
      uploaderId: user.id,
      uploaderName: user.name,
      uploaderRole: user.role || 'student',
    });
    const resource = await resourceRepository.create(validated);
    res.status(201).json({ success: true, data: resource });
  } catch (error) {
    next(error);
  }
});

// DELETE /api/resources/:id - delete own resource
router.delete('/:id', authenticateJWT, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const user = (req as AuthRequest).user!;
    const resource = await resourceRepository.findById(req.params.id as string);
    if (!resource) throw new AppError('Resource not found', 404);
    if (resource.uploaderId !== (user.id as string) && (user.role as string) !== 'admin') throw new AppError('Forbidden', 403);
    await resourceRepository.delete(req.params.id as string);
    res.json({ success: true, data: { message: 'Deleted' } });
  } catch (error) {
    next(error);
  }
});

// POST /api/resources/:id/download - record download
router.post('/:id/download', authenticateJWT, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const user = (req as AuthRequest).user!;
    const resource = await resourceRepository.findById(req.params.id as string);
    if (!resource) throw new AppError('Resource not found', 404);
    if (resource.status !== 'approved') throw new AppError('Resource not available', 400);

    const alreadyDownloaded = await downloadRepository.hasDownloaded(user.id as string, resource.id);
    if (!alreadyDownloaded) {
      if (resource.pointsCost > 0) {
        const userPoints = await pointsRepository.getUserPoints(user.id as string);
        if (userPoints < resource.pointsCost) throw new AppError('Insufficient points', 400);
        await pointsRepository.addTransaction({
          userId: user.id as string,
          amount: -resource.pointsCost,
          type: 'download',
          description: `?????${resource.title}??`,
          resourceId: resource.id,
        });
      }
      await downloadRepository.record(user.id as string, resource.id);
      await resourceRepository.incrementDownload(resource.id);
    }

    res.json({ success: true, data: { fileUrl: resource.fileUrl, fileName: resource.fileName } });
  } catch (error) {
    next(error);
  }
});

// GET /api/resources/:id/reviews
router.get('/:id/reviews', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const reviewList = await reviewRepository.findByResourceId(req.params.id as string);
    const { avg, count } = await reviewRepository.getAverageRating(req.params.id as string);
    res.json({ success: true, data: { reviews: reviewList, avgRating: avg, reviewCount: count } });
  } catch (error) {
    next(error);
  }
});

// POST /api/resources/:id/reviews
router.post('/:id/reviews', authenticateJWT, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const user = (req as AuthRequest).user!;
    const { rating, content } = req.body;
    if (!rating || rating < 1 || rating > 5) throw new AppError('Rating must be 1-5', 400);
    const review = await reviewRepository.create({
      resourceId: req.params.id as string,
      userId: user.id as string,
      userName: user.name as string,
      rating: Number(rating),
      content,
    });
    res.status(201).json({ success: true, data: review });
  } catch (error) {
    next(error);
  }
});

// POST /api/resources/:id/report
router.post('/:id/report', authenticateJWT, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const user = (req as AuthRequest).user!;
    const { reason, description } = req.body;
    const [report] = await db.insert(reports).values({
      resourceId: req.params.id as string,
      reporterId: user.id as string,
      reason,
      description,
    }).returning();
    res.status(201).json({ success: true, data: report });
  } catch (error) {
    next(error);
  }
});

// POST /api/resources/:id/favorite
router.post('/:id/favorite', authenticateJWT, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const user = (req as AuthRequest).user!;
    const { folderName } = req.body;
    const fav = await favoriteRepository.add(user.id as string, req.params.id as string, folderName);
    res.json({ success: true, data: fav });
  } catch (error) {
    next(error);
  }
});

// DELETE /api/resources/:id/favorite
router.delete('/:id/favorite', authenticateJWT, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const user = (req as AuthRequest).user!;
    await favoriteRepository.remove(user.id as string, req.params.id as string);
    res.json({ success: true, data: { message: 'Removed from favorites' } });
  } catch (error) {
    next(error);
  }
});

export default router;
