import React, { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { resourceApi, teacherCertApi, pointsApi } from '@/lib/api';
import type { Resource, TeacherCertApplication } from '@shared/types/api';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { toast } from 'sonner';
import {
  User, FileText, Award, Coins, CheckCircle, Clock, XCircle,
  Upload, Star, Download, Loader2, GraduationCap
} from 'lucide-react';

interface ProfilePageProps {
  onGoToResource: (id: string) => void;
  onGoToPoints: () => void;
  onGoToCert: () => void;
}

type ProfileTab = 'overview' | 'uploads' | 'certification';

const stageLabels: Record<string, string> = { undergraduate: '本科', graduate: '研究生', exam_postgrad: '考研', exam_civil: '考公' };
const typeLabels: Record<string, string> = { notes: '笔记', exam_paper: '真题', slides: '课件', exercise: '习题', solution: '解析', other: '其他' };

export default function ProfilePage({ onGoToResource, onGoToPoints }: ProfilePageProps) {
  const { user, refreshUser } = useAuth();
  const [tab, setTab] = useState<ProfileTab>('overview');
  const [myResources, setMyResources] = useState<Resource[]>([]);
  const [certApps, setCertApps] = useState<TeacherCertApplication[]>([]);
  const [loadingResources, setLoadingResources] = useState(false);
  const [checkinLoading, setCheckinLoading] = useState(false);

  // Cert form
  const [certLevel, setCertLevel] = useState('v1');
  const [institution, setInstitution] = useState('');
  const [department, setDepartment] = useState('');
  const [position, setPosition] = useState('');
  const [certLoading, setCertLoading] = useState(false);

  useEffect(() => {
    if (tab === 'uploads') {
      const load = async () => {
        setLoadingResources(true);
        try {
          const res = await resourceApi.myResources();
          if (res.success) setMyResources(res.data);
        } finally {
          setLoadingResources(false);
        }
      };
      load();
    }
    if (tab === 'certification') {
      const load = async () => {
        const res = await teacherCertApi.myApplications();
        if (res.success) setCertApps(res.data);
      };
      load();
    }
  }, [tab]);

  const handleCheckin = async () => {
    setCheckinLoading(true);
    try {
      const res = await pointsApi.checkin();
      if (res.success) {
        toast.success('签到成功', { description: `获得5积分${res.data.bonusPoints > 0 ? `，连续奖励+${res.data.bonusPoints}` : ''}！连续${res.data.consecutive}天` });
        await refreshUser();
      } else {
        toast.error('签到失败', { description: res.message });
      }
    } finally {
      setCheckinLoading(false);
    }
  };

  const handleCertApply = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!institution || !department || !position) { toast.error('请填写完整信息'); return; }
    setCertLoading(true);
    try {
      const res = await teacherCertApi.apply({
        certLevel: certLevel as 'v1' | 'v2' | 'v3',
        institution,
        department,
        position,
        materials: ['待上传认证材料'],
      });
      if (res.success) {
        toast.success('申请已提交', { description: '审核通过后将获得认证徽章和100积分奖励' });
        const updated = await teacherCertApi.myApplications();
        if (updated.success) setCertApps(updated.data);
        await refreshUser();
      } else {
        toast.error('申请失败', { description: res.message });
      }
    } finally {
      setCertLoading(false);
    }
  };

  if (!user) return null;

  const today = new Date().toDateString();
  const lastCheckIn = user.lastCheckIn ? new Date(user.lastCheckIn).toDateString() : null;
  const checkedInToday = lastCheckIn === today;

  return (
    <div className="max-w-screen-xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Profile Header */}
      <div className="bg-white rounded-2xl border border-[#E2E8F0] p-6 mb-6 shadow-sm">
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-5">
          <div className="w-16 h-16 bg-[#6366F1] rounded-2xl flex items-center justify-center text-white text-2xl font-bold flex-shrink-0">
            {user.username[0].toUpperCase()}
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-3 flex-wrap">
              <h1 className="text-xl font-bold text-[#1E293B]">{user.username}</h1>
              {user.isTeacherCertified && (
                <Badge className="bg-emerald-100 text-emerald-700">
                  <CheckCircle className="w-3 h-3 mr-1" />认证教师
                </Badge>
              )}
              {user.role === 'admin' && <Badge className="bg-red-100 text-red-700">管理员</Badge>}
              {user.role === 'reviewer' && <Badge className="bg-blue-100 text-blue-700">审核员</Badge>}
            </div>
            <p className="text-sm text-[#64748B] mt-1">{user.email}</p>
            <p className="text-xs text-[#64748B] mt-1">注册于 {new Date(user.createdAt).toLocaleDateString('zh-CN')}</p>
          </div>
          <div className="flex items-center gap-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-amber-600">{user.points}</div>
              <div className="text-xs text-[#64748B]">积分</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-[#1E293B]">{user.consecutiveCheckIn}</div>
              <div className="text-xs text-[#64748B]">连续签到</div>
            </div>
          </div>
        </div>
        <div className="flex flex-wrap gap-3 mt-5">
          <Button
            onClick={handleCheckin}
            disabled={checkedInToday || checkinLoading}
            className={`rounded-xl h-9 text-sm ${
              checkedInToday
                ? 'bg-slate-100 text-slate-400 cursor-not-allowed'
                : 'bg-[#10B981] hover:bg-[#059669] text-white'
            }`}
          >
            {checkinLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : checkedInToday ? '已签到' : '每日签到 +5分'}
          </Button>
          <Button onClick={onGoToPoints} variant="outline" className="rounded-xl h-9 text-sm border-[#E2E8F0]">
            <Coins className="w-4 h-4 mr-1" />积分中心
          </Button>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 bg-white rounded-xl border border-[#E2E8F0] p-1 mb-6 w-fit">
        {([
          { id: 'overview', label: '概览', icon: User },
          { id: 'uploads', label: '我的资料', icon: FileText },
          { id: 'certification', label: '教师认证', icon: Award },
        ] as const).map(t => (
          <button
            key={t.id}
            onClick={() => setTab(t.id)}
            className={`flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              tab === t.id ? 'bg-[#0F172A] text-white' : 'text-[#64748B] hover:text-[#1E293B]'
            }`}
          >
            <t.icon className="w-4 h-4" />
            {t.label}
          </button>
        ))}
      </div>

      {/* Overview Tab */}
      {tab === 'overview' && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {[
            { label: '当前积分', value: user.points, icon: Coins, color: 'text-amber-600', bg: 'bg-amber-50' },
            { label: '信用分', value: user.creditScore, icon: Star, color: 'text-blue-600', bg: 'bg-blue-50' },
            { label: '连续签到', value: `${user.consecutiveCheckIn}天`, icon: CheckCircle, color: 'text-emerald-600', bg: 'bg-emerald-50' },
            { label: '认证状态', value: user.isTeacherCertified ? '已认证' : '未认证', icon: GraduationCap, color: user.isTeacherCertified ? 'text-emerald-600' : 'text-slate-500', bg: user.isTeacherCertified ? 'bg-emerald-50' : 'bg-slate-50' },
          ].map(stat => (
            <div key={stat.label} className="bg-white rounded-2xl border border-[#E2E8F0] p-5">
              <div className={`w-10 h-10 ${stat.bg} rounded-xl flex items-center justify-center mb-3`}>
                <stat.icon className={`w-5 h-5 ${stat.color}`} />
              </div>
              <div className={`text-2xl font-bold ${stat.color} mb-1`}>{stat.value}</div>
              <div className="text-sm text-[#64748B]">{stat.label}</div>
            </div>
          ))}
        </div>
      )}

      {/* Uploads Tab */}
      {tab === 'uploads' && (
        <div>
          {loadingResources ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {[1,2,3].map(i => <div key={i} className="h-40 bg-slate-100 rounded-2xl animate-pulse" />)}
            </div>
          ) : myResources.length === 0 ? (
            <div className="text-center py-16">
              <Upload className="w-12 h-12 mx-auto mb-4 text-slate-300" />
              <p className="text-[#64748B] font-medium">还没有上传资料</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {myResources.map(r => (
                <button
                  key={r.id}
                  onClick={() => onGoToResource(r.id)}
                  className="bg-white rounded-2xl border border-[#E2E8F0] p-5 text-left hover:shadow-md transition-all"
                >
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex gap-1.5 flex-wrap">
                      <Badge className="bg-slate-100 text-slate-600 text-[10px]">{stageLabels[r.stage] || r.stage}</Badge>
                      <Badge className="bg-indigo-50 text-indigo-600 text-[10px]">{typeLabels[r.resourceType] || r.resourceType}</Badge>
                    </div>
                    <StatusBadge status={r.status} />
                  </div>
                  <h3 className="font-semibold text-sm text-[#1E293B] line-clamp-2 mb-3">{r.title}</h3>
                  <div className="flex items-center justify-between text-xs text-[#64748B]">
                    <div className="flex items-center gap-1"><Download className="w-3 h-3" />{r.downloadCount}</div>
                    <div className="flex items-center gap-1"><Star className="w-3 h-3 text-amber-400 fill-amber-400" />{r.rating > 0 ? r.rating.toFixed(1) : '-'}</div>
                  </div>
                  {r.status === 'rejected' && r.rejectionReason && (
                    <p className="text-xs text-red-500 mt-2 line-clamp-2">拒绝原因：{r.rejectionReason}</p>
                  )}
                </button>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Certification Tab */}
      {tab === 'certification' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="bg-white rounded-2xl border border-[#E2E8F0] p-6">
            <h3 className="font-bold text-[#1E293B] mb-2">教师认证申请</h3>
            <p className="text-sm text-[#64748B] mb-6">认证通过后可享快速审核通道、更高积分上限及班级空间管理权限</p>

            {user.isTeacherCertified ? (
              <div className="text-center py-8">
                <CheckCircle className="w-12 h-12 text-emerald-500 mx-auto mb-3" />
                <p className="font-bold text-[#1E293B]">您已完成教师认证</p>
                <p className="text-sm text-[#64748B] mt-1">认证教师徽章已展示在您的个人主页</p>
              </div>
            ) : user.teacherCertStatus === 'pending' ? (
              <div className="text-center py-8">
                <Clock className="w-12 h-12 text-amber-500 mx-auto mb-3" />
                <p className="font-bold text-[#1E293B]">申请审核中</p>
                <p className="text-sm text-[#64748B] mt-1">审核周期为3-5个工作日</p>
              </div>
            ) : (
              <form onSubmit={handleCertApply} className="space-y-4">
                <div className="space-y-2">
                  <Label className="text-[#1E293B] font-medium">认证等级</Label>
                  <Select value={certLevel} onValueChange={setCertLevel}>
                    <SelectTrigger className="border-[#E2E8F0]"><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="v1">V1 - 初级认证（助教、实习讲师）</SelectItem>
                      <SelectItem value="v2">V2 - 中级认证（高校讲师）</SelectItem>
                      <SelectItem value="v3">V3 - 高级认证（副教授以上）</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label className="text-[#1E293B] font-medium">所在院校/机构 *</Label>
                  <Input value={institution} onChange={e => setInstitution(e.target.value)} placeholder="如：清华大学" className="border-[#E2E8F0]" required />
                </div>
                <div className="space-y-2">
                  <Label className="text-[#1E293B] font-medium">院系/部门 *</Label>
                  <Input value={department} onChange={e => setDepartment(e.target.value)} placeholder="如：计算机科学与技术学院" className="border-[#E2E8F0]" required />
                </div>
                <div className="space-y-2">
                  <Label className="text-[#1E293B] font-medium">职务/职称 *</Label>
                  <Input value={position} onChange={e => setPosition(e.target.value)} placeholder="如：讲师、副教授" className="border-[#E2E8F0]" required />
                </div>
                <Button type="submit" disabled={certLoading} className="w-full bg-[#0F172A] text-white rounded-xl h-11">
                  {certLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : '提交认证申请'}
                </Button>
              </form>
            )}
          </div>

          {/* Cert Benefits */}
          <div className="bg-gradient-to-br from-emerald-50 to-teal-50 rounded-2xl border border-emerald-200 p-6">
            <h3 className="font-bold text-[#1E293B] mb-4">认证教师权益</h3>
            <div className="space-y-3">
              {[
                { icon: '⚡', title: '快速审核通道', desc: '资料审核在提交后6小时内完成' },
                { icon: '🏆', title: '认证徽章展示', desc: '个人主页展示认证徽章，提升可信度' },
                { icon: '📊', title: '更高积分上限', desc: '每日上传积分上限提升至150分' },
                { icon: '🏫', title: '班级空间管理', desc: '可创建班级空间，通过班级码分发课件' },
                { icon: '🎁', title: '认证奖励', desc: '认证通过后一次性获得100积分奖励' },
              ].map(b => (
                <div key={b.title} className="flex items-start gap-3">
                  <span className="text-xl">{b.icon}</span>
                  <div>
                    <p className="font-medium text-sm text-[#1E293B]">{b.title}</p>
                    <p className="text-xs text-[#64748B]">{b.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Application History */}
          {certApps.length > 0 && (
            <div className="lg:col-span-2 bg-white rounded-2xl border border-[#E2E8F0] p-6">
              <h3 className="font-bold text-[#1E293B] mb-4">申请记录</h3>
              <div className="space-y-3">
                {certApps.map(app => (
                  <div key={app.id} className="flex items-center justify-between p-4 bg-slate-50 rounded-xl">
                    <div>
                      <p className="font-medium text-sm text-[#1E293B]">{app.institution} - {app.department}</p>
                      <p className="text-xs text-[#64748B]">{new Date(app.createdAt).toLocaleDateString('zh-CN')}</p>
                    </div>
                    <StatusBadge status={app.status} />
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

function StatusBadge({ status }: { status: string }) {
  const configs: Record<string, { label: string; className: string; icon: React.ReactNode }> = {
    pending: { label: '审核中', className: 'bg-amber-50 text-amber-700', icon: <Clock className="w-3 h-3" /> },
    approved: { label: '已通过', className: 'bg-emerald-50 text-emerald-700', icon: <CheckCircle className="w-3 h-3" /> },
    rejected: { label: '未通过', className: 'bg-red-50 text-red-700', icon: <XCircle className="w-3 h-3" /> },
    flagged: { label: '标记复核', className: 'bg-orange-50 text-orange-700', icon: <Clock className="w-3 h-3" /> },
  };
  const config = configs[status] || { label: status, className: 'bg-slate-100 text-slate-600', icon: null };
  return (
    <Badge className={`${config.className} flex items-center gap-1 text-xs`}>
      {config.icon}
      {config.label}
    </Badge>
  );
}
