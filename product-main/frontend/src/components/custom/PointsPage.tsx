import { useState, useEffect } from 'react';
import { pointsApi } from '@/lib/api';
import { useAuth } from '@/contexts/AuthContext';
import type { PointTransaction, ExchangeItem } from '@shared/types/api';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';
import { Coins, TrendingUp, TrendingDown, Gift, Loader2, ShoppingBag } from 'lucide-react';

type PointsTab = 'history' | 'exchange' | 'rules';

const EARN_RULES = [
  { action: '新用户注册', points: '+50', limit: '一次性', note: '注册成功后自动发放' },
  { action: '每日签到', points: '+5', limit: '5分/天', note: '连续签到奖励见下方' },
  { action: '连续签到7天', points: '+20', limit: '每满7天', note: '中断后重置' },
  { action: '连续签刃30天', points: '+100', limit: '每满30天', note: '每满30天触发一次' },
  { action: '上传资料（审核通过）', points: '+30', limit: '90分/天', note: '审核不通过不发放' },
  { action: '资料被下载', points: '+2', limit: '20分/天', note: '同一用户重复下载仅计1次' },
  { action: '资料获得5星好评', points: '+10', limit: '30分/天', note: '评论审核通过后发放' },
  { action: '完成教师认证', points: '+100', limit: '一次性', note: '人工审核通过后发放' },
  { action: '撰写有效评论', points: '+3', limit: '9分/天', note: '评论字数不少20字' },
  { action: '举报违规资料（核实成立）', points: '+15', limit: '30分/天', note: '核实成立后发放' },
];

const CONSUME_RULES = [
  { action: '下载免费资料', points: '0', note: '上传者设置为免费时无需消耗' },
  { action: '下载积分资料（基础档）', points: '-5', note: '上传者设置积分门槛：5积分' },
  { action: '下载积分资料（标准档）', points: '-15', note: '上传者设置积分门槛：15积分' },
  { action: '下载积分资料（高级档）', points: '-30', note: '上传者设置积分门槛：30积分（最高上限）' },
  { action: 'AI问答（每次对话）', points: '-2', note: '每日5次免费，第6次起消耗积分' },
  { action: '在线预览超出免费页数', points: '-1/10页', note: '前10页免费预览' },
];

export default function PointsPage() {
  const { user } = useAuth();
  const [tab, setTab] = useState<PointsTab>('history');
  const [transactions, setTransactions] = useState<PointTransaction[]>([]);
  const [total, setTotal] = useState(0);
  const [txPage, setTxPage] = useState(1);
  const [loadingTx, setLoadingTx] = useState(false);
  const [exchangeItems, setExchangeItems] = useState<ExchangeItem[]>([]);
  const [exchangingId, setExchangingId] = useState<string | null>(null);

  useEffect(() => {
    if (tab === 'history') {
      const load = async () => {
        setLoadingTx(true);
        try {
          const res = await pointsApi.transactions(txPage);
          if (res.success) {
            setTransactions(res.data.transactions);
            setTotal(res.data.total);
          }
        } finally {
          setLoadingTx(false);
        }
      };
      load();
    }
    if (tab === 'exchange') {
      const load = async () => {
        const res = await pointsApi.exchangeItems();
        if (res.success) setExchangeItems(res.data);
      };
      load();
    }
  }, [tab, txPage]);

  const handleExchange = async (itemId: string, cost: number) => {
    if (!user || user.points < cost) {
      toast.error('积分不足', { description: `需要 ${cost} 积分` });
      return;
    }
    setExchangingId(itemId);
    try {
      const res = await pointsApi.exchange(itemId);
      if (res.success) {
        toast.success('兑换成功', { description: `已兑换「${res.data.item.name}」` });
      } else {
        toast.error('兑换失败', { description: res.message });
      }
    } finally {
      setExchangingId(null);
    }
  };

  if (!user) return null;

  return (
    <div className="max-w-screen-xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <div className="bg-[#0F172A] text-white rounded-2xl p-6 mb-6 relative overflow-hidden">
        <div className="relative z-10">
          <p className="text-slate-400 text-sm mb-1">当前积分</p>
          <div className="flex items-end gap-3 mb-4">
            <span className="text-5xl font-bold text-amber-400">{user.points}</span>
            <span className="text-slate-400 mb-2">分</span>
          </div>
          <div className="flex gap-4 text-sm">
            <span className="text-slate-400">信用分：<span className="text-white font-medium">{user.creditScore}</span></span>
            <span className="text-slate-400">连续签到：<span className="text-white font-medium">{user.consecutiveCheckIn}天</span></span>
          </div>
        </div>
        <div className="absolute -top-8 -right-8 w-32 h-32 bg-amber-400/10 rounded-full blur-2xl" />
        <Coins className="absolute right-6 top-6 w-16 h-16 text-amber-400/20" />
      </div>

      {/* Tabs */}
      <div className="flex gap-1 bg-white rounded-xl border border-[#E2E8F0] p-1 mb-6 w-fit">
        {([
          { id: 'history', label: '积分明细' },
          { id: 'exchange', label: '积分兑换' },
          { id: 'rules', label: '积分规则' },
        ] as const).map(t => (
          <button
            key={t.id}
            onClick={() => setTab(t.id)}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              tab === t.id ? 'bg-[#0F172A] text-white' : 'text-[#64748B] hover:text-[#1E293B]'
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      {/* History Tab */}
      {tab === 'history' && (
        <div className="bg-white rounded-2xl border border-[#E2E8F0] overflow-hidden">
          {loadingTx ? (
            <div className="p-8 text-center"><Loader2 className="w-6 h-6 animate-spin mx-auto text-[#64748B]" /></div>
          ) : transactions.length === 0 ? (
            <div className="p-12 text-center">
              <Coins className="w-12 h-12 mx-auto mb-4 text-slate-300" />
              <p className="text-[#64748B]">暂无积分记录</p>
            </div>
          ) : (
            <div className="divide-y divide-[#E2E8F0]">
              {transactions.map(tx => (
                <div key={tx.id} className="flex items-center justify-between px-6 py-4">
                  <div className="flex items-center gap-3">
                    <div className={`w-9 h-9 rounded-xl flex items-center justify-center ${
                      tx.delta > 0 ? 'bg-emerald-50' : 'bg-red-50'
                    }`}>
                      {tx.delta > 0
                        ? <TrendingUp className="w-4 h-4 text-emerald-600" />
                        : <TrendingDown className="w-4 h-4 text-red-500" />}
                    </div>
                    <div>
                      <p className="text-sm font-medium text-[#1E293B]">{tx.description}</p>
                      <p className="text-xs text-[#64748B]">{new Date(tx.createdAt).toLocaleString('zh-CN')}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className={`font-bold text-sm ${tx.delta > 0 ? 'text-emerald-600' : 'text-red-500'}`}>
                      {tx.delta > 0 ? '+' : ''}{tx.delta}
                    </p>
                    <p className="text-xs text-[#64748B]">余额 {tx.balance}</p>
                  </div>
                </div>
              ))}
            </div>
          )}
          {total > 20 && (
            <div className="flex items-center justify-center gap-3 p-4 border-t border-[#E2E8F0]">
              <Button variant="outline" disabled={txPage === 1} onClick={() => setTxPage(p => p - 1)} size="sm" className="rounded-xl border-[#E2E8F0]">上一页</Button>
              <span className="text-sm text-[#64748B]">{txPage}</span>
              <Button variant="outline" disabled={transactions.length < 20} onClick={() => setTxPage(p => p + 1)} size="sm" className="rounded-xl border-[#E2E8F0]">下一页</Button>
            </div>
          )}
        </div>
      )}

      {/* Exchange Tab */}
      {tab === 'exchange' && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {exchangeItems.map(item => (
            <div key={item.id} className="bg-white rounded-2xl border border-[#E2E8F0] p-5">
              <div className="flex items-start justify-between mb-3">
                <div className="w-10 h-10 bg-amber-50 rounded-xl flex items-center justify-center">
                  <Gift className="w-5 h-5 text-amber-600" />
                </div>
                <Badge className="bg-amber-50 text-amber-700 font-bold">{item.cost}分</Badge>
              </div>
              <h3 className="font-bold text-[#1E293B] mb-1">{item.name}</h3>
              <p className="text-sm text-[#64748B] mb-1">{item.description}</p>
              <p className="text-xs text-[#64748B] mb-4">有效期 {item.validDays} 天{item.limitPerMonth ? `，每月限兑换${item.limitPerMonth}次` : ''}</p>
              <Button
                onClick={() => handleExchange(item.id, item.cost)}
                disabled={!user || user.points < item.cost || exchangingId === item.id}
                className={`w-full rounded-xl h-9 text-sm ${
                  user && user.points >= item.cost
                    ? 'bg-[#0F172A] text-white hover:bg-[#1E293B]'
                    : 'bg-slate-100 text-slate-400 cursor-not-allowed'
                }`}
              >
                {exchangingId === item.id ? <Loader2 className="w-4 h-4 animate-spin" /> : <><ShoppingBag className="w-3.5 h-3.5 mr-1" />立即兑换</>}
              </Button>
            </div>
          ))}
        </div>
      )}

      {/* Rules Tab */}
      {tab === 'rules' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="bg-white rounded-2xl border border-[#E2E8F0] overflow-hidden">
            <div className="bg-emerald-50 px-6 py-4 border-b border-[#E2E8F0]">
              <h3 className="font-bold text-[#1E293B] flex items-center gap-2"><TrendingUp className="w-4 h-4 text-emerald-600" />积分获取规则</h3>
            </div>
            <div className="divide-y divide-[#E2E8F0]">
              {EARN_RULES.map(rule => (
                <div key={rule.action} className="px-6 py-3 flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-[#1E293B]">{rule.action}</p>
                    <p className="text-xs text-[#64748B]">{rule.note}</p>
                  </div>
                  <div className="text-right flex-shrink-0 ml-4">
                    <p className="text-sm font-bold text-emerald-600">{rule.points}</p>
                    <p className="text-xs text-[#64748B]">{rule.limit}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
          <div className="bg-white rounded-2xl border border-[#E2E8F0] overflow-hidden">
            <div className="bg-red-50 px-6 py-4 border-b border-[#E2E8F0]">
              <h3 className="font-bold text-[#1E293B] flex items-center gap-2"><TrendingDown className="w-4 h-4 text-red-500" />积分消耗规则</h3>
            </div>
            <div className="divide-y divide-[#E2E8F0]">
              {CONSUME_RULES.map(rule => (
                <div key={rule.action} className="px-6 py-3 flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-[#1E293B]">{rule.action}</p>
                    <p className="text-xs text-[#64748B]">{rule.note}</p>
                  </div>
                  <p className="text-sm font-bold text-red-500 flex-shrink-0 ml-4">{rule.points}</p>
                </div>
              ))}
            </div>
            <div className="px-6 py-4 bg-amber-50 border-t border-[#E2E8F0]">
              <p className="text-xs text-amber-800 font-medium">积分说明</p>
              <ul className="text-xs text-amber-700 mt-1 space-y-1">
                <li>• 账户积分上限：10,000分</li>
                <li>• 积分有效期：最后一次变动起365天</li>
                <li>• 每日获取上限：200分/天</li>
                <li>• 新用户保护期：注册后7天内不低于20分</li>
              </ul>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
