import React, { useState, useEffect } from 'react';
import { resourceApi, teacherCertApi, adminApi } from '@/lib/api';
import { useAuth } from '@/contexts/AuthContext';
import type { Resource, TeacherCertApplication, AdminStats } from '@shared/types/api';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { toast } from 'sonner';
import {
  Shield, FileText, GraduationCap, CheckCircle, XCircle, Flag,
  Clock, Users, Download, BarChart3, Loader2, Eye
} from 'lucide-react';

interface AdminPageProps {
  onGoToResource: (id: string) => void;
}

type AdminTab = 'stats' | 'resources' | 'certifications';

const REJECTION_CODES = [
  { code: 'R-01', label: '版权侵权' },
  { code: 'R-02', label: '内容与分类不符' },
  { code: 'R-03', label: '内容质量不足' },
  { code: 'R-04', label: '违法违规内容' },
  { code: 'R-05', label: '重复资料' },
  { code: 'R-06', label: '虚假/误导性描述' },
  { code: 'R-07', label: '文件损坏或格式不支持' },
  { code: 'R-08', label: '含可执行文件或安全风险' },
  { code: 'R-09', label: '其他原因' },
];

const stageLabels: Record<string, string> = { undergraduate: '本科', graduate: '研究生', exam_postgrad: '考研', exam_civil: '考公' };
const typeLabels: Record<string, string> = { notes: '笔记', exam_paper: '真题', slides: '课件', exercise: '习题', solution: '解析', other: '其他' };

export default function AdminPage({ onGoToResource }: AdminPageProps) {
  const { user } = useAuth();
  const [tab, setTab] = useState<AdminTab>('stats');
  const [stats, setStats] = useState<AdminStats | null>(null);
  const [pendingResources, setPendingResources] = useState<Resource[]>([]);
  const [pendingCerts, setPendingCerts] = useState<TeacherCertApplication[]>([]);
  const [loadingResources, setLoadingResources] = useState(false);
  const [loadingCerts, setLoadingCerts] = useState(false);
  const [reviewingId, setReviewingId] = useState<string | null>(null);
  const [rejectionCode, setRejectionCode] = useState('R-09');
  const [rejectionNote, setRejectionNote] = useState('');
  const [showRejectForm, setShowRejectForm] = useState<string | null>(null);

  useEffect(() => {
    adminApi.stats().then(res => { if (res.success) setStats(res.data); });
  }, []);

  useEffect(() => {
    if (tab === 'resources') {
      const load = async () => {
        setLoadingResources(true);
        try {
          const res = await resourceApi.pendingResources();
          if (res.success) setPendingResources(res.data);
        } finally {
          setLoadingResources(false);
        }
      };
      load();
    }
    if (tab === 'certifications') {
      const load = async () => {
        setLoadingCerts(true);
        try {
          const res = await teacherCertApi.pendingApplications();
          if (res.success) setPendingCerts(res.data);
        } finally {
          setLoadingCerts(false);
        }
      };
      load();
    }
  }, [tab]);

  const handleResourceReview = async (id: string, decision: 'approved' | 'rejected' | 'flagged', code?: string, note?: string) => {
    setReviewingId(id);
    try {
      const res = await resourceApi.review(id, { decision, rejectionCode: code, rejectionNote: note });
      if (res.success) {
        toast.success('审核完成', { description: decision === 'approved' ? '资料已通过审核' : '资料已拒绝' });
        setPendingResources(prev => prev.filter(r => r.id !== id));
        setShowRejectForm(null);
        setRejectionNote('');
      } else {
        toast.error('审核失败', { description: res.message });
      }
    } finally {
      setReviewingId(null);
    }
  };

  const handleCertReview = async (id: string, decision: 'approved' | 'rejected', note?: string) => {
    setReviewingId(id);
    try {
      const res = await teacherCertApi.review(id, { decision, reviewNote: note });
      if (res.success) {
        toast.success('审核完成');
        setPendingCerts(prev => prev.filter(c => c.id !== id));
      } else {
        toast.error('审核失败', { description: res.message });
      }
    } finally {
      setReviewingId(null);
    }
  };

  if (!user || (user.role !== 'admin' && user.role !== 'reviewer')) {
    return (
      <div className="max-w-screen-xl mx-auto px-4 sm:px-6 lg:px-8 py-16 text-center">
        <Shield className="w-12 h-12 mx-auto mb-4 text-slate-300" />
        <p className="text-[#64748B]">无权限访问审核后台</p>
      </div>
    );
  }

  return (
    <div className="max-w-screen-xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-[#1E293B] flex items-center gap-2">
          <Shield className="w-6 h-6" />审核后台
        </h1>
        <p className="text-[#64748B] text-sm mt-1">管理资料审核、教师认证申请</p>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 bg-white rounded-xl border border-[#E2E8F0] p-1 mb-6 w-fit">
        {([
          { id: 'stats', label: '数据概览', icon: BarChart3 },
          { id: 'resources', label: `资料审核${stats ? ` (${stats.pendingReviews})` : ''}`, icon: FileText },
          { id: 'certifications', label: `教师认证${stats ? ` (${stats.pendingCertifications})` : ''}`, icon: GraduationCap },
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

      {/* Stats Tab */}
      {tab === 'stats' && stats && (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
          {[
            { label: '总用户', value: stats.totalUsers.toLocaleString(), icon: Users, color: 'text-blue-600', bg: 'bg-blue-50' },
            { label: '总资料', value: stats.totalResources.toLocaleString(), icon: FileText, color: 'text-purple-600', bg: 'bg-purple-50' },
            { label: '待审核', value: stats.pendingReviews, icon: Clock, color: 'text-amber-600', bg: 'bg-amber-50' },
            { label: '待认证', value: stats.pendingCertifications, icon: GraduationCap, color: 'text-emerald-600', bg: 'bg-emerald-50' },
            { label: '总下载', value: stats.totalDownloads.toLocaleString(), icon: Download, color: 'text-indigo-600', bg: 'bg-indigo-50' },
            { label: '日活用户', value: stats.dailyActiveUsers, icon: BarChart3, color: 'text-rose-600', bg: 'bg-rose-50' },
          ].map(stat => (
            <div key={stat.label} className="bg-white rounded-2xl border border-[#E2E8F0] p-5">
              <div className={`w-9 h-9 ${stat.bg} rounded-xl flex items-center justify-center mb-3`}>
                <stat.icon className={`w-4 h-4 ${stat.color}`} />
              </div>
              <div className={`text-2xl font-bold ${stat.color}`}>{stat.value}</div>
              <div className="text-xs text-[#64748B] mt-1">{stat.label}</div>
            </div>
          ))}
        </div>
      )}

      {/* Resources Review Tab */}
      {tab === 'resources' && (
        <div className="space-y-4">
          {loadingResources ? (
            <div className="text-center py-12"><Loader2 className="w-6 h-6 animate-spin mx-auto text-[#64748B]" /></div>
          ) : pendingResources.length === 0 ? (
            <div className="text-center py-16">
              <CheckCircle className="w-12 h-12 mx-auto mb-4 text-emerald-400" />
              <p className="text-[#64748B] font-medium">待审核队列已清空</p>
            </div>
          ) : (
            pendingResources.map(r => (
              <div key={r.id} className="bg-white rounded-2xl border border-[#E2E8F0] p-6">
                <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
                  <div className="flex-1 min-w-0">
                    <div className="flex flex-wrap gap-2 mb-2">
                      <Badge className="bg-slate-100 text-slate-600 text-xs">{stageLabels[r.stage] || r.stage}</Badge>
                      <Badge className="bg-indigo-50 text-indigo-600 text-xs">{typeLabels[r.resourceType] || r.resourceType}</Badge>
                      {r.uploaderCertified && <Badge className="bg-emerald-50 text-emerald-700 text-xs">认证教师 ⚡快速通道</Badge>}
                    </div>
                    <h3 className="font-bold text-[#1E293B] mb-1">{r.title}</h3>
                    <p className="text-sm text-[#64748B] line-clamp-2 mb-2">{r.description}</p>
                    <div className="flex flex-wrap gap-4 text-xs text-[#64748B]">
                      <span>上传者：{r.uploaderName}</span>
                      <span>文件：{r.fileName}</span>
                      <span>大小：{(r.fileSize / 1024 / 1024).toFixed(1)}MB</span>
                      <span>页数：{r.pageCount}页</span>
                      <span>提交：{new Date(r.createdAt).toLocaleString('zh-CN')}</span>
                    </div>
                  </div>
                  <div className="flex flex-col gap-2 flex-shrink-0">
                    <Button
                      onClick={() => onGoToResource(r.id)}
                      variant="outline"
                      size="sm"
                      className="border-[#E2E8F0] rounded-xl"
                    >
                      <Eye className="w-3.5 h-3.5 mr-1" />预览
                    </Button>
                    <Button
                      onClick={() => handleResourceReview(r.id, 'approved')}
                      disabled={reviewingId === r.id}
                      size="sm"
                      className="bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl"
                    >
                      {reviewingId === r.id ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <><CheckCircle className="w-3.5 h-3.5 mr-1" />通过</>}
                    </Button>
                    <Button
                      onClick={() => handleResourceReview(r.id, 'flagged')}
                      disabled={reviewingId === r.id}
                      size="sm"
                      variant="outline"
                      className="border-orange-200 text-orange-600 hover:bg-orange-50 rounded-xl"
                    >
                      <Flag className="w-3.5 h-3.5 mr-1" />标记复核
                    </Button>
                    <Button
                      onClick={() => setShowRejectForm(showRejectForm === r.id ? null : r.id)}
                      disabled={reviewingId === r.id}
                      size="sm"
                      variant="outline"
                      className="border-red-200 text-red-600 hover:bg-red-50 rounded-xl"
                    >
                      <XCircle className="w-3.5 h-3.5 mr-1" />拒绝
                    </Button>
                  </div>
                </div>
                {showRejectForm === r.id && (
                  <div className="mt-4 pt-4 border-t border-[#E2E8F0] space-y-3">
                    <Select value={rejectionCode} onValueChange={setRejectionCode}>
                      <SelectTrigger className="border-[#E2E8F0]"><SelectValue /></SelectTrigger>
                      <SelectContent>
                        {REJECTION_CODES.map(c => <SelectItem key={c.code} value={c.code}>{c.code} - {c.label}</SelectItem>)}
                      </SelectContent>
                    </Select>
                    <Textarea
                      placeholder="补充说明（最多100字）"
                      value={rejectionNote}
                      onChange={e => setRejectionNote(e.target.value)}
                      maxLength={100}
                      rows={2}
                      className="border-[#E2E8F0] resize-none"
                    />
                    <Button
                      onClick={() => handleResourceReview(r.id, 'rejected', rejectionCode, rejectionNote)}
                      disabled={reviewingId === r.id}
                      size="sm"
                      className="bg-red-600 hover:bg-red-700 text-white rounded-xl"
                    >
                      {reviewingId === r.id ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : '确认拒绝'}
                    </Button>
                  </div>
                )}
              </div>
            ))
          )}
        </div>
      )}

      {/* Certifications Tab */}
      {tab === 'certifications' && (
        <div className="space-y-4">
          {loadingCerts ? (
            <div className="text-center py-12"><Loader2 className="w-6 h-6 animate-spin mx-auto text-[#64748B]" /></div>
          ) : pendingCerts.length === 0 ? (
            <div className="text-center py-16">
              <CheckCircle className="w-12 h-12 mx-auto mb-4 text-emerald-400" />
              <p className="text-[#64748B] font-medium">暂无待审核的认证申请</p>
            </div>
          ) : (
            pendingCerts.map(cert => (
              <div key={cert.id} className="bg-white rounded-2xl border border-[#E2E8F0] p-6">
                <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <Badge className="bg-blue-50 text-blue-700 text-xs">{cert.certLevel.toUpperCase()}级认证</Badge>
                      <Badge className="bg-amber-50 text-amber-700 text-xs">待审核</Badge>
                    </div>
                    <h3 className="font-bold text-[#1E293B] mb-1">{cert.username}</h3>
                    <div className="grid grid-cols-2 gap-2 text-sm text-[#64748B]">
                      <span>院校：{cert.institution}</span>
                      <span>院系：{cert.department}</span>
                      <span>职务：{cert.position}</span>
                      <span>邮箱：{cert.email}</span>
                    </div>
                    <p className="text-xs text-[#64748B] mt-2">提交时间：{new Date(cert.createdAt).toLocaleString('zh-CN')}</p>
                  </div>
                  <div className="flex gap-2 flex-shrink-0">
                    <Button
                      onClick={() => handleCertReview(cert.id, 'approved')}
                      disabled={reviewingId === cert.id}
                      size="sm"
                      className="bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl"
                    >
                      {reviewingId === cert.id ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <><CheckCircle className="w-3.5 h-3.5 mr-1" />通过</>}
                    </Button>
                    <Button
                      onClick={() => handleCertReview(cert.id, 'rejected', '材料不符合要求')}
                      disabled={reviewingId === cert.id}
                      size="sm"
                      variant="outline"
                      className="border-red-200 text-red-600 hover:bg-red-50 rounded-xl"
                    >
                      <XCircle className="w-3.5 h-3.5 mr-1" />拒绝
                    </Button>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      )}
    </div>
  );
}
