import { Router, Request, Response } from 'express';
import jwt from 'jsonwebtoken';
import { findUserById, updateUserCheckIn } from '../repositories/users';
import { addPointTransaction, getUserTransactions } from '../repositories/points';
import { JWT_SECRET } from '../config/constants';
import type { ApiResponse, PointsResponse, ExchangeItem } from '../../shared/types/api';

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

const EXCHANGE_ITEMS: ExchangeItem[] = [
  { id: 'dl_small', name: '下载次数包（小）', description: '10次标准档资料下载券', cost: 50, category: 'download_pack', validDays: 30 },
  { id: 'dl_large', name: '下载次数包（大）', description: '40次标准档资料下载券', cost: 150, category: 'download_pack', validDays: 60 },
  { id: 'ai_pack', name: 'AI问答次数包', description: '20次AI问答免积分使用券', cost: 30, category: 'ai_pack', validDays: 30 },
  { id: 'res_postgrad', name: '专属资料包（考研方向）', description: '解锁平台精选考研资料合集（限时）', cost: 200, category: 'resource_pack', validDays: 90, quantity: 100 },
  { id: 'res_civil', name: '专属资料包（考公方向）', description: '解锁平台精选考公资料合集（限时）', cost: 200, category: 'resource_pack', validDays: 90, quantity: 100 },
  { id: 'membership_7d', name: '会员体验卡（7天）', description: '7天无限下载权益（不含高级档资料）', cost: 300, category: 'membership', validDays: 7, limitPerMonth: 1 },
];

// GET /api/points/transactions
router.get('/transactions', async (req: Request, res: Response) => {
  try {
    const userId = requireUser(req, res);
    if (!userId) return;
    const page = req.query.page ? parseInt(req.query.page as string) : 1;
    const result = await getUserTransactions(userId, page);
    const mapped = result.transactions.map(t => ({
      id: t.id,
      userId: t.userId,
      action: t.action,
      delta: t.delta,
      balance: t.balance,
      description: t.description,
      createdAt: t.createdAt.toISOString(),
    }));
    return res.json({ success: true, data: { balance: 0, transactions: mapped, total: result.total } } as ApiResponse<PointsResponse>);
  } catch (error) {
    console.error('Get transactions error:', error);
    return res.status(500).json({ success: false, message: '获取积分记录失败' });
  }
});

// POST /api/points/checkin
router.post('/checkin', async (req: Request, res: Response) => {
  try {
    const userId = requireUser(req, res);
    if (!userId) return;
    const user = await findUserById(userId);
    if (!user) return res.status(404).json({ success: false, message: '用户不存在' });

    const now = new Date();
    const today = now.toDateString();
    const lastCheckIn = user.lastCheckIn ? new Date(user.lastCheckIn).toDateString() : null;

    if (lastCheckIn === today) {
      return res.status(400).json({ success: false, message: '今日已签到' });
    }

    const yesterday = new Date(now);
    yesterday.setDate(yesterday.getDate() - 1);
    const isConsecutive = lastCheckIn === yesterday.toDateString();
    const newConsecutive = isConsecutive ? user.consecutiveCheckIn + 1 : 1;

    await updateUserCheckIn(userId, newConsecutive);
    await addPointTransaction(userId, 'checkin', 5, user.points, `每日签到（连续${newConsecutive}天）`);

    let bonusPoints = 0;
    let bonusMsg = '';
    if (newConsecutive % 30 === 0) {
      bonusPoints = 100;
      bonusMsg = `连续签到${newConsecutive}天奖励`;
    } else if (newConsecutive % 7 === 0) {
      bonusPoints = 20;
      bonusMsg = `连续签到${newConsecutive}天奖励`;
    }

    if (bonusPoints > 0) {
      const freshUser = await findUserById(userId);
      if (freshUser) {
        await addPointTransaction(userId, 'checkin_streak_7', bonusPoints, freshUser.points, bonusMsg);
      }
    }

    const freshUser = await findUserById(userId);
    return res.json({ success: true, data: { points: freshUser?.points || 0, consecutive: newConsecutive, bonusPoints } });
  } catch (error) {
    console.error('Checkin error:', error);
    return res.status(500).json({ success: false, message: '签到失败' });
  }
});

// GET /api/points/exchange-items
router.get('/exchange-items', async (_req: Request, res: Response) => {
  return res.json({ success: true, data: EXCHANGE_ITEMS });
});

// POST /api/points/exchange
router.post('/exchange', async (req: Request, res: Response) => {
  try {
    const userId = requireUser(req, res);
    if (!userId) return;
    const user = await findUserById(userId);
    if (!user) return res.status(404).json({ success: false, message: '用户不存在' });

    const { itemId } = req.body as { itemId: string };
    const item = EXCHANGE_ITEMS.find(i => i.id === itemId);
    if (!item) return res.status(404).json({ success: false, message: '兑换商品不存在' });
    if (user.points < item.cost) {
      return res.status(400).json({ success: false, message: `积分不足，需要 ${item.cost} 积分` });
    }

    await addPointTransaction(userId, 'exchange', -item.cost, user.points, `兑换「${item.name}」`);
    return res.json({ success: true, data: { item, newBalance: user.points - item.cost } });
  } catch (error) {
    console.error('Exchange error:', error);
    return res.status(500).json({ success: false, message: '兑换失败' });
  }
});

export default router;
