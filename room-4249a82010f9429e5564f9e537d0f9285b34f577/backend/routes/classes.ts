import { Router, Request, Response, NextFunction } from 'express';
import { authenticateJWT } from '../middleware/auth';
import { AuthRequest } from '../middleware/auth';
import { classRepository } from '../repositories/classes';
import { resourceRepository } from '../repositories/resources';
import { AppError } from '../middleware/errorHandler';

const router = Router();

// GET /api/classes/my - teacher's classes
router.get('/my', authenticateJWT, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const user = (req as AuthRequest).user!;
    const myClasses = await classRepository.findByTeacherId(user.id as string);
    // Enrich with resource count
    const enriched = await Promise.all(
      myClasses.map(async (cls) => {
        const resources = await resourceRepository.findAll({ classId: cls.id, status: 'approved' });
        return { ...cls, resourceCount: resources.length };
      })
    );
    res.json({ success: true, data: enriched });
  } catch (error) {
    next(error);
  }
});

// POST /api/classes - create class
router.post('/', authenticateJWT, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const user = (req as AuthRequest).user!;
    const { name, description } = req.body;
    if (!name) throw new AppError('Class name is required', 400);
    // Generate unique class code
    const classCode = Math.random().toString(36).substring(2, 8).toUpperCase();
    const cls = await classRepository.create({
      name,
      teacherId: user.id as string,
      teacherName: user.name as string,
      classCode,
      description,
    });
    res.status(201).json({ success: true, data: cls });
  } catch (error) {
    next(error);
  }
});

// GET /api/classes/:id/members
router.get('/:id/members', authenticateJWT, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const members = await classRepository.getMembers(req.params.id as string);
    res.json({ success: true, data: members });
  } catch (error) {
    next(error);
  }
});

// GET /api/classes/:id/resources
router.get('/:id/resources', authenticateJWT, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const resources = await resourceRepository.findAll({ classId: req.params.id as string, status: 'approved' });
    res.json({ success: true, data: resources });
  } catch (error) {
    next(error);
  }
});

// POST /api/classes/join - join by code
router.post('/join', authenticateJWT, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const user = (req as AuthRequest).user!;
    const { classCode } = req.body;
    if (!classCode) throw new AppError('Class code is required', 400);
    const cls = await classRepository.findByCode(classCode.toUpperCase());
    if (!cls) throw new AppError('Class not found', 404);
    const member = await classRepository.addMember(cls.id, user.id as string, user.name as string);
    res.json({ success: true, data: { class: cls, member } });
  } catch (error) {
    next(error);
  }
});

export default router;
