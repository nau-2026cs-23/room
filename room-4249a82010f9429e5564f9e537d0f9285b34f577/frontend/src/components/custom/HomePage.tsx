import { useState, useEffect } from 'react';
import { Search, BookOpen, FileText, GraduationCap, Scale, Star, Download, Upload, Users, CheckCircle, BarChart3, ArrowRight } from 'lucide-react';
import { getResources, getResourceStats } from '../../lib/api';
import ResourceCard from './ResourceCard';
import type { Resource, ViewType } from '../../types';

interface HomePageProps {
  onNavigate: (view: ViewType, resourceId?: string) => void;
}

const SUBJECTS = [
  { key: '', label: '全部' },
  { key: 'math', label: '数学类' },
  { key: 'cs', label: '计算机' },
  { key: 'english', label: '英语' },
  { key: 'physics', label: '物理' },
  { key: 'economics', label: '经济学' },
  { key: 'law', label: '法学' },
  { key: 'medicine', label: '医学' },
  { key: 'management', label: '管理学' },
];

const HOT_SEARCHES = ['高等数学', '考研英语', '行测真题', '数据结构', '申论范文'];

const HomePage = ({ onNavigate }: HomePageProps) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [activeSubject, setActiveSubject] = useState('');
  const [sortBy, setSortBy] = useState('latest');
  const [resources, setResources] = useState<(Resource & { avgRating: number; reviewCount: number })[]>([]);
  const [stats, setStats] = useState({ total: 0, pending: 0 });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, [activeSubject, sortBy]);

  const loadData = async () => {
    setLoading(true);
    try {
      const [resourcesRes, statsRes] = await Promise.all([
        getResources({ subject: activeSubject, sortBy: sortBy === 'downloads' ? 'downloads' : '' }),
        getResourceStats(),
      ]);
      if (resourcesRes.success) setResources(resourcesRes.data);
      if (statsRes.success) setStats(statsRes.data);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      onNavigate('resources');
    }
  };

  const handleHotSearch = (term: string) => {
    setSearchQuery(term);
    onNavigate('resources');
  };

  return (
    <div className="min-h-screen bg-[#F4F6FA]">
      {/* Hero */}
      <section className="relative overflow-hidden bg-[#1A3A6B] pt-16 pb-20">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-0 right-0 w-96 h-96 rounded-full bg-[#2E6BE6] blur-3xl translate-x-1/3 -translate-y-1/3" />
          <div className="absolute bottom-0 left-0 w-80 h-80 rounded-full bg-[#F59E0B] blur-3xl -translate-x-1/3 translate-y-1/3" />
        </div>
        <div className="relative max-w-screen-xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-3xl">
            <div className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-sm border border-white/20 rounded-full px-4 py-1.5 mb-6">
              <span className="w-2 h-2 rounded-full bg-[#F59E0B] animate-pulse" />
              <span className="text-sm text-white/90 font-medium">已收录 {stats.total.toLocaleString() || '12,400'}+ 份优质学习资料</span>
            </div>
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-white leading-tight mb-6">
              找到你需要的<br />
              <span className="text-[#F59E0B]">每一份资料</span>
            </h1>
            <p className="text-lg text-white/75 leading-relaxed mb-8 max-w-xl">
              覆盖本科全学段、考研、考公考编的综合性学习资料平台。高质量笔记、真题、课件，一站式获取。
            </p>
            <form onSubmit={handleSearch} className="flex flex-col sm:flex-row gap-3 mb-8">
              <div className="flex-1 relative">
                <input
                  type="search"
                  placeholder="搜索资料，如：高等数学期末真题、考研英语笔记…"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-12 pr-4 py-4 rounded-xl text-[#0F1C35] bg-white text-base shadow-[0_8px_32px_-4px_rgb(0_0_0_/_0.2)] border border-white/20 focus:outline-none focus:ring-2 focus:ring-[#F59E0B] placeholder:text-[#5A6A85] transition-all duration-300"
                />
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-[#5A6A85]" />
              </div>
              <button
                type="submit"
                className="px-8 py-4 bg-[#F59E0B] text-white font-semibold rounded-xl hover:bg-amber-500 transition-all duration-200 shadow-[0_8px_24px_-4px_rgb(245_158_11_/_0.5)] whitespace-nowrap transform hover:scale-105 active:scale-95"
              >
                立即搜索
              </button>
            </form>
            <div className="flex flex-wrap gap-2 mb-10">
              <span className="text-sm text-white/60 self-center">热门：</span>
              {HOT_SEARCHES.map((term) => (
                <button
                  key={term}
                  onClick={() => handleHotSearch(term)}
                  className="text-sm text-white/80 hover:text-white bg-white/10 hover:bg-white/20 rounded-full px-3 py-1 transition-all duration-200 transform hover:scale-105"
                >
                  {term}
                </button>
              ))}
            </div>
            {/* Stats */}
            <div className="grid grid-cols-3 gap-6 max-w-lg">
              <div className="text-center transition-all duration-300 hover:scale-105">
                <div className="text-3xl font-bold text-white">5万+</div>
                <div className="text-sm text-white/60 mt-1">注册用户</div>
              </div>
              <div className="text-center border-x border-white/20 transition-all duration-300 hover:scale-105">
                <div className="text-3xl font-bold text-white">1.2万</div>
                <div className="text-sm text-white/60 mt-1">资料总量</div>
              </div>
              <div className="text-center transition-all duration-300 hover:scale-105">
                <div className="text-3xl font-bold text-white">200+</div>
                <div className="text-sm text-white/60 mt-1">认证教师</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Category Grid */}
      <section className="py-12 bg-white border-b border-[#D8E0EE]">
        <div className="max-w-screen-xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between mb-8">
            <h2 className="text-2xl font-bold text-[#0F1C35]">按学习阶段浏览</h2>
            <button 
              onClick={() => onNavigate('resources')} 
              className="text-sm font-medium text-[#2E6BE6] hover:underline flex items-center gap-1 transition-all duration-200 hover:translate-x-1"
            >
              查看全部分类 <ArrowRight className="w-4 h-4 transition-transform duration-200 hover:translate-x-0.5" />
            </button>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            {[
              { icon: BookOpen, label: '基础课程', sub: '大一 · 大二', count: '3,240', color: 'bg-blue-50 group-hover:bg-[#2E6BE6]', iconColor: 'text-[#2E6BE6] group-hover:text-white', border: 'border-[#D8E0EE] hover:border-[#2E6BE6]', countColor: 'text-[#2E6BE6]', view: 'basic' as const },
              { icon: FileText, label: '专业课程', sub: '大三 · 大四', count: '2,810', color: 'bg-purple-50 group-hover:bg-[#2E6BE6]', iconColor: 'text-purple-500 group-hover:text-white', border: 'border-[#D8E0EE] hover:border-[#2E6BE6]', countColor: 'text-[#2E6BE6]', view: 'professional' as const },
              { icon: GraduationCap, label: '考研备考', sub: '真题 · 笔记 · 经验', count: '4,920', color: 'bg-amber-100 group-hover:bg-[#F59E0B]', iconColor: 'text-[#F59E0B] group-hover:text-white', border: 'border-[#F59E0B]', countColor: 'text-[#F59E0B]', view: 'postgrad' as const },
              { icon: Scale, label: '考公考编', sub: '行测 · 申论 · 真题', count: '1,430', color: 'bg-green-50 group-hover:bg-[#16A34A]', iconColor: 'text-[#16A34A] group-hover:text-white', border: 'border-[#D8E0EE] hover:border-[#16A34A]', countColor: 'text-[#16A34A]', view: 'civil' as const },
            ].map((cat) => (
              <button
                key={cat.label}
                onClick={() => onNavigate(cat.view === 'basic' || cat.view === 'professional' ? 'resources' : cat.view)}
                className={`group flex flex-col items-center gap-3 p-6 rounded-2xl border-2 ${cat.border} hover:shadow-[0_8px_24px_-4px_rgb(46_107_230_/_0.15)] transition-all duration-300 bg-white hover:-translate-y-1`}
              >
                <div className={`w-14 h-14 rounded-2xl ${cat.color} flex items-center justify-center transition-all duration-300`}>
                  <cat.icon className={`w-7 h-7 ${cat.iconColor} transition-colors duration-300`} />
                </div>
                <div className="text-center">
                  <div className="font-semibold text-[#0F1C35] text-base">{cat.label}</div>
                  <div className="text-xs text-[#5A6A85] mt-1">{cat.sub}</div>
                  <div className={`text-xs font-medium ${cat.countColor} mt-2`}>{cat.count} 份资料</div>
                </div>
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* Subject Filter + Resource Grid */}
      <section className="py-10 bg-[#F4F6FA]">
        <div className="max-w-screen-xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Subject Filter */}
          <div className="flex items-center gap-3 overflow-x-auto pb-2 mb-6 scrollbar-hide">
            <span className="text-sm font-medium text-[#5A6A85] whitespace-nowrap">学科筛选：</span>
            {SUBJECTS.map((s) => (
              <button
                key={s.key}
                onClick={() => setActiveSubject(s.key)}
                className={`px-4 py-2 text-sm font-medium rounded-full whitespace-nowrap transition-all duration-200 transform hover:scale-105 ${
                  activeSubject === s.key
                    ? 'text-white bg-[#1A3A6B] shadow-sm'
                    : 'text-[#5A6A85] bg-white border border-[#D8E0EE] hover:border-[#2E6BE6] hover:text-[#2E6BE6]'
                }`}
              >
                {s.label}
              </button>
            ))}
          </div>

          {/* Sort + Title */}
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-[#0F1C35]">最新热门资料</h2>
            <div className="flex items-center gap-2">
              {[{ key: 'latest', label: '最新上传' }, { key: 'downloads', label: '下载最多' }].map((s) => (
                <button
                  key={s.key}
                  onClick={() => setSortBy(s.key)}
                  className={`px-3 py-1.5 text-sm font-medium rounded-lg transition-colors duration-200 transform hover:scale-105 ${
                    sortBy === s.key ? 'text-[#2E6BE6] bg-blue-50' : 'text-[#5A6A85] hover:text-[#2E6BE6]'
                  }`}
                >
                  {s.label}
                </button>
              ))}
            </div>
          </div>

          {loading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
              {[...Array(8)].map((_, i) => (
                <div key={i} className="bg-white rounded-2xl border border-[#D8E0EE] overflow-hidden">
                  <div className="h-36 bg-gray-200 animate-pulse" />
                  <div className="p-4 space-y-3">
                    <div className="h-3 bg-gray-200 rounded w-3/4 animate-pulse" />
                    <div className="h-3 bg-gray-200 rounded w-1/2 animate-pulse" />
                    <div className="h-2 bg-gray-200 rounded w-1/3 animate-pulse" />
                  </div>
                </div>
              ))}
            </div>
          ) : resources.length === 0 ? (
            <div className="text-center py-16">
              <BookOpen className="w-12 h-12 text-[#D8E0EE] mx-auto mb-4" />
              <p className="text-[#5A6A85]">暂无资料，成为第一个贡献者吧！</p>
              <button 
                onClick={() => onNavigate('upload')} 
                className="mt-4 px-6 py-2.5 bg-[#1A3A6B] text-white rounded-xl text-sm font-semibold hover:bg-[#2E6BE6] transition-all duration-200 transform hover:scale-105"
              >
                上传资料
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
              {resources.slice(0, 8).map((r) => (
                <ResourceCard
                  key={r.id}
                  resource={r}
                  onView={(id) => onNavigate('resource-detail', id)}
                />
              ))}
            </div>
          )}

          {resources.length > 8 && (
            <div className="mt-8 text-center">
              <button
                onClick={() => onNavigate('resources')}
                className="px-8 py-3 text-sm font-semibold text-[#1A3A6B] border-2 border-[#1A3A6B] rounded-xl hover:bg-[#1A3A6B] hover:text-white transition-all duration-200 transform hover:scale-105 active:scale-95"
              >
                查看更多资料
              </button>
            </div>
          )}
        </div>
      </section>

      {/* Upload CTA */}
      <section className="py-16 bg-white border-y border-[#D8E0EE]">
        <div className="max-w-screen-xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div>
              <div className="inline-flex items-center gap-2 bg-amber-50 border border-amber-200 rounded-full px-4 py-1.5 mb-6">
                <Star className="w-4 h-4 text-[#F59E0B]" />
                <span className="text-sm font-medium text-amber-700">上传资料，赚取积分</span>
              </div>
              <h2 className="text-3xl font-bold text-[#0F1C35] mb-4">分享你的学习成果<br />帮助更多同学</h2>
              <p className="text-[#5A6A85] leading-relaxed mb-6">
                每上传一份通过审核的资料，即可获得50-200积分奖励。积分可用于下载付费资料，也可兑换专属资料包。
              </p>
              <div className="flex flex-col sm:flex-row gap-3">
                <button
                  onClick={() => onNavigate('upload')}
                  className="flex items-center justify-center gap-2 px-6 py-3 bg-[#1A3A6B] text-white font-semibold rounded-xl hover:bg-[#2E6BE6] transition-all duration-200 shadow-[0_4px_12px_-2px_rgb(26_58_107_/_0.3)] transform hover:scale-105 active:scale-95"
                >
                  <Upload className="w-5 h-5" />
                  立即上传资料
                </button>
                <button
                  onClick={() => onNavigate('points')}
                  className="flex items-center justify-center gap-2 px-6 py-3 text-[#1A3A6B] border-2 border-[#D8E0EE] font-semibold rounded-xl hover:border-[#1A3A6B] transition-all duration-200 transform hover:scale-105"
                >
                  了解积分规则
                </button>
              </div>
            </div>
            <div className="grid grid-cols-3 gap-4">
              {[
                { value: '50+', label: '上传奖励积分', icon: Star },
                { value: '24h', label: '审核时效', icon: CheckCircle },
                { value: '100%', label: '举报处理率', icon: BarChart3 },
              ].map((item) => (
                <div key={item.label} className="bg-[#F4F6FA] rounded-2xl p-5 text-center border border-[#D8E0EE] transition-all duration-300 hover:shadow-md hover:-translate-y-1">
                  <div className="text-2xl font-bold text-[#1A3A6B]">{item.value}</div>
                  <div className="text-xs text-[#5A6A85] mt-1">{item.label}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Teacher Section */}
      <section className="py-16 bg-[#F4F6FA]">
        <div className="max-w-screen-xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-gradient-to-br from-[#1A3A6B] to-[#2E6BE6] rounded-3xl p-8 lg:p-12 relative overflow-hidden">
            <div className="absolute top-0 right-0 w-64 h-64 rounded-full bg-white/5 -translate-y-1/3 translate-x-1/3" />
            <div className="absolute bottom-0 left-0 w-48 h-48 rounded-full bg-white/5 translate-y-1/3 -translate-x-1/3" />
            <div className="relative grid grid-cols-1 lg:grid-cols-2 gap-8 items-center">
              <div>
                <div className="inline-flex items-center gap-2 bg-white/15 backdrop-blur-sm rounded-full px-4 py-1.5 mb-6">
                  <CheckCircle className="w-4 h-4 text-[#F59E0B]" />
                  <span className="text-sm font-medium text-white">教师认证通道</span>
                </div>
                <h2 className="text-3xl font-bold text-white mb-4">高校教师专属功能<br />管理班级，分发资料</h2>
                <p className="text-white/75 leading-relaxed mb-6">
                  完成教师认证后，您可以创建班级空间，上传仅对选课学生可见的课件和习题集，并实时查看学生下载情况。
                </p>
                <div className="flex flex-wrap gap-3 mb-8">
                  {['班级管理', '资料权限控制', '下载统计'].map((feat) => (
                    <div key={feat} className="flex items-center gap-2 bg-white/10 rounded-lg px-3 py-2 transition-all duration-200 hover:bg-white/20">
                      <CheckCircle className="w-4 h-4 text-[#F59E0B]" />
                      <span className="text-sm text-white">{feat}</span>
                    </div>
                  ))}
                </div>
                <button
                  onClick={() => onNavigate('teacher')}
                  className="flex items-center gap-2 px-6 py-3 bg-[#F59E0B] text-white font-semibold rounded-xl hover:bg-amber-500 transition-all duration-200 shadow-[0_4px_16px_-2px_rgb(245_158_11_/_0.4)] transform hover:scale-105 active:scale-95"
                >
                  申请教师认证 <ArrowRight className="w-4 h-4 transition-transform duration-200 hover:translate-x-0.5" />
                </button>
              </div>
              {/* Class Preview */}
              <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-6 border border-white/20 transition-all duration-300 hover:shadow-xl">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-white font-semibold">班级管理面板</h3>
                  <span className="text-xs text-white/60 bg-white/10 rounded-full px-2.5 py-1">示例预览</span>
                </div>
                <div className="space-y-3">
                  {[
                    { code: 'A', name: '2024级计算机科学班', students: 42, resources: 8 },
                    { code: 'B', name: '2023级软件工程班', students: 38, resources: 12 },
                  ].map((cls) => (
                    <div key={cls.code} className="flex items-center justify-between bg-white/10 rounded-xl p-3 transition-all duration-200 hover:bg-white/20">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-lg bg-[#F59E0B] flex items-center justify-center text-white text-xs font-bold">{cls.code}</div>
                        <div>
                          <div className="text-sm font-medium text-white">{cls.name}</div>
                          <div className="text-xs text-white/60">{cls.students}名学生 · {cls.resources}份资料</div>
                        </div>
                      </div>
                      <span className="text-xs text-[#F59E0B] font-medium">活跃</span>
                    </div>
                  ))}
                  <div className="mt-4 pt-4 border-t border-white/20 flex items-center justify-between">
                    <span className="text-xs text-white/60">本周新增下载</span>
                    <span className="text-sm font-bold text-white">234 次</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Personal Space Preview */}
      <section className="py-16 bg-white border-t border-[#D8E0EE]">
        <div className="max-w-screen-xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-[#0F1C35] mb-4">个人学习空间</h2>
            <p className="text-[#5A6A85] max-w-xl mx-auto">管理你的收藏、下载历史和积分，打造专属的学习资料库。</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[
              {
                icon: BookOpen, iconBg: 'bg-blue-100', iconColor: 'text-[#2E6BE6]',
                title: '我的收藏夹', view: 'favorites' as ViewType,
                desc: '创建多个文件夹，分类整理资料。支持自定义分组。',
                tags: ['? 高等数学 (12)', '? 考研英语 (8)', '? 行测资料 (5)'],
              },
              {
                icon: Star, iconBg: 'bg-amber-100', iconColor: 'text-[#F59E0B]',
                title: '积分中心', view: 'points' as ViewType,
                desc: '查看积分明细，了解每次上传和下载的积分变动，用积分兑换更多下载权益。',
                extra: { label: '当前积分', value: '1,240 积分', badge: '+50 今日签到' },
              },
              {
                icon: Upload, iconBg: 'bg-green-100', iconColor: 'text-[#16A34A]',
                title: '我的上传', view: 'my-uploads' as ViewType,
                desc: '查看上传资料的审核状态，管理已发布资料，随时下架或更新内容。',
                uploads: ['高等数学笔记.pdf', '操作系统复习.pdf', '线性代数总结.pdf'],
              },
            ].map((card) => (
              <button
                key={card.title}
                onClick={() => onNavigate(card.view)}
                className="text-left bg-[#F4F6FA] rounded-2xl p-6 border border-[#D8E0EE] hover:shadow-[0_8px_24px_-4px_rgb(26_58_107_/_0.1)] transition-all duration-300 hover:-translate-y-0.5"
              >
                <div className="flex items-center gap-3 mb-4">
                  <div className={`w-10 h-10 rounded-xl ${card.iconBg} flex items-center justify-center`}>
                    <card.icon className={`w-5 h-5 ${card.iconColor}`} />
                  </div>
                  <h3 className="font-semibold text-[#0F1C35]">{card.title}</h3>
                </div>
                <p className="text-sm text-[#5A6A85] mb-4 leading-relaxed">{card.desc}</p>
                {'tags' in card && (
                  <div className="flex flex-wrap gap-2">
                    {card.tags.map((tag) => (
                      <span key={tag} className="text-xs bg-white border border-[#D8E0EE] rounded-full px-3 py-1 text-[#5A6A85] transition-all duration-200 hover:border-[#2E6BE6] hover:text-[#2E6BE6]">{tag}</span>
                    ))}
                  </div>
                )}
                {'extra' in card && card.extra && (
                  <div className="bg-white rounded-xl p-4 border border-[#D8E0EE] transition-all duration-200 hover:shadow-sm">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-xs text-[#5A6A85]">{card.extra.label}</span>
                      <span className="text-xs text-[#16A34A] font-medium">{card.extra.badge}</span>
                    </div>
                    <div className="text-2xl font-bold text-[#1A3A6B]">{card.extra.value}</div>
                  </div>
                )}
                {'uploads' in card && card.uploads && (
                  <div className="space-y-2">
                    {card.uploads.map((u, i) => (
                      <div key={i} className="flex items-center justify-between text-xs">
                        <span className="text-[#5A6A85] truncate">{u}</span>
                        <span className="text-[#16A34A] font-medium bg-green-50 rounded-full px-2 py-0.5 ml-2 shrink-0">已通过</span>
                      </div>
                    ))}
                  </div>
                )}
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-[#1A3A6B] text-white pt-16 pb-8">
        <div className="max-w-screen-xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 mb-12">
            <div className="col-span-2 md:col-span-1">
              <div className="flex items-center gap-2 mb-4">
                <div className="w-8 h-8 rounded-lg bg-white/20 flex items-center justify-center">
                  <BookOpen className="w-5 h-5 text-white" />
                </div>
                <span className="text-xl font-bold">学资库</span>
              </div>
              <p className="text-sm text-white/60 leading-relaxed">覆盖全学段的综合性学习资料共享平台，助力每一位学习者高效备考。</p>
            </div>
            {[
              { title: '资料分类', links: ['基础课程资料', '专业课程资料', '考研备考资料', '考公考编资料'] },
              { title: '功能入口', links: ['上传资料', '我的收藏', '积分中心', '教师认证'] },
              { title: '关于平台', links: ['关于我们', '使用条款', '隐私政策', '联系我们'] },
            ].map((col) => (
              <div key={col.title}>
                <h4 className="font-semibold mb-4 text-sm uppercase tracking-wide text-white/80">{col.title}</h4>
                <ul className="space-y-2">
                  {col.links.map((link) => (
                    <li key={link}><span className="text-sm text-white/60 hover:text-white transition-colors duration-200 cursor-pointer">{link}</span></li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
          <div className="border-t border-white/10 pt-8 flex flex-col sm:flex-row items-center justify-between gap-4">
            <p className="text-sm text-white/40">? 2026 学资库. 保留所有权利。</p>
            <p className="text-sm text-white/40">用户上传资料须遵守版权法规，平台不承担侵权责任。</p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default HomePage;
