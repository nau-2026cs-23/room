import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { resourceApi } from '@/lib/api';
import type { Resource } from '@shared/types/api';
import {
  BookOpen, GraduationCap, FileText, Search, Star, Download,
  ArrowRight, Sparkles, Users, TrendingUp, Bot
} from 'lucide-react';

interface HomePageProps {
  onGoToResources: (filter?: { category?: string; stage?: string }) => void;
  onGoToResource: (id: string) => void;
  onGoToAI: () => void;
}

const CATEGORIES = [
  { id: 'math', label: '数学类', icon: '📐', desc: '高等数学、线性代数、概率论' },
  { id: 'cs', label: '计算机类', icon: '💻', desc: '数据结构、操作系统、编程' },
  { id: 'physics', label: '物理类', icon: '⚛️', desc: '大学物理、量子力学、电磁学' },
  { id: 'english', label: '英语类', icon: '🌐', desc: '四六级、考研英语、雅思' },
  { id: 'economics', label: '经济类', icon: '📊', desc: '微观经济学、宏观经济学' },
  { id: 'law', label: '法学类', icon: '⚖️', desc: '民法、刑法、行政法' },
];

const STAGES = [
  { id: 'undergraduate', label: '本科资料', icon: GraduationCap, color: 'bg-blue-50 text-blue-700 border-blue-200', desc: '期末考试、课件、习题集' },
  { id: 'exam_postgrad', label: '考研资料', icon: BookOpen, color: 'bg-purple-50 text-purple-700 border-purple-200', desc: '历年真题、专业课、备考笔记' },
  { id: 'exam_civil', label: '考公资料', icon: FileText, color: 'bg-emerald-50 text-emerald-700 border-emerald-200', desc: '行测、申论、面试指导' },
  { id: 'graduate', label: '研究生资料', icon: Star, color: 'bg-amber-50 text-amber-700 border-amber-200', desc: '学术论文、科研方法论' },
];

export default function HomePage({ onGoToResources, onGoToResource, onGoToAI }: HomePageProps) {
  const [featured, setFeatured] = useState<Resource[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    resourceApi.list({ pageSize: 6, sortBy: 'downloadCount' }).then(res => {
      if (res.success) setFeatured(res.data.resources);
    }).finally(() => setLoading(false));
  }, []);

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="relative bg-[#0F172A] text-white overflow-hidden">
        <div className="absolute inset-0">
          <img
            src="https://images.unsplash.com/photo-1683319598210-d70486f2f996?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w4MjAxMDd8MHwxfHNlYXJjaHwyfHx1bml2ZXJzaXR5JTIwc3R1ZGVudHMlMjBzdHVkeWluZyUyMGxpYnJhcnl8ZW58MHwwfHx8MTc3NjU3Mzk4OHww&ixlib=rb-4.1.0&q=80&w=1080"
            alt="Library"
            className="w-full h-full object-cover opacity-20"
          />
        </div>
        <div className="relative max-w-screen-xl mx-auto px-4 sm:px-6 lg:px-8 py-20 md:py-28">
          <div className="max-w-3xl">
            <Badge className="bg-[#6366F1]/20 text-[#818CF8] border-[#6366F1]/30 mb-6 text-sm px-3 py-1">
              <Sparkles className="w-3.5 h-3.5 mr-1" />
              全学段学习资料共享平台
            </Badge>
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold leading-tight mb-6">
              找到你需要的<br />
              <span className="text-[#10B981]">&#20808;&#36827;&#23398;&#20064;&#36164;&#26009;</span>
            </h1>
            <p className="text-lg text-slate-300 mb-8 leading-relaxed max-w-2xl">
              覆盖本科、研究生、考研、考公全学段资料，配合AI智能问答助手，让学习更高效。
            </p>
            <div className="flex flex-col sm:flex-row gap-4">
              <Button
                onClick={() => onGoToResources()}
                size="lg"
                className="bg-[#10B981] hover:bg-[#059669] text-white font-semibold px-8 h-12 rounded-xl"
              >
                <Search className="w-4 h-4 mr-2" />
                浏览资料库
              </Button>
              <Button
                onClick={onGoToAI}
                size="lg"
                variant="outline"
                className="border-white/30 text-white hover:bg-white/10 font-semibold px-8 h-12 rounded-xl bg-transparent"
              >
                <Bot className="w-4 h-4 mr-2" />
                AI智能问答
              </Button>
            </div>
          </div>
        </div>
        {/* Stats bar */}
        <div className="relative border-t border-white/10">
          <div className="max-w-screen-xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
              {[
                { label: '资料总量', value: '10,000+', icon: FileText },
                { label: '注册用户', value: '50,000+', icon: Users },
                { label: '日均下载', value: '1,000+', icon: Download },
                { label: '认证教师', value: '200+', icon: GraduationCap },
              ].map(stat => (
                <div key={stat.label} className="flex items-center gap-3">
                  <stat.icon className="w-5 h-5 text-[#10B981]" />
                  <div>
                    <div className="text-xl font-bold text-white">{stat.value}</div>
                    <div className="text-xs text-slate-400">{stat.label}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Stage Categories */}
      <section className="max-w-screen-xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="text-center mb-10">
          <h2 className="text-2xl md:text-3xl font-bold text-[#1E293B] mb-3">按学习阶段浏览</h2>
          <p className="text-[#64748B]">&#31934;&#20934;&#20998;&#31867;&#65292;&#24555;&#36895;&#23450;&#20301;&#25152;&#38656;&#36164;&#26009;</p>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {STAGES.map(stage => (
            <button
              key={stage.id}
              onClick={() => onGoToResources({ stage: stage.id })}
              className={`p-5 rounded-2xl border-2 text-left hover:shadow-md transition-all group ${stage.color}`}
            >
              <stage.icon className="w-6 h-6 mb-3" />
              <div className="font-bold text-sm mb-1">{stage.label}</div>
              <div className="text-xs opacity-70 leading-relaxed">{stage.desc}</div>
              <ArrowRight className="w-4 h-4 mt-3 opacity-0 group-hover:opacity-100 transition-opacity" />
            </button>
          ))}
        </div>
      </section>

      {/* Subject Categories */}
      <section className="bg-white border-y border-[#E2E8F0]">
        <div className="max-w-screen-xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <div className="text-center mb-10">
            <h2 className="text-2xl md:text-3xl font-bold text-[#1E293B] mb-3">按学科分类</h2>
            <p className="text-[#64748B]">涵盖主要学科，精准匹配专业需求</p>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
            {CATEGORIES.map(cat => (
              <button
                key={cat.id}
                onClick={() => onGoToResources({ category: cat.id })}
                className="p-4 rounded-2xl border border-[#E2E8F0] bg-white hover:border-[#6366F1] hover:shadow-md transition-all text-center group"
              >
                <div className="text-3xl mb-2">{cat.icon}</div>
                <div className="font-semibold text-sm text-[#1E293B] mb-1">{cat.label}</div>
                <div className="text-xs text-[#64748B] leading-relaxed hidden sm:block">{cat.desc}</div>
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* Featured Resources */}
      <section className="max-w-screen-xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h2 className="text-2xl md:text-3xl font-bold text-[#1E293B] mb-1">热门资料</h2>
            <p className="text-[#64748B] text-sm">最多用户下载的优质内容</p>
          </div>
          <Button variant="outline" onClick={() => onGoToResources()} className="border-[#E2E8F0] text-[#64748B] hover:text-[#1E293B] rounded-xl">
            查看全部 <ArrowRight className="w-4 h-4 ml-1" />
          </Button>
        </div>
        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {[1,2,3,4,5,6].map(i => (
              <div key={i} className="h-40 bg-slate-100 rounded-2xl animate-pulse" />
            ))}
          </div>
        ) : featured.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {featured.map(r => (
              <ResourceCard key={r.id} resource={r} onClick={() => onGoToResource(r.id)} />
            ))}
          </div>
        ) : (
          <div className="text-center py-16 text-[#64748B]">
            <FileText className="w-12 h-12 mx-auto mb-4 opacity-30" />
            <p>暂无资料，成为第一个贡献者！</p>
          </div>
        )}
      </section>

      {/* AI Banner */}
      <section className="bg-[#0F172A] text-white">
        <div className="max-w-screen-xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <div className="grid md:grid-cols-2 gap-10 items-center">
            <div>
              <Badge className="bg-[#6366F1]/20 text-[#818CF8] border-[#6366F1]/30 mb-4">
                <Bot className="w-3.5 h-3.5 mr-1" /> AI智能助手
              </Badge>
              <h2 className="text-3xl font-bold mb-4">智能学习助手<br />随时解答你的问题</h2>
              <p className="text-slate-300 mb-6 leading-relaxed">
                基于Cohere Rerank-4-Fast模型，可以回答学科知识点、推荐学习路径、解析资料内容。
                每日前5次免费，让学习更高效。
              </p>
              <Button onClick={onGoToAI} className="bg-[#6366F1] hover:bg-[#4F46E5] text-white font-semibold px-6 h-11 rounded-xl">
                <Bot className="w-4 h-4 mr-2" /> 立即体验
              </Button>
            </div>
            <div className="bg-white/5 rounded-2xl p-6 border border-white/10">
              <div className="space-y-3">
                {[
                  { q: '高等数学极限怎么学？', a: '建议先掌握极限定义，再学习极限运算法则...' },
                  { q: '考研408备考路线是什么？', a: '建议按数据结构→算法→操作系统→计算机网络顺序...' },
                  { q: '行测言语理解有哪些解题技巧？', a: '主要包括主旨归纳法、关键词定位法、逻辑分析法...' },
                ].map((item, i) => (
                  <div key={i} className="space-y-1">
                    <div className="flex items-start gap-2">
                      <span className="text-[#6366F1] text-xs font-bold mt-0.5">Q</span>
                      <span className="text-sm text-white">{item.q}</span>
                    </div>
                    <div className="flex items-start gap-2 pl-4">
                      <span className="text-[#10B981] text-xs font-bold mt-0.5">A</span>
                      <span className="text-xs text-slate-400">{item.a}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Points System Banner */}
      <section className="max-w-screen-xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="bg-gradient-to-r from-amber-50 to-orange-50 rounded-3xl p-8 md:p-12 border border-amber-200">
          <div className="text-center mb-8">
            <h2 className="text-2xl md:text-3xl font-bold text-[#1E293B] mb-3">积分激励体系</h2>
            <p className="text-[#64748B]">&#36901;&#36807;&#36129;&#29486;&#12289;&#19978;&#20256;&#12289;&#35746;&#20215;&#31561;&#34892;&#20026;&#33719;&#21462;&#31215;&#20998;&#65292;&#20551;&#25442;&#26356;&#22810;&#36164;&#26009;</p>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[
              { action: '注册奖励', points: '+50', icon: '🎉' },
              { action: '每日签到', points: '+5', icon: '📅' },
              { action: '上传资料', points: '+30', icon: '📤' },
              { action: '资料被下载', points: '+2', icon: '⬇️' },
            ].map(item => (
              <div key={item.action} className="bg-white rounded-2xl p-4 text-center border border-amber-100">
                <div className="text-2xl mb-2">{item.icon}</div>
                <div className="text-xl font-bold text-amber-600">{item.points}</div>
                <div className="text-sm text-[#64748B]">{item.action}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-white border-t border-[#E2E8F0] py-10">
        <div className="max-w-screen-xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="flex items-center justify-center gap-2 mb-3">
            <div className="w-6 h-6 bg-[#0F172A] rounded-md flex items-center justify-center">
              <BookOpen className="w-3 h-3 text-white" />
            </div>
            <span className="font-bold text-[#0F172A]">&#23398;&#30740;&#31038;</span>
          </div>
          <p className="text-xs text-[#64748B]">© 2026 学研社. 助力每一位学子高效上岸。</p>
          <p className="text-xs text-[#64748B] mt-1">平台资料仅供个人学习使用，严禁二次传播</p>
        </div>
      </footer>
    </div>
  );
}

function ResourceCard({ resource, onClick }: { resource: Resource; onClick: () => void }) {
  const stageLabels: Record<string, string> = {
    undergraduate: '本科',
    graduate: '研究生',
    exam_postgrad: '考研',
    exam_civil: '考公',
  };
  const typeLabels: Record<string, string> = {
    notes: '笔记',
    exam_paper: '真题',
    slides: '课件',
    exercise: '习题',
    solution: '解析',
    other: '其他',
  };

  return (
    <button
      onClick={onClick}
      className="bg-white rounded-2xl border border-[#E2E8F0] p-5 text-left hover:shadow-md hover:border-[#6366F1]/30 transition-all group min-h-[140px] flex flex-col"
    >
      <div className="flex items-start justify-between mb-3">
        <div className="flex gap-2 flex-wrap">
          <Badge className="bg-slate-100 text-slate-600 text-[10px] px-2 py-0.5">{stageLabels[resource.stage] || resource.stage}</Badge>
          <Badge className="bg-indigo-50 text-indigo-600 text-[10px] px-2 py-0.5">{typeLabels[resource.resourceType] || resource.resourceType}</Badge>
        </div>
        {resource.pointCost > 0 ? (
          <span className="text-xs font-semibold text-amber-600 bg-amber-50 px-2 py-0.5 rounded-full">{resource.pointCost}分</span>
        ) : (
          <span className="text-xs font-semibold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full">免费</span>
        )}
      </div>
      <h3 className="font-semibold text-[#1E293B] text-sm leading-tight mb-2 flex-1 line-clamp-2 group-hover:text-[#6366F1] transition-colors">{resource.title}</h3>
      <div className="flex items-center justify-between text-xs text-[#64748B] mt-auto">
        <div className="flex items-center gap-1">
          <Star className="w-3 h-3 text-amber-400 fill-amber-400" />
          <span>{resource.rating > 0 ? resource.rating.toFixed(1) : '-'}</span>
        </div>
        <div className="flex items-center gap-1">
          <Download className="w-3 h-3" />
          <span>{resource.downloadCount.toLocaleString()}</span>
        </div>
        {resource.uploaderCertified && (
          <span className="text-emerald-600 font-medium">认证教师</span>
        )}
      </div>
    </button>
  );
}
