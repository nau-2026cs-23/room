import { Router, Request, Response } from 'express';
import { z } from 'zod';
import jwt from 'jsonwebtoken';
import {
  getResources,
  getResourceById,
  createResource,
  updateResourceStatus,
  incrementDownloadCount,
  getPendingResources,
  getUserResources,
  updateResourceRating,
} from '../repositories/resources';
import { getCommentsByResource, createComment, likeComment } from '../repositories/comments';
import { addPointTransaction, getUserTransactions } from '../repositories/points';
import { findUserById } from '../repositories/users';
import { downloads } from '../db/schema';
import { db } from '../db';
import { eq, and } from 'drizzle-orm';
import { JWT_SECRET } from '../config/constants';
import type { ApiResponse, ResourceListResponse, Resource as ApiResource } from '../../shared/types/api';

const router = Router();

function getOptionalUser(req: Request): string | null {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader?.startsWith('Bearer ')) return null;
    const token = authHeader.slice(7);
    const payload = jwt.verify(token, JWT_SECRET) as { id: string };
    return payload.id;
  } catch {
    return null;
  }
}

function requireUser(req: Request, res: Response): string | null {
  const userId = getOptionalUser(req);
  if (!userId) {
    res.status(401).json({ success: false, message: '请先登录' });
    return null;
  }
  return userId;
}

function mapResource(r: Awaited<ReturnType<typeof getResourceById>>): ApiResource | null {
  if (!r) return null;
  return {
    id: r.id,
    title: r.title,
    description: r.description,
    category: r.category,
    subCategory: r.subCategory || undefined,
    stage: r.stage as ApiResource['stage'],
    resourceType: r.resourceType as ApiResource['resourceType'],
    fileUrl: r.fileUrl,
    fileName: r.fileName,
    fileSize: r.fileSize,
    pageCount: r.pageCount,
    pointCost: r.pointCost as ApiResource['pointCost'],
    status: r.status as ApiResource['status'],
    uploaderId: r.uploaderId,
    uploaderName: r.uploaderName,
    uploaderCertified: r.uploaderCertified,
    downloadCount: r.downloadCount,
    rating: parseFloat(r.rating as string) || 0,
    ratingCount: r.ratingCount,
    tags: JSON.parse(r.tags || '[]') as string[],
    year: r.year || undefined,
    school: r.school || undefined,
    rejectionReason: r.rejectionReason || undefined,
    rejectionCode: r.rejectionCode || undefined,
    createdAt: r.createdAt.toISOString(),
    updatedAt: r.updatedAt.toISOString(),
  };
}

// GET /api/resources
router.get('/', async (req: Request, res: Response) => {
  try {
    const { page, pageSize, search, category, stage, resourceType, sortBy, sortOrder } = req.query;
    const result = await getResources({
      page: page ? parseInt(page as string) : 1,
      pageSize: pageSize ? parseInt(pageSize as string) : 20,
      search: search as string,
      category: category as string,
      stage: stage as string,
      resourceType: resourceType as string,
      sortBy: sortBy as string,
      sortOrder: sortOrder as string,
    });
    const mapped = result.resources.map(r => mapResource(r)).filter(Boolean) as ApiResource[];
    return res.json({ success: true, data: { resources: mapped, total: result.total, page: parseInt(page as string) || 1, pageSize: parseInt(pageSize as string) || 20 } } as ApiResponse<ResourceListResponse>);
  } catch (error) {
    console.error('Get resources error:', error);
    return res.status(500).json({ success: false, message: '获取资料列表失败' });
  }
});

// GET /api/resources/:id
router.get('/:id', async (req: Request, res: Response) => {
  try {
    const id = req.params.id as string;
    const resource = await getResourceById(id);
    if (!resource) return res.status(404).json({ success: false, message: '资料不存在' });
    return res.json({ success: true, data: mapResource(resource) } as ApiResponse<ApiResource>);
  } catch (error) {
    console.error('Get resource error:', error);
    return res.status(500).json({ success: false, message: '获取资料失败' });
  }
});

// POST /api/resources
router.post('/', async (req: Request, res: Response) => {
  try {
    const userId = requireUser(req, res);
    if (!userId) return;
    const user = await findUserById(userId);
    if (!user) return res.status(404).json({ success: false, message: '用户不存在' });

    const schema = z.object({
      title: z.string().min(2).max(200),
      description: z.string().max(2000).default(''),
      category: z.string().min(1),
      subCategory: z.string().optional(),
      stage: z.string().min(1),
      resourceType: z.string().min(1),
      fileUrl: z.string().url(),
      fileName: z.string().min(1),
      fileSize: z.coerce.number().int().min(0),
      pageCount: z.coerce.number().int().min(0).default(0),
      pointCost: z.coerce.number().int().min(0).max(30).default(0),
      tagsArray: z.array(z.string()).default([]),
      year: z.coerce.number().int().optional(),
      school: z.string().optional(),
    });

    const validated = schema.parse(req.body);
    const { tagsArray, ...rest } = validated;
    const resource = await createResource({
      ...rest,
      tags: JSON.stringify(tagsArray),
      uploaderId: userId,
      uploaderName: user.username,
      uploaderCertified: user.isTeacherCertified,
      status: 'pending',
    });
    return res.json({ success: true, data: mapResource(resource) });
  } catch (error) {
    console.error('Create resource error:', error);
    if (error instanceof z.ZodError) {
      return res.status(400).json({ success: false, message: error.errors[0].message });
    }
    return res.status(500).json({ success: false, message: '上传失败' });
  }
});

// POST /api/resources/:id/download
router.post('/:id/download', async (req: Request, res: Response) => {
  try {
    const userId = requireUser(req, res);
    if (!userId) return;
    const id = req.params.id as string;
    const resource = await getResourceById(id);
    if (!resource) return res.status(404).json({ success: false, message: '资料不存在' });
    if (resource.status !== 'approved') return res.status(400).json({ success: false, message: '资料未通过审核' });

    const user = await findUserById(userId);
    if (!user) return res.status(404).json({ success: false, message: '用户不存在' });

    // Check if already downloaded
    const existing = await db.select().from(downloads).where(and(eq(downloads.userId, userId), eq(downloads.resourceId, id))).limit(1);
    if (existing.length > 0) {
      return res.json({ success: true, data: { fileUrl: resource.fileUrl, alreadyDownloaded: true } });
    }

    const cost = resource.pointCost;
    if (user.points < cost) {
      return res.status(400).json({ success: false, message: `积分不足，需要 ${cost} 积分` });
    }

    await db.insert(downloads).values({ userId, resourceId: id, pointsSpent: cost });
    if (cost > 0) {
      await addPointTransaction(userId, 'download_resource', -cost, user.points, `下载《${resource.title}》`);
    }
    await incrementDownloadCount(id);

    // Award uploader
    if (resource.uploaderId !== userId) {
      const uploader = await findUserById(resource.uploaderId);
      if (uploader) {
        await addPointTransaction(resource.uploaderId, 'resource_downloaded', 2, uploader.points, `资料《${resource.title}》被下载`);
      }
    }

    return res.json({ success: true, data: { fileUrl: resource.fileUrl, alreadyDownloaded: false } });
  } catch (error) {
    console.error('Download error:', error);
    return res.status(500).json({ success: false, message: '下载失败' });
  }
});

// GET /api/resources/:id/comments
router.get('/:id/comments', async (req: Request, res: Response) => {
  try {
    const id = req.params.id as string;
    const page = req.query.page ? parseInt(req.query.page as string) : 1;
    const result = await getCommentsByResource(id, page);
    const mapped = result.comments.map(c => ({
      id: c.id,
      resourceId: c.resourceId,
      userId: c.userId,
      username: c.username,
      avatarUrl: c.avatarUrl || undefined,
      isTeacherCertified: c.isTeacherCertified,
      content: c.content,
      rating: c.rating,
      likes: c.likes,
      createdAt: c.createdAt.toISOString(),
    }));
    return res.json({ success: true, data: { comments: mapped, total: result.total } });
  } catch (error) {
    console.error('Get comments error:', error);
    return res.status(500).json({ success: false, message: '获取评论失败' });
  }
});

// POST /api/resources/:id/comments
router.post('/:id/comments', async (req: Request, res: Response) => {
  try {
    const userId = requireUser(req, res);
    if (!userId) return;
    const id = req.params.id as string;
    const user = await findUserById(userId);
    if (!user) return res.status(404).json({ success: false, message: '用户不存在' });

    const schema = z.object({
      content: z.string().min(20).max(1000),
      rating: z.coerce.number().int().min(1).max(5),
    });
    const validated = schema.parse(req.body);

    const comment = await createComment({
      resourceId: id as string,
      userId,
      username: user.username,
      avatarUrl: user.avatarUrl,
      isTeacherCertified: user.isTeacherCertified,
      content: validated.content,
      rating: validated.rating,
    });

    // Award comment points
    await addPointTransaction(userId, 'write_comment', 3, user.points, '撰写有效评论');

    // Update resource rating
    const resource = await getResourceById(id);
    if (resource) {
      const currentRating = parseFloat(resource.rating as string) || 0;
      const newCount = resource.ratingCount + 1;
      const newRating = ((currentRating * resource.ratingCount) + validated.rating) / newCount;
      await updateResourceRating(id, newRating.toFixed(2), newCount);
    }

    return res.json({ success: true, data: comment });
  } catch (error) {
    console.error('Create comment error:', error);
    if (error instanceof z.ZodError) {
      return res.status(400).json({ success: false, message: error.errors[0].message });
    }
    return res.status(500).json({ success: false, message: '评论失败' });
  }
});

// POST /api/resources/:id/comments/:commentId/like
router.post('/:id/comments/:commentId/like', async (req: Request, res: Response) => {
  try {
    const commentId = req.params.commentId as string;
    const result = await likeComment(commentId);
    return res.json({ success: true, data: result });
  } catch (error) {
    console.error('Like comment error:', error);
    return res.status(500).json({ success: false, message: '点赞失败' });
  }
});

// GET /api/resources/user/my
router.get('/user/my', async (req: Request, res: Response) => {
  try {
    const userId = requireUser(req, res);
    if (!userId) return;
    const rows = await getUserResources(userId);
    const mapped = rows.map(r => mapResource(r)).filter(Boolean) as ApiResource[];
    return res.json({ success: true, data: mapped });
  } catch (error) {
    console.error('Get user resources error:', error);
    return res.status(500).json({ success: false, message: '获取失败' });
  }
});

// Admin: GET /api/resources/admin/pending
router.get('/admin/pending', async (req: Request, res: Response) => {
  try {
    const userId = requireUser(req, res);
    if (!userId) return;
    const user = await findUserById(userId);
    if (!user || (user.role !== 'admin' && user.role !== 'reviewer')) {
      return res.status(403).json({ success: false, message: '无权限' });
    }
    const rows = await getPendingResources();
    const mapped = rows.map(r => mapResource(r)).filter(Boolean) as ApiResource[];
    return res.json({ success: true, data: mapped });
  } catch (error) {
    console.error('Get pending resources error:', error);
    return res.status(500).json({ success: false, message: '获取失败' });
  }
});

// Admin: POST /api/resources/:id/review
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
      decision: z.enum(['approved', 'rejected', 'flagged']),
      rejectionCode: z.string().optional(),
      rejectionNote: z.string().max(100).optional(),
    });
    const validated = schema.parse(req.body);
    await updateResourceStatus(id, validated.decision, validated.rejectionCode, validated.rejectionNote);

    if (validated.decision === 'approved') {
      const resource = await getResourceById(id);
      if (resource) {
        const uploader = await findUserById(resource.uploaderId);
        if (uploader) {
          await addPointTransaction(resource.uploaderId, 'upload_approved', 30, uploader.points, `资料《${resource.title}》审核通过`);
        }
      }
    }
    return res.json({ success: true, data: null });
  } catch (error) {
    console.error('Review resource error:', error);
    return res.status(500).json({ success: false, message: '审核操作失败' });
  }
});

export default router;
