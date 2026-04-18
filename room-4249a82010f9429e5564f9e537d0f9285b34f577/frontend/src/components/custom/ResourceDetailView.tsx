import { useState, useEffect } from 'react';
import { ArrowLeft, Star, Download, Heart, Flag, BookOpen, User, Calendar, FileText, AlertTriangle } from 'lucide-react';
import { getResource, downloadResource, favoriteResource, unfavoriteResource, createReview, reportResource } from '../../lib/api';
import type { Resource, Review, ViewType } from '../../types';
import { RESOURCE_TYPE_LABELS, SUBJECT_LABELS, STAGE_LABELS, CATEGORY_LABELS } from '../../types';
import { toast } from 'sonner';

interface ResourceDetailViewProps {
  resourceId: string;
  onNavigate: (view: ViewType, resourceId?: string) => void;
}

const ResourceDetailView = ({ resourceId, onNavigate }: ResourceDetailViewProps) => {
  const [resource, setResource] = useState<Resource & { avgRating: number; reviewCount: number; reviews: Review[] } | null>(null);
  const [loading, setLoading] = useState(true);
  const [favorited, setFavorited] = useState(false);
  const [downloading, setDownloading] = useState(false);
  const [showReviewForm, setShowReviewForm] = useState(false);
  const [showReportForm, setShowReportForm] = useState(false);
  const [rating, setRating] = useState(5);
  const [reviewContent, setReviewContent] = useState('');
  const [reportReason, setReportReason] = useState('copyright');
  const [reportDesc, setReportDesc] = useState('');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    loadResource();
  }, [resourceId]);

  const loadResource = async () => {
    setLoading(true);
    try {
      const res = await getResource(resourceId);
      if (res.success) setResource(res.data);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const handleDownload = async () => {
    setDownloading(true);
    try {
      const res = await downloadResource(resourceId);
      if (res.success) {
        if (res.data.fileUrl) {
          window.open(res.data.fileUrl, '_blank');
        }
        toast.success('下载成功', { description: res.data.fileName || '资料已开始下载' });
        loadResource();
      } else {
        toast.error('下载失败', { description: '积分不足或资料不可用' });
      }
    } catch {
      toast.error('下载失败');
    } finally {
      setDownloading(false);
    }
  };

  const handleFavorite = async () => {
    try {
      if (favorited) {
        await unfavoriteResource(resourceId);
        setFavorited(false);
        toast.success('已取消收藏');
      } else {
        await favoriteResource(resourceId);
        setFavorited(true);
        toast.success('已添加到收藏夹');
      }
    } catch {
      toast.error('操作失败');
    }
  };

  const handleSubmitReview = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const res = await createReview(resourceId, { rating, content: reviewContent });
      if (res.success) {
        toast.success('评价提交成功');
        setShowReviewForm(false);
        setReviewContent('');
        loadResource();
      }
    } catch {
      toast.error('提交失败');
    } finally {
      setSubmitting(false);
    }
  };

  const handleSubmitReport = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const res = await reportResource(resourceId, { reason: reportReason, description: reportDesc });
      if (res.success) {
        toast.success('举报已提交，我们将尽快处理');
        setShowReportForm(false);
      }
    } catch {
      toast.error('提交失败');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#F4F6FA] flex items-center justify-center">
        <div className="animate-pulse text-[#5A6A85]">加载中...</div>
      </div>
    );
  }

  if (!resource) {
    return (
      <div className="min-h-screen bg-[#F4F6FA] flex items-center justify-center">
        <div className="text-center">
          <BookOpen className="w-12 h-12 text-[#D8E0EE] mx-auto mb-4" />
          <p className="text-[#5A6A85]">资料不存在</p>
          <button onClick={() => onNavigate('resources')} className="mt-4 px-4 py-2 bg-[#1A3A6B] text-white rounded-lg text-sm">返回</button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F4F6FA]">
      {/* Back */}
      <div className="bg-white border-b border-[#D8E0EE]">
        <div className="max-w-screen-xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <button
            onClick={() => onNavigate('resources')}
            className="flex items-center gap-2 text-sm text-[#5A6A85] hover:text-[#1A3A6B] transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            返回资料列表
          </button>
        </div>
      </div>

      <div className="max-w-screen-xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Cover + Title */}
            <div className="bg-white rounded-2xl border border-[#D8E0EE] overflow-hidden">
              <div className={`relative h-48 bg-gradient-to-br ${resource.coverGradient}`}>
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                <div className="absolute top-4 left-4">
                  <span className={`text-xs font-semibold text-white ${resource.tagColor} rounded-full px-3 py-1.5`}>
                    {RESOURCE_TYPE_LABELS[resource.resourceType] || resource.resourceType}
                  </span>
                </div>
                <div className="absolute bottom-4 left-4 right-4">
                  <h1 className="text-xl font-bold text-white leading-tight">{resource.title}</h1>
                </div>
              </div>
              <div className="p-6">
                <p className="text-[#5A6A85] leading-relaxed mb-4">{resource.description}</p>
                <div className="flex flex-wrap gap-2">
                  {[
                    CATEGORY_LABELS[resource.category],
                    SUBJECT_LABELS[resource.subject],
                    STAGE_LABELS[resource.stage],
                    resource.year ? `${resource.year}年` : null,
                  ].filter(Boolean).map((tag) => (
                    <span key={tag} className="text-xs bg-[#F4F6FA] border border-[#D8E0EE] rounded-full px-3 py-1 text-[#5A6A85]">{tag}</span>
                  ))}
                </div>
              </div>
            </div>

            {/* Reviews */}
            <div className="bg-white rounded-2xl border border-[#D8E0EE] p-6">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h2 className="text-lg font-bold text-[#0F1C35]">用户评价</h2>
                  <div className="flex items-center gap-2 mt-1">
                    <div className="flex">
                      {[1,2,3,4,5].map((s) => (
                        <Star key={s} className={`w-4 h-4 ${s <= Math.round(resource.avgRating || 0) ? 'fill-amber-400 text-amber-400' : 'text-gray-200'}`} />
                      ))}
                    </div>
                    <span className="text-sm font-semibold text-[#0F1C35]">{resource.avgRating ? resource.avgRating.toFixed(1) : '—'}</span>
                    <span className="text-sm text-[#5A6A85]">({resource.reviewCount || 0} 评论)</span>
                  </div>
                </div>
                <button
                  onClick={() => setShowReviewForm(!showReviewForm)}
                  className="px-4 py-2 text-sm font-medium text-[#2E6BE6] border border-[#2E6BE6] rounded-lg hover:bg-[#2E6BE6] hover:text-white transition-colors"
                >
                  写评论
                </button>
              </div>

              {/* Review Form */}
              {showReviewForm && (
                <form onSubmit={handleSubmitReview} className="mb-6 p-4 bg-[#F4F6FA] rounded-xl border border-[#D8E0EE]">
                  <div className="mb-3">
                    <label className="text-sm font-medium text-[#0F1C35] mb-2 block">评分</label>
                    <div className="flex gap-1">
                      {[1,2,3,4,5].map((s) => (
                        <button key={s} type="button" onClick={() => setRating(s)}>
                          <Star className={`w-6 h-6 transition-colors ${s <= rating ? 'fill-amber-400 text-amber-400' : 'text-gray-300 hover:text-amber-300'}`} />
                        </button>
                      ))}
                    </div>
                  </div>
                  <textarea
                    value={reviewContent}
                    onChange={(e) => setReviewContent(e.target.value)}
                    placeholder="分享你的使用感受（可选）"
                    rows={3}
                    className="w-full text-sm border border-[#D8E0EE] rounded-lg px-3 py-2 bg-white text-[#0F1C35] focus:outline-none focus:ring-1 focus:ring-[#2E6BE6] resize-none"
                  />
                  <div className="flex gap-2 mt-3">
                    <button type="submit" disabled={submitting} className="px-4 py-2 bg-[#1A3A6B] text-white text-sm font-medium rounded-lg hover:bg-[#2E6BE6] transition-colors disabled:opacity-50">
                      {submitting ? '提交中...' : '提交评价'}
                    </button>
                    <button type="button" onClick={() => setShowReviewForm(false)} className="px-4 py-2 text-sm text-[#5A6A85] hover:text-[#0F1C35]">取消</button>
                  </div>
                </form>
              )}

              {/* Review List */}
              {resource.reviews && resource.reviews.length > 0 ? (
                <div className="space-y-4">
                  {resource.reviews.map((review) => (
                    <div key={review.id} className="border-b border-[#D8E0EE] pb-4 last:border-0">
                      <div className="flex items-center gap-3 mb-2">
                        <div className="w-8 h-8 rounded-full bg-[#1A3A6B] flex items-center justify-center text-white text-xs font-bold">
                          {review.userName.charAt(0)}
                        </div>
                        <div>
                          <div className="text-sm font-medium text-[#0F1C35]">{review.userName}</div>
                          <div className="flex items-center gap-1">
                            {[1,2,3,4,5].map((s) => (
                              <Star key={s} className={`w-3 h-3 ${s <= review.rating ? 'fill-amber-400 text-amber-400' : 'text-gray-200'}`} />
                            ))}
                          </div>
                        </div>
                        <span className="ml-auto text-xs text-[#5A6A85]">{new Date(review.createdAt).toLocaleDateString('zh-CN')}</span>
                      </div>
                      {review.content && <p className="text-sm text-[#5A6A85] leading-relaxed">{review.content}</p>}
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-[#5A6A85] text-center py-6">暂无评论，成为第一个评价者吧！</p>
              )}
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-4">
            {/* Download Card */}
            <div className="bg-white rounded-2xl border border-[#D8E0EE] p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="text-2xl font-bold text-[#1A3A6B]">
                  {resource.pointsCost > 0 ? `${resource.pointsCost} 积分` : '免费'}
                </div>
                <div className="flex items-center gap-1 text-sm text-[#5A6A85]">
                  <Download className="w-4 h-4" />
                  {resource.downloadCount.toLocaleString()}
                </div>
              </div>
              <button
                onClick={handleDownload}
                disabled={downloading}
                className="w-full py-3 bg-[#1A3A6B] text-white font-semibold rounded-xl hover:bg-[#2E6BE6] transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
              >
                <Download className="w-4 h-4" />
                {downloading ? '下载中...' : resource.pointsCost > 0 ? `花费${resource.pointsCost}积分下载` : '免费下载'}
              </button>
              <button
                onClick={handleFavorite}
                className={`w-full mt-3 py-2.5 font-medium rounded-xl border-2 transition-colors flex items-center justify-center gap-2 text-sm ${
                  favorited ? 'border-red-300 text-red-500 bg-red-50' : 'border-[#D8E0EE] text-[#5A6A85] hover:border-[#2E6BE6] hover:text-[#2E6BE6]'
                }`}
              >
                <Heart className={`w-4 h-4 ${favorited ? 'fill-red-400' : ''}`} />
                {favorited ? '已收藏' : '添加收藏'}
              </button>
            </div>

            {/* Meta Info */}
            <div className="bg-white rounded-2xl border border-[#D8E0EE] p-6 space-y-3">
              <h3 className="font-semibold text-[#0F1C35] mb-4">资料信息</h3>
              {[
                { icon: User, label: '上传者', value: resource.uploaderName },
                { icon: FileText, label: '文件格式', value: resource.fileName?.split('.').pop()?.toUpperCase() || 'PDF' },
                { icon: BookOpen, label: '页数', value: resource.pageCount ? `${resource.pageCount}页` : '未知' },
                { icon: Calendar, label: '上传时间', value: new Date(resource.createdAt).toLocaleDateString('zh-CN') },
              ].map((item) => (
                <div key={item.label} className="flex items-center justify-between">
                  <div className="flex items-center gap-2 text-sm text-[#5A6A85]">
                    <item.icon className="w-4 h-4" />
                    {item.label}
                  </div>
                  <span className="text-sm font-medium text-[#0F1C35]">{item.value}</span>
                </div>
              ))}
            </div>

            {/* Report */}
            <button
              onClick={() => setShowReportForm(!showReportForm)}
              className="w-full flex items-center justify-center gap-2 py-2.5 text-sm text-[#5A6A85] hover:text-red-500 border border-[#D8E0EE] rounded-xl hover:border-red-300 transition-colors"
            >
              <Flag className="w-4 h-4" />
              举报该资料
            </button>

            {showReportForm && (
              <form onSubmit={handleSubmitReport} className="bg-white rounded-2xl border border-[#D8E0EE] p-4">
                <h4 className="font-medium text-[#0F1C35] mb-3 flex items-center gap-2">
                  <AlertTriangle className="w-4 h-4 text-amber-500" />
                  举报原因
                </h4>
                <select
                  value={reportReason}
                  onChange={(e) => setReportReason(e.target.value)}
                  className="w-full text-sm border border-[#D8E0EE] rounded-lg px-3 py-2 mb-3 bg-white text-[#0F1C35] focus:outline-none"
                >
                  <option value="copyright">侵权盗版</option>
                  <option value="inappropriate">不当内容</option>
                  <option value="spam">广告垃圾</option>
                  <option value="other">其他原因</option>
                </select>
                <textarea
                  value={reportDesc}
                  onChange={(e) => setReportDesc(e.target.value)}
                  placeholder="请详细说明举报原因"
                  rows={2}
                  className="w-full text-sm border border-[#D8E0EE] rounded-lg px-3 py-2 mb-3 bg-white text-[#0F1C35] focus:outline-none resize-none"
                />
                <div className="flex gap-2">
                  <button type="submit" disabled={submitting} className="flex-1 py-2 bg-red-500 text-white text-sm font-medium rounded-lg hover:bg-red-600 transition-colors disabled:opacity-50">
                    {submitting ? '提交中...' : '提交举报'}
                  </button>
                  <button type="button" onClick={() => setShowReportForm(false)} className="px-3 py-2 text-sm text-[#5A6A85]">取消</button>
                </div>
              </form>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ResourceDetailView;
