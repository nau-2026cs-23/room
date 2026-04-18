import { useState, useEffect } from 'react';
import { Shield, CheckCircle, XCircle, Eye, Users, Flag, BookOpen, Clock } from 'lucide-react';
import { getPendingResources, approveResource, rejectResource, getAdminUsers, verifyTeacher, getAdminReports } from '../../lib/api';
import type { Resource, Report, ViewType } from '../../types';
import { RESOURCE_TYPE_LABELS, SUBJECT_LABELS, STAGE_LABELS } from '../../types';
import { toast } from 'sonner';

type AdminTab = 'pending' | 'users' | 'reports';

interface AdminViewProps {
  onNavigate: (view: ViewType, resourceId?: string) => void;
}

const AdminView = ({ onNavigate }: AdminViewProps) => {
  const [activeTab, setActiveTab] = useState<AdminTab>('pending');
  const [pendingResources, setPendingResources] = useState<Resource[]>([]);
  const [users, setUsers] = useState<Record<string, unknown>[]>([]);
  const [reports, setReports] = useState<Report[]>([]);
  const [loading, setLoading] = useState(false);
  const [rejectId, setRejectId] = useState<string | null>(null);
  const [rejectReason, setRejectReason] = useState('');

  useEffect(() => {
    if (activeTab === 'pending') loadPending();
    else if (activeTab === 'users') loadUsers();
    else if (activeTab === 'reports') loadReports();
  }, [activeTab]);

  const loadPending = async () => {
    setLoading(true);
    try {
      const res = await getPendingResources();
      if (res.success) setPendingResources(res.data);
    } catch (e) { console.error(e); } finally { setLoading(false); }
  };

  const loadUsers = async () => {
    setLoading(true);
    try {
      const res = await getAdminUsers();
      if (res.success) setUsers(res.data as Record<string, unknown>[]);
    } catch (e) { console.error(e); } finally { setLoading(false); }
  };

  const loadReports = async () => {
    setLoading(true);
    try {
      const res = await getAdminReports();
      if (res.success) setReports(res.data as Report[]);
    } catch (e) { console.error(e); } finally { setLoading(false); }
  };

  const handleApprove = async (id: string) => {
    try {
      const res = await approveResource(id);
      if (res.success) {
        toast.success('审核通过，已奖励上传者100积分');
        setPendingResources((prev) => prev.filter((r) => r.id !== id));
      }
    } catch { toast.error('操作失败'); }
  };

  const handleReject = async (id: string) => {
    if (!rejectReason.trim()) {
      toast.error('请输入拒绝原因');
      return;
    }
    try {
      const res = await rejectResource(id, rejectReason);
      if (res.success) {
        toast.success('已拒绝该资料');
        setPendingResources((prev) => prev.filter((r) => r.id !== id));
        setRejectId(null);
        setRejectReason('');
      }
    } catch { toast.error('操作失败'); }
  };

  const handleVerifyTeacher = async (userId: string) => {
    try {
      const res = await verifyTeacher(userId);
      if (res.success) {
        toast.success('教师认证已通过');
        loadUsers();
      }
    } catch { toast.error('操作失败'); }
  };

  const tabs: { key: AdminTab; label: string; icon: React.ElementType }[] = [
    { key: 'pending', label: `待审核 (${pendingResources.length})`, icon: Clock },
    { key: 'users', label: '用户管理', icon: Users },
    { key: 'reports', label: '举报处理', icon: Flag },
  ];

  return (
    <div className="min-h-screen bg-[#F4F6FA]">
      {/* Header */}
      <div className="bg-gradient-to-br from-[#1A3A6B] to-[#2E6BE6] py-8">
        <div className="max-w-screen-xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 rounded-xl bg-white/20 flex items-center justify-center">
              <Shield className="w-5 h-5 text-white" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-white">管理后台</h1>
              <p className="text-white/70 text-sm">内容审核与用户管理</p>
            </div>
          </div>
          <div className="flex gap-1">
            {tabs.map((tab) => (
              <button
                key={tab.key}
                onClick={() => setActiveTab(tab.key)}
                className={`flex items-center gap-1.5 px-4 py-2.5 text-sm font-medium rounded-t-xl transition-colors border-b-2 ${
                  activeTab === tab.key ? 'text-white border-white' : 'text-white/60 border-transparent hover:text-white/80'
                }`}
              >
                <tab.icon className="w-4 h-4" />
                {tab.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="max-w-screen-xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Pending Resources */}
        {activeTab === 'pending' && (
          <div>
            {loading ? (
              <div className="text-center py-12 text-[#5A6A85]">加载中...</div>
            ) : pendingResources.length === 0 ? (
              <div className="text-center py-16">
                <CheckCircle className="w-12 h-12 text-green-300 mx-auto mb-4" />
                <p className="text-[#5A6A85]">暂无待审核资料，全部处理完毕！</p>
              </div>
            ) : (
              <div className="space-y-4">
                {pendingResources.map((resource) => (
                  <div key={resource.id} className="bg-white rounded-2xl border border-[#D8E0EE] p-6">
                    <div className="flex items-start gap-4">
                      <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${resource.coverGradient} shrink-0`} />
                      <div className="flex-1 min-w-0">
                        <h3 className="font-semibold text-[#0F1C35] mb-1">{resource.title}</h3>
                        <p className="text-sm text-[#5A6A85] mb-2 line-clamp-2">{resource.description}</p>
                        <div className="flex flex-wrap gap-2 mb-3">
                          <span className="text-xs bg-[#F4F6FA] border border-[#D8E0EE] rounded-full px-2.5 py-1 text-[#5A6A85]">{SUBJECT_LABELS[resource.subject]}</span>
                          <span className="text-xs bg-[#F4F6FA] border border-[#D8E0EE] rounded-full px-2.5 py-1 text-[#5A6A85]">{STAGE_LABELS[resource.stage]}</span>
                          <span className="text-xs bg-[#F4F6FA] border border-[#D8E0EE] rounded-full px-2.5 py-1 text-[#5A6A85]">{RESOURCE_TYPE_LABELS[resource.resourceType]}</span>
                          <span className="text-xs bg-[#F4F6FA] border border-[#D8E0EE] rounded-full px-2.5 py-1 text-[#5A6A85]">上传者：{resource.uploaderName}</span>
                        </div>
                        <div className="flex items-center gap-2 flex-wrap">
                          <button
                            onClick={() => onNavigate('resource-detail', resource.id)}
                            className="flex items-center gap-1.5 px-3 py-1.5 text-xs text-[#5A6A85] border border-[#D8E0EE] rounded-lg hover:border-[#2E6BE6] hover:text-[#2E6BE6] transition-colors"
                          >
                            <Eye className="w-3.5 h-3.5" />
                            预览
                          </button>
                          <button
                            onClick={() => handleApprove(resource.id)}
                            className="flex items-center gap-1.5 px-3 py-1.5 text-xs text-white bg-[#16A34A] rounded-lg hover:bg-green-700 transition-colors"
                          >
                            <CheckCircle className="w-3.5 h-3.5" />
                            通过审核
                          </button>
                          <button
                            onClick={() => setRejectId(rejectId === resource.id ? null : resource.id)}
                            className="flex items-center gap-1.5 px-3 py-1.5 text-xs text-white bg-red-500 rounded-lg hover:bg-red-600 transition-colors"
                          >
                            <XCircle className="w-3.5 h-3.5" />
                            拒绝
                          </button>
                        </div>
                        {rejectId === resource.id && (
                          <div className="mt-3 flex gap-2">
                            <input
                              type="text"
                              value={rejectReason}
                              onChange={(e) => setRejectReason(e.target.value)}
                              placeholder="请输入拒绝原因"
                              className="flex-1 text-sm border border-[#D8E0EE] rounded-lg px-3 py-2 focus:outline-none focus:ring-1 focus:ring-red-400"
                            />
                            <button
                              onClick={() => handleReject(resource.id)}
                              className="px-3 py-2 bg-red-500 text-white text-sm rounded-lg hover:bg-red-600 transition-colors"
                            >
                              确认拒绝
                            </button>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Users */}
        {activeTab === 'users' && (
          <div>
            {loading ? (
              <div className="text-center py-12 text-[#5A6A85]">加载中...</div>
            ) : (
              <div className="bg-white rounded-2xl border border-[#D8E0EE] overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b border-[#D8E0EE] bg-[#F4F6FA]">
                        <th className="text-left text-xs font-semibold text-[#5A6A85] px-4 py-3">用户</th>
                        <th className="text-left text-xs font-semibold text-[#5A6A85] px-4 py-3">角色</th>
                        <th className="text-left text-xs font-semibold text-[#5A6A85] px-4 py-3">积分</th>
                        <th className="text-left text-xs font-semibold text-[#5A6A85] px-4 py-3">教师认证</th>
                        <th className="text-left text-xs font-semibold text-[#5A6A85] px-4 py-3">操作</th>
                      </tr>
                    </thead>
                    <tbody>
                      {users.map((user) => (
                        <tr key={String(user.id)} className="border-b border-[#D8E0EE] last:border-0 hover:bg-[#F4F6FA] transition-colors">
                          <td className="px-4 py-3">
                            <div className="flex items-center gap-2">
                              <div className="w-7 h-7 rounded-full bg-[#1A3A6B] flex items-center justify-center text-white text-xs font-bold">{String(user.name ?? '').charAt(0)}</div>
                              <div>
                                <p className="text-sm font-medium text-[#0F1C35]">{String(user.name ?? '')}</p>
                                <p className="text-xs text-[#5A6A85]">{String(user.email ?? '')}</p>
                              </div>
                            </div>
                          </td>
                          <td className="px-4 py-3">
                            <span className={`text-xs font-medium rounded-full px-2.5 py-1 ${
                              user.role === 'admin' ? 'bg-red-100 text-red-600' :
                              user.role === 'teacher' ? 'bg-amber-100 text-amber-700' :
                              'bg-blue-100 text-[#2E6BE6]'
                            }`}>
                              {user.role === 'admin' ? '管理员' : user.role === 'teacher' ? '教师' : '学生'}
                            </span>
                          </td>
                          <td className="px-4 py-3 text-sm text-[#0F1C35]">{String(user.points ?? 0)}</td>
                          <td className="px-4 py-3">
                            <span className={`text-xs font-medium ${
                              user.isTeacherVerified ? 'text-green-600' :
                              user.teacherVerifyStatus === 'pending' ? 'text-amber-600' : 'text-[#5A6A85]'
                            }`}>
                              {user.isTeacherVerified ? '已认证' : user.teacherVerifyStatus === 'pending' ? '待审核' : '未申请'}
                            </span>
                          </td>
                          <td className="px-4 py-3">
                            {user.teacherVerifyStatus === 'pending' && !user.isTeacherVerified && (
                              <button
                                onClick={() => handleVerifyTeacher(String(user.id))}
                                className="text-xs text-white bg-[#F59E0B] rounded-lg px-3 py-1.5 hover:bg-amber-500 transition-colors"
                              >
                                通过认证
                              </button>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Reports */}
        {activeTab === 'reports' && (
          <div>
            {loading ? (
              <div className="text-center py-12 text-[#5A6A85]">加载中...</div>
            ) : reports.length === 0 ? (
              <div className="text-center py-16">
                <Flag className="w-12 h-12 text-[#D8E0EE] mx-auto mb-4" />
                <p className="text-[#5A6A85]">暂无举报记录</p>
              </div>
            ) : (
              <div className="space-y-3">
                {reports.map((report) => (
                  <div key={String(report.id)} className="bg-white rounded-xl border border-[#D8E0EE] p-4">
                    <div className="flex items-start justify-between">
                      <div>
                        <div className="flex items-center gap-2 mb-1">
                          <Flag className="w-4 h-4 text-red-500" />
                          <span className="text-sm font-medium text-[#0F1C35]">
                            {report.reason === 'copyright' ? '侵权盗版' : report.reason === 'inappropriate' ? '不当内容' : report.reason === 'spam' ? '广告垃圾' : '其他'}
                          </span>
                        </div>
                        {report.description && <p className="text-xs text-[#5A6A85]">{String(report.description)}</p>}
                        <p className="text-xs text-[#5A6A85] mt-1">{new Date(String(report.createdAt)).toLocaleDateString('zh-CN')}</p>
                      </div>
                      <span className={`text-xs font-medium rounded-full px-2.5 py-1 ${
                        report.status === 'resolved' ? 'bg-green-100 text-green-600' : 'bg-amber-100 text-amber-700'
                      }`}>
                        {report.status === 'resolved' ? '已处理' : '待处理'}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminView;
