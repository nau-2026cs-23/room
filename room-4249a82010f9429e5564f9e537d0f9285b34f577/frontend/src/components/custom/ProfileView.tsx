import { useState, useEffect } from 'react';
import { User, Star, Upload, BookOpen, Heart, TrendingUp, TrendingDown, CheckCircle, Clock, XCircle, Trash2, Plus, Users, Key } from 'lucide-react';
import { getMyUploads, getMyFavorites, getMyPoints, dailyCheckin, deleteResource, applyTeacherVerify, getMyClasses, createClass, joinClass, getClassMembers } from '../../lib/api';
import { getResources } from '../../lib/api';
import type { Resource, Favorite, PointsTransaction, ClassItem, ClassMember, ViewType } from '../../types';
import { RESOURCE_TYPE_LABELS, SUBJECT_LABELS } from '../../types';
import { toast } from 'sonner';
import { useAuth } from '../../contexts/AuthContext';
import { getCurrentUser } from '../../lib/api';

type ProfileTab = 'overview' | 'favorites' | 'uploads' | 'points' | 'classes';

interface ProfileViewProps {
  onNavigate: (view: ViewType, resourceId?: string) => void;
  initialTab?: ProfileTab;
}

const ProfileView = ({ onNavigate, initialTab = 'overview' }: ProfileViewProps) => {
  const { logout } = useAuth();
  const [activeTab, setActiveTab] = useState<ProfileTab>(initialTab);
  const [userInfo, setUserInfo] = useState<{ name: string; email: string; role: string; points: number; isTeacherVerified: boolean; teacherVerifyStatus: string } | null>(null);
  const [uploads, setUploads] = useState<Resource[]>([]);
  const [favorites, setFavorites] = useState<Favorite[]>([]);
  const [favFolders, setFavFolders] = useState<{ folderName: string; count: number }[]>([]);
  const [activeFavFolder, setActiveFavFolder] = useState('');
  const [points, setPoints] = useState<{ balance: number; transactions: PointsTransaction[] }>({ balance: 0, transactions: [] });
  const [classes, setClasses] = useState<ClassItem[]>([]);
  const [classMembers, setClassMembers] = useState<Record<string, ClassMember[]>>({});
  const [loading, setLoading] = useState(false);
  const [showCreateClass, setShowCreateClass] = useState(false);
  const [showJoinClass, setShowJoinClass] = useState(false);
  const [newClassName, setNewClassName] = useState('');
  const [newClassDesc, setNewClassDesc] = useState('');
  const [joinCode, setJoinCode] = useState('');
  const [favoriteResources, setFavoriteResources] = useState<Resource[]>([]);

  useEffect(() => {
    loadUserInfo();
  }, []);

  useEffect(() => {
    if (activeTab === 'uploads') loadUploads();
    else if (activeTab === 'favorites') loadFavorites();
    else if (activeTab === 'points') loadPoints();
    else if (activeTab === 'classes') loadClasses();
  }, [activeTab]);

  const loadUserInfo = async () => {
    try {
      const res = await getCurrentUser();
      if (res.success) setUserInfo(res.data.user as typeof userInfo);
    } catch (e) { console.error(e); }
  };

  const loadUploads = async () => {
    setLoading(true);
    try {
      const res = await getMyUploads();
      if (res.success) setUploads(res.data);
    } catch (e) { console.error(e); } finally { setLoading(false); }
  };

  const loadFavorites = async () => {
    setLoading(true);
    try {
      const res = await getMyFavorites();
      if (res.success) {
        setFavorites(res.data.favorites);
        setFavFolders(res.data.folders);
        // Load resource details for favorites
        const resourceIds = res.data.favorites.map((f) => f.resourceId);
        if (resourceIds.length > 0) {
          const allRes = await getResources({});
          if (allRes.success) {
            setFavoriteResources(allRes.data.filter((r) => resourceIds.includes(r.id)));
          }
        }
      }
    } catch (e) { console.error(e); } finally { setLoading(false); }
  };

  const loadPoints = async () => {
    setLoading(true);
    try {
      const res = await getMyPoints();
      if (res.success) setPoints(res.data);
    } catch (e) { console.error(e); } finally { setLoading(false); }
  };

  const loadClasses = async () => {
    setLoading(true);
    try {
      const res = await getMyClasses();
      if (res.success) setClasses(res.data);
    } catch (e) { console.error(e); } finally { setLoading(false); }
  };

  const handleCheckin = async () => {
    try {
      const res = await dailyCheckin();
      if (res.success) {
        toast.success('签到成功', { description: '+50 积分' });
        loadPoints();
        loadUserInfo();
      }
    } catch { toast.error('签到失败'); }
  };

  const handleDeleteUpload = async (id: string) => {
    try {
      const res = await deleteResource(id);
      if (res.success) {
        toast.success('资料已下架');
        setUploads((prev) => prev.filter((u) => u.id !== id));
      }
    } catch { toast.error('操作失败'); }
  };

  const handleApplyTeacher = async () => {
    try {
      const res = await applyTeacherVerify();
      if (res.success) {
        toast.success('申请已提交', { description: '审核通过后将获得教师权限' });
        loadUserInfo();
      }
    } catch { toast.error('申请失败'); }
  };

  const handleCreateClass = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await createClass({ name: newClassName, description: newClassDesc });
      if (res.success) {
        toast.success('班级创建成功', { description: `班级码：${res.data.classCode}` });
        setShowCreateClass(false);
        setNewClassName('');
        setNewClassDesc('');
        loadClasses();
      }
    } catch { toast.error('创建失败'); }
  };

  const handleJoinClass = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await joinClass(joinCode);
      if (res.success) {
        toast.success(`已加入班级：${res.data.class.name}`);
        setShowJoinClass(false);
        setJoinCode('');
      }
    } catch { toast.error('加入失败，请检查班级码'); }
  };

  const handleLoadMembers = async (classId: string) => {
    if (classMembers[classId]) return;
    try {
      const res = await getClassMembers(classId);
      if (res.success) setClassMembers((prev) => ({ ...prev, [classId]: res.data }));
    } catch (e) { console.error(e); }
  };

  const tabs: { key: ProfileTab; label: string; icon: React.ElementType }[] = [
    { key: 'overview', label: '概览', icon: User },
    { key: 'favorites', label: '收藏夹', icon: Heart },
    { key: 'uploads', label: '我的上传', icon: Upload },
    { key: 'points', label: '积分中心', icon: Star },
    { key: 'classes', label: '班级管理', icon: Users },
  ];

  const statusIcon = { pending: Clock, approved: CheckCircle, rejected: XCircle };
  const statusColor = { pending: 'text-amber-500', approved: 'text-green-500', rejected: 'text-red-500' };
  const statusLabel = { pending: '审核中', approved: '已通过', rejected: '未通过' };

  return (
    <div className="min-h-screen bg-[#F4F6FA]">
      {/* Profile Header */}
      <div className="bg-gradient-to-br from-[#1A3A6B] to-[#2E6BE6] pt-8 pb-0">
        <div className="max-w-screen-xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-start gap-4 mb-6">
            <div className="w-16 h-16 rounded-2xl bg-white/20 flex items-center justify-center text-white text-2xl font-bold shrink-0">
              {userInfo?.name?.charAt(0) || 'U'}
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <h1 className="text-xl font-bold text-white">{userInfo?.name || '用户'}</h1>
                {userInfo?.isTeacherVerified && (
                  <span className="text-xs bg-[#F59E0B] text-white rounded-full px-2 py-0.5 font-medium">认证教师</span>
                )}
                {userInfo?.role === 'admin' && (
                  <span className="text-xs bg-red-500 text-white rounded-full px-2 py-0.5 font-medium">管理员</span>
                )}
              </div>
              <p className="text-white/70 text-sm mt-0.5">{userInfo?.email}</p>
              <div className="flex items-center gap-4 mt-2">
                <span className="text-white font-semibold">{userInfo?.points || 0} <span className="text-white/70 font-normal text-sm">积分</span></span>
              </div>
            </div>
          </div>

          {/* Tabs */}
          <div className="flex gap-1 overflow-x-auto">
            {tabs.map((tab) => (
              <button
                key={tab.key}
                onClick={() => setActiveTab(tab.key)}
                className={`flex items-center gap-1.5 px-4 py-3 text-sm font-medium whitespace-nowrap transition-colors border-b-2 ${
                  activeTab === tab.key
                    ? 'text-white border-white'
                    : 'text-white/60 border-transparent hover:text-white/80'
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
        {/* Overview Tab */}
        {activeTab === 'overview' && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              {[
                { label: '当前积分', value: userInfo?.points || 0, unit: '分', color: 'text-[#F59E0B]' },
                { label: '上传资料', value: uploads.length, unit: '份', color: 'text-[#2E6BE6]' },
                { label: '收藏资料', value: favorites.length, unit: '份', color: 'text-[#16A34A]' },
              ].map((stat) => (
                <div key={stat.label} className="bg-white rounded-2xl border border-[#D8E0EE] p-6 text-center">
                  <div className={`text-3xl font-bold ${stat.color}`}>{stat.value}</div>
                  <div className="text-sm text-[#5A6A85] mt-1">{stat.label}</div>
                </div>
              ))}
            </div>

            {/* Teacher Verification */}
            {!userInfo?.isTeacherVerified && (
              <div className="bg-white rounded-2xl border border-[#D8E0EE] p-6">
                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 rounded-xl bg-amber-100 flex items-center justify-center shrink-0">
                    <CheckCircle className="w-5 h-5 text-[#F59E0B]" />
                  </div>
                  <div className="flex-1">
                    <h3 className="font-semibold text-[#0F1C35] mb-1">教师认证</h3>
                    <p className="text-sm text-[#5A6A85] mb-4">完成教师认证后，可以创建班级空间并上传仅对选课学生可见的资料。</p>
                    {userInfo?.teacherVerifyStatus === 'pending' ? (
                      <span className="text-sm text-amber-600 bg-amber-50 rounded-full px-3 py-1">申请已提交，审核中</span>
                    ) : (
                      <button onClick={handleApplyTeacher} className="px-4 py-2 bg-[#F59E0B] text-white text-sm font-medium rounded-lg hover:bg-amber-500 transition-colors">
                        申请教师认证
                      </button>
                    )}
                  </div>
                </div>
              </div>
            )}

            {/* Quick Actions */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              {[
                { label: '上传资料', icon: Upload, view: 'upload' as ViewType, color: 'bg-blue-50 text-[#2E6BE6]' },
                { label: '浏览资料', icon: BookOpen, view: 'resources' as ViewType, color: 'bg-green-50 text-[#16A34A]' },
                { label: '每日签到', icon: Star, action: handleCheckin, color: 'bg-amber-50 text-[#F59E0B]' },
                { label: '退出登录', icon: User, action: logout, color: 'bg-red-50 text-red-500' },
              ].map((action) => (
                <button
                  key={action.label}
                  onClick={() => action.view ? onNavigate(action.view) : action.action?.()}
                  className={`flex flex-col items-center gap-2 p-4 rounded-xl border border-[#D8E0EE] bg-white hover:shadow-sm transition-all`}
                >
                  <div className={`w-10 h-10 rounded-xl ${action.color} flex items-center justify-center`}>
                    <action.icon className="w-5 h-5" />
                  </div>
                  <span className="text-xs font-medium text-[#0F1C35]">{action.label}</span>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Favorites Tab */}
        {activeTab === 'favorites' && (
          <div>
            {/* Folder Filter */}
            {favFolders.length > 0 && (
              <div className="flex gap-2 overflow-x-auto pb-2 mb-6">
                <button
                  onClick={() => setActiveFavFolder('')}
                  className={`px-4 py-2 text-sm font-medium rounded-full whitespace-nowrap transition-colors ${
                    activeFavFolder === '' ? 'bg-[#1A3A6B] text-white' : 'bg-white border border-[#D8E0EE] text-[#5A6A85] hover:border-[#2E6BE6]'
                  }`}
                >
                  全部 ({favorites.length})
                </button>
                {favFolders.map((f) => (
                  <button
                    key={f.folderName}
                    onClick={() => setActiveFavFolder(f.folderName)}
                    className={`px-4 py-2 text-sm font-medium rounded-full whitespace-nowrap transition-colors ${
                      activeFavFolder === f.folderName ? 'bg-[#1A3A6B] text-white' : 'bg-white border border-[#D8E0EE] text-[#5A6A85] hover:border-[#2E6BE6]'
                    }`}
                  >
                    📁 {f.folderName} ({f.count})
                  </button>
                ))}
              </div>
            )}
            {loading ? (
              <div className="text-center py-12 text-[#5A6A85]">加载中...</div>
            ) : favorites.length === 0 ? (
              <div className="text-center py-16">
                <Heart className="w-12 h-12 text-[#D8E0EE] mx-auto mb-4" />
                <p className="text-[#5A6A85]">暂无收藏资料</p>
                <button onClick={() => onNavigate('resources')} className="mt-4 px-6 py-2.5 bg-[#1A3A6B] text-white rounded-xl text-sm font-semibold">浏览资料</button>
              </div>
            ) : (
              <div className="space-y-3">
                {favorites
                  .filter((f) => !activeFavFolder || f.folderName === activeFavFolder)
                  .map((fav) => {
                    const res = favoriteResources.find((r) => r.id === fav.resourceId);
                    return (
                      <div key={fav.id} className="bg-white rounded-xl border border-[#D8E0EE] p-4 flex items-center gap-4">
                        <div className={`w-10 h-10 rounded-lg bg-gradient-to-br ${res?.coverGradient || 'from-blue-500 to-blue-700'} shrink-0`} />
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-[#0F1C35] truncate">{res?.title || '资料'}</p>
                          <p className="text-xs text-[#5A6A85]">{fav.folderName} · {new Date(fav.createdAt).toLocaleDateString('zh-CN')}</p>
                        </div>
                        {res && (
                          <button onClick={() => onNavigate('resource-detail', res.id)} className="text-xs text-[#2E6BE6] hover:underline shrink-0">查看</button>
                        )}
                      </div>
                    );
                  })}
              </div>
            )}
          </div>
        )}

        {/* Uploads Tab */}
        {activeTab === 'uploads' && (
          <div>
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-lg font-bold text-[#0F1C35]">我的上传 ({uploads.length})</h2>
              <button onClick={() => onNavigate('upload')} className="flex items-center gap-2 px-4 py-2 bg-[#1A3A6B] text-white text-sm font-medium rounded-xl hover:bg-[#2E6BE6] transition-colors">
                <Plus className="w-4 h-4" />
                上传新资料
              </button>
            </div>
            {loading ? (
              <div className="text-center py-12 text-[#5A6A85]">加载中...</div>
            ) : uploads.length === 0 ? (
              <div className="text-center py-16">
                <Upload className="w-12 h-12 text-[#D8E0EE] mx-auto mb-4" />
                <p className="text-[#5A6A85]">暂无上传记录</p>
              </div>
            ) : (
              <div className="space-y-3">
                {uploads.map((upload) => {
                  const StatusIcon = statusIcon[upload.status as keyof typeof statusIcon] || Clock;
                  return (
                    <div key={upload.id} className="bg-white rounded-xl border border-[#D8E0EE] p-4 flex items-center gap-4">
                      <div className={`w-10 h-10 rounded-lg bg-gradient-to-br ${upload.coverGradient} shrink-0`} />
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-[#0F1C35] truncate">{upload.title}</p>
                        <p className="text-xs text-[#5A6A85]">{SUBJECT_LABELS[upload.subject]} · {RESOURCE_TYPE_LABELS[upload.resourceType]} · {upload.downloadCount} 下载</p>
                      </div>
                      <div className="flex items-center gap-2 shrink-0">
                        <div className={`flex items-center gap-1 text-xs font-medium ${statusColor[upload.status as keyof typeof statusColor] || 'text-gray-500'}`}>
                          <StatusIcon className="w-3.5 h-3.5" />
                          {statusLabel[upload.status as keyof typeof statusLabel] || upload.status}
                        </div>
                        <button
                          onClick={() => handleDeleteUpload(upload.id)}
                          className="p-1.5 text-[#5A6A85] hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {/* Points Tab */}
        {activeTab === 'points' && (
          <div className="space-y-6">
            <div className="bg-gradient-to-br from-[#1A3A6B] to-[#2E6BE6] rounded-2xl p-6 text-white">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-white/70 text-sm">当前积分</p>
                  <div className="text-4xl font-bold mt-1">{points.balance}</div>
                  <p className="text-white/60 text-xs mt-1">可用于下载付费资料</p>
                </div>
                <button
                  onClick={handleCheckin}
                  className="px-4 py-2 bg-[#F59E0B] text-white text-sm font-semibold rounded-xl hover:bg-amber-500 transition-colors"
                >
                  每日签到 +50
                </button>
              </div>
            </div>

            <div className="bg-white rounded-2xl border border-[#D8E0EE] p-6">
              <h3 className="font-semibold text-[#0F1C35] mb-4">积分明细</h3>
              {loading ? (
                <div className="text-center py-8 text-[#5A6A85]">加载中...</div>
              ) : points.transactions.length === 0 ? (
                <p className="text-sm text-[#5A6A85] text-center py-8">暂无积分记录</p>
              ) : (
                <div className="space-y-3">
                  {points.transactions.map((tx) => (
                    <div key={tx.id} className="flex items-center justify-between py-3 border-b border-[#D8E0EE] last:border-0">
                      <div className="flex items-center gap-3">
                        <div className={`w-8 h-8 rounded-full flex items-center justify-center ${tx.amount > 0 ? 'bg-green-100' : 'bg-red-100'}`}>
                          {tx.amount > 0 ? <TrendingUp className="w-4 h-4 text-green-600" /> : <TrendingDown className="w-4 h-4 text-red-500" />}
                        </div>
                        <div>
                          <p className="text-sm font-medium text-[#0F1C35]">{tx.description}</p>
                          <p className="text-xs text-[#5A6A85]">{new Date(tx.createdAt).toLocaleDateString('zh-CN')}</p>
                        </div>
                      </div>
                      <span className={`text-sm font-bold ${tx.amount > 0 ? 'text-green-600' : 'text-red-500'}`}>
                        {tx.amount > 0 ? '+' : ''}{tx.amount}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {/* Classes Tab */}
        {activeTab === 'classes' && (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-bold text-[#0F1C35]">班级管理</h2>
              <div className="flex gap-2">
                {userInfo?.isTeacherVerified && (
                  <button
                    onClick={() => setShowCreateClass(true)}
                    className="flex items-center gap-1.5 px-4 py-2 bg-[#1A3A6B] text-white text-sm font-medium rounded-xl hover:bg-[#2E6BE6] transition-colors"
                  >
                    <Plus className="w-4 h-4" />
                    创建班级
                  </button>
                )}
                <button
                  onClick={() => setShowJoinClass(true)}
                  className="flex items-center gap-1.5 px-4 py-2 border border-[#D8E0EE] text-[#5A6A85] text-sm font-medium rounded-xl hover:border-[#2E6BE6] hover:text-[#2E6BE6] transition-colors"
                >
                  <Key className="w-4 h-4" />
                  加入班级
                </button>
              </div>
            </div>

            {/* Create Class Form */}
            {showCreateClass && (
              <form onSubmit={handleCreateClass} className="bg-white rounded-2xl border border-[#D8E0EE] p-6">
                <h3 className="font-semibold text-[#0F1C35] mb-4">创建新班级</h3>
                <div className="space-y-3">
                  <input
                    type="text"
                    value={newClassName}
                    onChange={(e) => setNewClassName(e.target.value)}
                    placeholder="班级名称"
                    required
                    className="w-full text-sm border border-[#D8E0EE] rounded-lg px-3 py-2.5 focus:outline-none focus:ring-1 focus:ring-[#2E6BE6]"
                  />
                  <input
                    type="text"
                    value={newClassDesc}
                    onChange={(e) => setNewClassDesc(e.target.value)}
                    placeholder="班级简介（可选）"
                    className="w-full text-sm border border-[#D8E0EE] rounded-lg px-3 py-2.5 focus:outline-none focus:ring-1 focus:ring-[#2E6BE6]"
                  />
                  <div className="flex gap-2">
                    <button type="submit" className="px-4 py-2 bg-[#1A3A6B] text-white text-sm font-medium rounded-lg hover:bg-[#2E6BE6] transition-colors">创建</button>
                    <button type="button" onClick={() => setShowCreateClass(false)} className="px-4 py-2 text-sm text-[#5A6A85]">取消</button>
                  </div>
                </div>
              </form>
            )}

            {/* Join Class Form */}
            {showJoinClass && (
              <form onSubmit={handleJoinClass} className="bg-white rounded-2xl border border-[#D8E0EE] p-6">
                <h3 className="font-semibold text-[#0F1C35] mb-4">加入班级</h3>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={joinCode}
                    onChange={(e) => setJoinCode(e.target.value.toUpperCase())}
                    placeholder="输入班级码"
                    required
                    className="flex-1 text-sm border border-[#D8E0EE] rounded-lg px-3 py-2.5 focus:outline-none focus:ring-1 focus:ring-[#2E6BE6] uppercase"
                  />
                  <button type="submit" className="px-4 py-2 bg-[#1A3A6B] text-white text-sm font-medium rounded-lg hover:bg-[#2E6BE6] transition-colors">加入</button>
                  <button type="button" onClick={() => setShowJoinClass(false)} className="px-3 py-2 text-sm text-[#5A6A85]">取消</button>
                </div>
              </form>
            )}

            {loading ? (
              <div className="text-center py-12 text-[#5A6A85]">加载中...</div>
            ) : classes.length === 0 ? (
              <div className="text-center py-16">
                <Users className="w-12 h-12 text-[#D8E0EE] mx-auto mb-4" />
                <p className="text-[#5A6A85]">暂无班级</p>
                {!userInfo?.isTeacherVerified && (
                  <p className="text-xs text-[#5A6A85] mt-2">完成教师认证后可创建班级</p>
                )}
              </div>
            ) : (
              <div className="space-y-4">
                {classes.map((cls) => (
                  <div key={cls.id} className="bg-white rounded-2xl border border-[#D8E0EE] p-6">
                    <div className="flex items-start justify-between mb-4">
                      <div>
                        <h3 className="font-semibold text-[#0F1C35]">{cls.name}</h3>
                        {cls.description && <p className="text-sm text-[#5A6A85] mt-1">{cls.description}</p>}
                      </div>
                      <div className="text-right">
                        <div className="text-xs font-mono bg-[#F4F6FA] border border-[#D8E0EE] rounded-lg px-3 py-1.5 text-[#1A3A6B] font-bold">{cls.classCode}</div>
                        <p className="text-xs text-[#5A6A85] mt-1">班级码</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-4 text-sm text-[#5A6A85]">
                      <span className="flex items-center gap-1"><Users className="w-4 h-4" />{cls.memberCount} 名学生</span>
                      <span className="flex items-center gap-1"><BookOpen className="w-4 h-4" />{cls.resourceCount || 0} 份资料</span>
                    </div>
                    <button
                      onClick={() => handleLoadMembers(cls.id)}
                      className="mt-3 text-xs text-[#2E6BE6] hover:underline"
                    >
                      {classMembers[cls.id] ? '隐藏成员' : '查看成员名单'}
                    </button>
                    {classMembers[cls.id] && (
                      <div className="mt-3 pt-3 border-t border-[#D8E0EE]">
                        <div className="flex flex-wrap gap-2">
                          {classMembers[cls.id].map((m) => (
                            <span key={m.id} className="text-xs bg-[#F4F6FA] border border-[#D8E0EE] rounded-full px-2.5 py-1 text-[#5A6A85]">{m.userName}</span>
                          ))}
                        </div>
                      </div>
                    )}
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

export default ProfileView;
