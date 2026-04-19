import { useState, useEffect } from 'react';
import { resourceApi, aiApi } from '@/lib/api';
import { useAuth } from '@/contexts/AuthContext';
import type { Resource, Comment } from '@shared/types/api';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { toast } from 'sonner';
import {
  ArrowLeft, Star, Download, FileText, Bot, Send, ChevronLeft, ChevronRight,
  ThumbsUp, CheckCircle, Loader2, ZoomIn, ZoomOut
} from 'lucide-react';

interface ResourceDetailPageProps {
  resourceId: string;
  onBack: () => void;
}

const stageLabels: Record<string, string> = { undergraduate: '本科', graduate: '研究生', exam_postgrad: '考研', exam_civil: '考公' };
const typeLabels: Record<string, string> = { notes: '笔记', exam_paper: '真题', slides: '课件', exercise: '习题', solution: '解析', other: '其他' };

export default function ResourceDetailPage({ resourceId, onBack }: ResourceDetailPageProps) {
  const { user } = useAuth();
  const [resource, setResource] = useState<Resource | null>(null);
  const [comments, setComments] = useState<Comment[]>([]);
  const [totalComments, setTotalComments] = useState(0);
  const [commentPage, setCommentPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [downloading, setDownloading] = useState(false);
  const [showDownloadModal, setShowDownloadModal] = useState(false);
  const [commentContent, setCommentContent] = useState('');
  const [commentRating, setCommentRating] = useState(5);
  const [submittingComment, setSubmittingComment] = useState(false);
  const [aiInput, setAiInput] = useState('');
  const [aiMessages, setAiMessages] = useState<Array<{ role: string; content: string }>>([]);
  const [aiLoading, setAiLoading] = useState(false);
  const [aiSessionId, setAiSessionId] = useState<string | undefined>();
  const [previewPage, setPreviewPage] = useState(1);
  const [zoom, setZoom] = useState(100);

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      try {
        const res = await resourceApi.get(resourceId);
        if (res.success) setResource(res.data);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [resourceId]);

  useEffect(() => {
    resourceApi.getComments(resourceId, commentPage).then(res => {
      if (res.success) {
        setComments(res.data.comments);
        setTotalComments(res.data.total);
      }
    });
  }, [resourceId, commentPage]);

  const handleDownload = async () => {
    if (!user) { toast.error('请先登录'); return; }
    setDownloading(true);
    try {
      const res = await resourceApi.download(resourceId);
      if (res.success) {
        toast.success('下载成功', { description: '资料已开始下载' });
        window.open(res.data.fileUrl, '_blank');
        setShowDownloadModal(false);
        if (resource) setResource({ ...resource, downloadCount: resource.downloadCount + 1 });
      } else {
        toast.error('下载失败', { description: res.message });
      }
    } finally {
      setDownloading(false);
    }
  };

  const handleComment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) { toast.error('请先登录'); return; }
    if (commentContent.length < 20) { toast.error('评论内容至少20字'); return; }
    setSubmittingComment(true);
    try {
      const res = await resourceApi.addComment(resourceId, { content: commentContent, rating: commentRating });
      if (res.success) {
        toast.success('评论成功', { description: '已获得3积分奖励' });
        setCommentContent('');
        setCommentRating(5);
        const updated = await resourceApi.getComments(resourceId, 1);
        if (updated.success) { setComments(updated.data.comments); setTotalComments(updated.data.total); setCommentPage(1); }
      } else {
        toast.error('评论失败', { description: res.message });
      }
    } finally {
      setSubmittingComment(false);
    }
  };

  const handleAiChat = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!aiInput.trim() || !user) return;
    const msg = aiInput;
    setAiInput('');
    setAiMessages(prev => [...prev, { role: 'user', content: msg }]);
    setAiLoading(true);
    try {
      const res = await aiApi.chat({ message: msg, sessionId: aiSessionId, resourceId });
      if (res.success) {
        setAiMessages(prev => [...prev, { role: 'assistant', content: res.data.reply }]);
        setAiSessionId(res.data.sessionId);
      } else {
        toast.error('AI回复失败', { description: res.message });
      }
    } finally {
      setAiLoading(false);
    }
  };

  const handleLike = async (commentId: string) => {
    const res = await resourceApi.likeComment(resourceId, commentId);
    if (res.success) {
      setComments(prev => prev.map(c => c.id === commentId ? { ...c, likes: c.likes + 1 } : c));
    }
  };

  if (loading) {
    return (
      <div className="max-w-screen-xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-slate-100 rounded w-1/3" />
          <div className="h-96 bg-slate-100 rounded-2xl" />
        </div>
      </div>
    );
  }

  if (!resource) {
    return (
      <div className="max-w-screen-xl mx-auto px-4 sm:px-6 lg:px-8 py-8 text-center">
        <p className="text-[#64748B]">资料不存在</p>
        <Button onClick={onBack} className="mt-4">返回</Button>
      </div>
    );
  }

  const fileSizeMB = (resource.fileSize / 1024 / 1024).toFixed(1);

  return (
    <div className="max-w-screen-xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Back button */}
      <button onClick={onBack} className="flex items-center gap-2 text-[#64748B] hover:text-[#1E293B] mb-6 transition-colors">
        <ArrowLeft className="w-4 h-4" />
        <span className="text-sm">返回列表</span>
      </button>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left: PDF Preview & Comments */}
        <div className="lg:col-span-8 space-y-8">
          {/* PDF Previewer */}
          <div className="bg-white rounded-2xl border border-[#E2E8F0] overflow-hidden shadow-sm">
            <div className="bg-slate-800 px-4 py-3 flex justify-between items-center text-white">
              <div className="flex items-center gap-4 text-xs">
                <span>第 {previewPage} / {resource.pageCount || '?'} 页</span>
                <div className="flex items-center gap-1">
                  <button onClick={() => setZoom(z => Math.max(50, z - 10))} className="p-1 hover:bg-white/10 rounded"><ZoomOut className="w-3.5 h-3.5" /></button>
                  <span className="px-2 text-xs">{zoom}%</span>
                  <button onClick={() => setZoom(z => Math.min(200, z + 10))} className="p-1 hover:bg-white/10 rounded"><ZoomIn className="w-3.5 h-3.5" /></button>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <button onClick={() => setPreviewPage(p => Math.max(1, p - 1))} disabled={previewPage === 1} className="p-1 hover:bg-white/10 rounded disabled:opacity-40"><ChevronLeft className="w-4 h-4" /></button>
                <button onClick={() => setPreviewPage(p => p + 1)} disabled={previewPage >= 10} className="p-1 hover:bg-white/10 rounded disabled:opacity-40"><ChevronRight className="w-4 h-4" /></button>
              </div>
            </div>
            <div className="aspect-[3/4] bg-slate-50 flex flex-col items-center p-8 overflow-hidden relative">
              <div className="w-full max-w-2xl space-y-6 opacity-60" style={{ transform: `scale(${zoom / 100})`, transformOrigin: 'top center' }}>
                <div className="h-8 bg-slate-200 w-3/4 rounded" />
                <div className="space-y-3">
                  {[1,2,3].map(i => <div key={i} className="h-4 bg-slate-100 rounded" style={{ width: i === 3 ? '80%' : '100%' }} />)}
                </div>
                <div className="h-40 bg-slate-100 rounded-xl flex items-center justify-center text-slate-300 text-sm">文件预览区域</div>
                <div className="space-y-3">
                  {[1,2].map(i => <div key={i} className="h-4 bg-slate-100 rounded" style={{ width: i === 2 ? '70%' : '100%' }} />)}
                </div>
              </div>
              {/* Preview limit overlay */}
              {previewPage >= 10 && (
                <div className="absolute inset-x-0 bottom-0 h-1/2 bg-gradient-to-t from-white via-white/90 to-transparent flex flex-col items-center justify-end pb-12 px-6 text-center">
                  <p className="text-[#1E293B] font-bold mb-2">预览已结束，下载查看完整内容</p>
                  <p className="text-xs text-[#64748B] mb-6">前 10 页免费预览，完整资料共 {resource.pageCount} 页</p>
                  <Button onClick={() => setShowDownloadModal(true)} className="bg-[#6366F1] hover:bg-[#4F46E5] text-white px-8 py-3 rounded-xl font-bold shadow-lg">立即获取完整版</Button>
                </div>
              )}
            </div>
          </div>

          {/* Resource Title & Info */}
          <div className="bg-white rounded-2xl border border-[#E2E8F0] p-6">
            <div className="flex flex-wrap gap-2 mb-3">
              <Badge className="bg-slate-100 text-slate-600">{stageLabels[resource.stage] || resource.stage}</Badge>
              <Badge className="bg-indigo-50 text-indigo-600">{typeLabels[resource.resourceType] || resource.resourceType}</Badge>
              {resource.uploaderCertified && <Badge className="bg-emerald-50 text-emerald-700">认证教师上传</Badge>}
            </div>
            <h1 className="text-xl md:text-2xl font-bold text-[#1E293B] mb-3">{resource.title}</h1>
            {resource.description && <p className="text-[#64748B] leading-relaxed mb-4">{resource.description}</p>}
            {resource.tags.length > 0 && (
              <div className="flex flex-wrap gap-2">
                {resource.tags.map(tag => (
                  <span key={tag} className="text-xs bg-slate-100 text-slate-600 px-2 py-1 rounded-full">{tag}</span>
                ))}
              </div>
            )}
          </div>

          {/* Comments */}
          <div className="bg-white rounded-2xl border border-[#E2E8F0] p-6">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-bold text-[#1E293B]">评价与讨论 <span className="text-sm font-normal text-[#64748B] ml-2">({totalComments}条)</span></h3>
              {resource.ratingCount > 0 && (
                <div className="text-right">
                  <div className="text-2xl font-bold text-[#1E293B]">{resource.rating.toFixed(1)}</div>
                  <div className="flex">{[1,2,3,4,5].map(s => <Star key={s} className={`w-3 h-3 ${s <= Math.round(resource.rating) ? 'text-amber-400 fill-amber-400' : 'text-slate-200'}`} />)}</div>
                </div>
              )}
            </div>

            {/* Comment Form */}
            {user && (
              <form onSubmit={handleComment} className="mb-8 p-4 bg-slate-50 rounded-xl">
                <div className="flex items-center gap-2 mb-3">
                  <span className="text-sm font-medium text-[#1E293B]">评分：</span>
                  {[1,2,3,4,5].map(s => (
                    <button key={s} type="button" onClick={() => setCommentRating(s)}>
                      <Star className={`w-5 h-5 ${s <= commentRating ? 'text-amber-400 fill-amber-400' : 'text-slate-300'}`} />
                    </button>
                  ))}
                </div>
                <Textarea
                  placeholder="分享你的学习体验（至少20字）..."
                  value={commentContent}
                  onChange={e => setCommentContent(e.target.value)}
                  className="mb-3 border-[#E2E8F0] resize-none"
                  rows={3}
                />
                <div className="flex items-center justify-between">
                  <span className="text-xs text-[#64748B]">撰写有效评论可获得3积分</span>
                  <Button type="submit" disabled={submittingComment} size="sm" className="bg-[#0F172A] text-white rounded-lg">
                    {submittingComment ? <Loader2 className="w-4 h-4 animate-spin" /> : '提交评论'}
                  </Button>
                </div>
              </form>
            )}

            {/* Comment List */}
            <div className="space-y-6">
              {comments.map(comment => (
                <div key={comment.id} className="flex gap-4 pb-6 border-b border-[#E2E8F0] last:border-0">
                  <div className="w-9 h-9 bg-[#6366F1] rounded-full flex items-center justify-center text-white text-sm font-bold flex-shrink-0">
                    {comment.username[0].toUpperCase()}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between mb-1 flex-wrap gap-2">
                      <div className="flex items-center gap-2">
                        <span className="font-semibold text-sm text-[#1E293B]">{comment.username}</span>
                        {comment.isTeacherCertified && (
                          <Badge className="bg-emerald-50 text-emerald-700 text-[10px] px-1.5 py-0">认证教师</Badge>
                        )}
                      </div>
                      <span className="text-xs text-[#64748B]">{new Date(comment.createdAt).toLocaleDateString('zh-CN')}</span>
                    </div>
                    <div className="flex mb-2">
                      {[1,2,3,4,5].map(s => <Star key={s} className={`w-3 h-3 ${s <= comment.rating ? 'text-amber-400 fill-amber-400' : 'text-slate-200'}`} />)}
                    </div>
                    <p className="text-sm text-[#1E293B] leading-relaxed">{comment.content}</p>
                    <button onClick={() => handleLike(comment.id)} className="mt-2 flex items-center gap-1 text-xs text-[#64748B] hover:text-[#1E293B] transition-colors">
                      <ThumbsUp className="w-3 h-3" /> {comment.likes}
                    </button>
                  </div>
                </div>
              ))}
              {totalComments > comments.length && (
                <button onClick={() => setCommentPage(p => p + 1)} className="w-full py-3 text-sm text-[#6366F1] font-medium hover:bg-slate-50 rounded-xl transition-colors">
                  查看更多评论
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Right: Info & AI */}
        <div className="lg:col-span-4 space-y-6">
          {/* Resource Info */}
          <div className="bg-white rounded-2xl border border-[#E2E8F0] p-6 shadow-sm">
            <h2 className="text-base font-bold text-[#1E293B] mb-4">资料信息</h2>
            <div className="space-y-3">
              {[
                { label: '文件格式', value: `${resource.fileName.split('.').pop()?.toUpperCase()} (${fileSizeMB} MB)` },
                { label: '页数', value: `${resource.pageCount} 页` },
                { label: '上传时间', value: new Date(resource.createdAt).toLocaleDateString('zh-CN') },
                { label: '下载次数', value: `${resource.downloadCount.toLocaleString()} 次` },
                { label: '评分', value: resource.ratingCount > 0 ? `${resource.rating.toFixed(1)} (${resource.ratingCount}人评价)` : '暂无评分' },
              ].map(item => (
                <div key={item.label} className="flex justify-between text-sm">
                  <span className="text-[#64748B]">{item.label}</span>
                  <span className="font-medium text-[#1E293B]">{item.value}</span>
                </div>
              ))}
              <div className="pt-4 border-t border-[#E2E8F0]">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-9 h-9 bg-[#6366F1] rounded-full flex items-center justify-center text-white text-sm font-bold">
                    {resource.uploaderName[0].toUpperCase()}
                  </div>
                  <div>
                    <div className="text-sm font-bold text-[#1E293B] flex items-center gap-1">
                      {resource.uploaderName}
                      {resource.uploaderCertified && <CheckCircle className="w-3.5 h-3.5 text-emerald-500" />}
                    </div>
                    <div className="text-xs text-[#64748B]">资料上传者</div>
                  </div>
                </div>
              </div>
            </div>
            <Button
              onClick={() => setShowDownloadModal(true)}
              className="w-full bg-[#0F172A] hover:bg-[#1E293B] text-white font-semibold rounded-xl h-11 mt-2"
            >
              <Download className="w-4 h-4 mr-2" />
              {resource.pointCost > 0 ? `下载资料 (${resource.pointCost}分)` : '免费下载'}
            </Button>
          </div>

          {/* AI Assistant */}
          <div className="bg-[#0F172A] rounded-2xl p-6 text-white shadow-xl relative overflow-hidden">
            <div className="relative z-10">
              <div className="flex items-center gap-2 mb-4">
                <div className="w-8 h-8 bg-[#6366F1] rounded-lg flex items-center justify-center shadow-lg">
                  <Bot className="w-4 h-4 text-white" />
                </div>
                <div>
                  <h3 className="font-bold text-sm">智能资料助手</h3>
                  <p className="text-[10px] text-slate-400">基于 Cohere Rerank-4-Fast</p>
                </div>
              </div>

              {/* Chat messages */}
              {aiMessages.length > 0 ? (
                <div className="space-y-3 mb-4 max-h-48 overflow-y-auto">
                  {aiMessages.map((msg, i) => (
                    <div key={i} className={`text-xs leading-relaxed p-3 rounded-xl ${
                      msg.role === 'user' ? 'bg-white/10 text-white' : 'bg-[#6366F1]/20 text-slate-200'
                    }`}>
                      <span className="font-bold mr-1">{msg.role === 'user' ? '你' : 'AI'}：</span>
                      {msg.content}
                    </div>
                  ))}
                  {aiLoading && (
                    <div className="bg-[#6366F1]/20 text-slate-200 text-xs p-3 rounded-xl">
                      <Loader2 className="w-3 h-3 animate-spin inline mr-1" />思考中...
                    </div>
                  )}
                </div>
              ) : (
                <div className="bg-white/10 rounded-xl p-4 mb-4">
                  <p className="text-xs leading-relaxed text-slate-200">你可以问我：<br />• 这份资料包含哪些重点？<br />• 适合零基础跨考吗？<br />• 如何制定学习计划？</p>
                </div>
              )}

              <form onSubmit={handleAiChat} className="relative">
                <input
                  type="text"
                  value={aiInput}
                  onChange={e => setAiInput(e.target.value)}
                  placeholder={user ? '输入你的问题...' : '登录后可使用AI助手'}
                  disabled={!user || aiLoading}
                  className="w-full bg-white/10 border border-white/20 rounded-xl py-3 px-4 text-sm focus:outline-none focus:ring-2 focus:ring-[#6366F1] placeholder:text-slate-400 text-white disabled:opacity-50"
                />
                <button
                  type="submit"
                  disabled={!user || aiLoading || !aiInput.trim()}
                  className="absolute right-2 top-1/2 -translate-y-1/2 bg-[#6366F1] p-1.5 rounded-lg disabled:opacity-50"
                >
                  <Send className="w-4 h-4" />
                </button>
              </form>
              <p className="text-[10px] text-slate-400 mt-2 text-center">前5次免费，后续 2 积分/次</p>
            </div>
            <div className="absolute -top-12 -right-12 w-32 h-32 bg-[#6366F1]/20 rounded-full blur-3xl" />
          </div>
        </div>
      </div>

      {/* Download Modal */}
      {showDownloadModal && (
        <div className="fixed inset-0 z-50">
          <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm" onClick={() => setShowDownloadModal(false)} />
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-md bg-white rounded-3xl p-8 shadow-2xl">
            <div className="text-center mb-6">
              <div className="w-16 h-16 bg-emerald-50 rounded-full flex items-center justify-center mx-auto mb-4">
                <Download className="w-7 h-7 text-emerald-600" />
              </div>
              <h3 className="text-xl font-bold text-[#1E293B]">确认下载资料</h3>
              <p className="text-sm text-[#64748B] mt-2 line-clamp-2">您正在下载《{resource.title}》</p>
            </div>
            <div className="bg-slate-50 rounded-2xl p-5 mb-6 space-y-3">
              <div className="flex justify-between text-sm">
                <span className="text-[#64748B]">所需积分</span>
                <span className="font-bold text-[#1E293B]">{resource.pointCost > 0 ? `${resource.pointCost} 积分` : '免费'}</span>
              </div>
              {user && (
                <>
                  <div className="flex justify-between text-sm">
                    <span className="text-[#64748B]">当前余额</span>
                    <span className="font-medium">{user.points} 积分</span>
                  </div>
                  <div className="h-px bg-slate-200" />
                  <div className="flex justify-between text-sm">
                    <span className="text-[#64748B]">下载后余额</span>
                    <span className="font-bold text-emerald-600">{user.points - resource.pointCost} 积分</span>
                  </div>
                </>
              )}
            </div>
            <div className="flex gap-3">
              <Button variant="outline" onClick={() => setShowDownloadModal(false)} className="flex-1 rounded-xl border-[#E2E8F0]">取消</Button>
              <Button
                onClick={handleDownload}
                disabled={downloading || (!!user && user.points < resource.pointCost)}
                className="flex-1 bg-[#0F172A] text-white font-bold rounded-xl"
              >
                {downloading ? <Loader2 className="w-4 h-4 animate-spin" /> : '确认下载'}
              </Button>
            </div>
            <p className="text-[10px] text-center text-[#64748B] mt-4">下载即代表您同意《用户协议》及《版权声明》</p>
          </div>
        </div>
      )}
    </div>
  );
}
