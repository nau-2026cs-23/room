import { useState } from 'react';
import { Upload, FileText, CheckCircle, ArrowLeft } from 'lucide-react';
import { createResource } from '../../lib/api';
import type { ViewType } from '../../types';
import { CATEGORY_LABELS, SUBJECT_LABELS, STAGE_LABELS, RESOURCE_TYPE_LABELS, COVER_GRADIENTS, TAG_COLORS } from '../../types';
import { toast } from 'sonner';

interface UploadViewProps {
  onNavigate: (view: ViewType) => void;
}

const UploadView = ({ onNavigate }: UploadViewProps) => {
  const [form, setForm] = useState({
    title: '',
    description: '',
    category: 'basic',
    subject: 'math',
    stage: 'freshman',
    resourceType: 'notes',
    year: new Date().getFullYear(),
    pageCount: '',
    pointsCost: 0,
    fileUrl: '',
    fileName: '',
  });
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const handleChange = (field: string, value: string | number) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.title || !form.description) {
      toast.error('请填写标题和简介');
      return;
    }
    setSubmitting(true);
    try {
      const gradient = COVER_GRADIENTS[Math.floor(Math.random() * COVER_GRADIENTS.length)];
      const tagColor = TAG_COLORS[form.resourceType] || 'bg-blue-500';
      const res = await createResource({
        ...form,
        pageCount: form.pageCount ? Number(form.pageCount) : undefined,
        pointsCost: Number(form.pointsCost),
        coverGradient: gradient,
        tagColor,
      });
      if (res.success) {
        setSubmitted(true);
        toast.success('资料提交成功', { description: '审核通过后将获得积分奖励' });
      } else {
        toast.error('提交失败，请重试');
      }
    } catch {
      toast.error('提交失败，请重试');
    } finally {
      setSubmitting(false);
    }
  };

  if (submitted) {
    return (
      <div className="min-h-screen bg-[#F4F6FA] flex items-center justify-center px-4">
        <div className="bg-white rounded-2xl border border-[#D8E0EE] p-10 max-w-md w-full text-center shadow-[0_10px_24px_-4px_rgb(26_58_107_/_0.1)]">
          <div className="w-16 h-16 rounded-full bg-green-100 flex items-center justify-center mx-auto mb-4">
            <CheckCircle className="w-8 h-8 text-[#16A34A]" />
          </div>
          <h2 className="text-xl font-bold text-[#0F1C35] mb-2">提交成功！</h2>
          <p className="text-[#5A6A85] mb-6">资料已提交审核，预计24小时内完成审核。通过后将获得50-200积分奖励。</p>
          <div className="flex flex-col gap-3">
            <button
              onClick={() => { setSubmitted(false); setForm({ title: '', description: '', category: 'basic', subject: 'math', stage: 'freshman', resourceType: 'notes', year: new Date().getFullYear(), pageCount: '', pointsCost: 0, fileUrl: '', fileName: '' }); }}
              className="w-full py-3 bg-[#1A3A6B] text-white font-semibold rounded-xl hover:bg-[#2E6BE6] transition-colors"
            >
              继续上传
            </button>
            <button
              onClick={() => onNavigate('my-uploads')}
              className="w-full py-3 border-2 border-[#D8E0EE] text-[#5A6A85] font-medium rounded-xl hover:border-[#1A3A6B] hover:text-[#1A3A6B] transition-colors"
            >
              查看我的上传
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F4F6FA]">
      <div className="bg-white border-b border-[#D8E0EE] py-6">
        <div className="max-w-3xl mx-auto px-4 sm:px-6">
          <button onClick={() => onNavigate('home')} className="flex items-center gap-2 text-sm text-[#5A6A85] hover:text-[#1A3A6B] mb-4 transition-colors">
            <ArrowLeft className="w-4 h-4" />
            返回首页
          </button>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-[#1A3A6B] flex items-center justify-center">
              <Upload className="w-5 h-5 text-white" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-[#0F1C35]">上传学习资料</h1>
              <p className="text-sm text-[#5A6A85]">分享优质资料，获得50-200积分奖励</p>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-3xl mx-auto px-4 sm:px-6 py-8">
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Basic Info */}
          <div className="bg-white rounded-2xl border border-[#D8E0EE] p-6">
            <h2 className="text-base font-semibold text-[#0F1C35] mb-4 flex items-center gap-2">
              <FileText className="w-4 h-4 text-[#2E6BE6]" />
              基本信息
            </h2>
            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium text-[#0F1C35] mb-1.5 block">资料标题 <span className="text-red-500">*</span></label>
                <input
                  type="text"
                  value={form.title}
                  onChange={(e) => handleChange('title', e.target.value)}
                  placeholder="请输入资料标题"
                  className="w-full text-sm border border-[#D8E0EE] rounded-xl px-4 py-3 bg-[#F4F6FA] text-[#0F1C35] focus:outline-none focus:ring-2 focus:ring-[#2E6BE6] focus:bg-white transition-colors"
                />
              </div>
              <div>
                <label className="text-sm font-medium text-[#0F1C35] mb-1.5 block">资料简介 <span className="text-red-500">*</span></label>
                <textarea
                  value={form.description}
                  onChange={(e) => handleChange('description', e.target.value)}
                  placeholder="请详细描述资料内容、适用范围和使用建议"
                  rows={4}
                  className="w-full text-sm border border-[#D8E0EE] rounded-xl px-4 py-3 bg-[#F4F6FA] text-[#0F1C35] focus:outline-none focus:ring-2 focus:ring-[#2E6BE6] focus:bg-white transition-colors resize-none"
                />
              </div>
            </div>
          </div>

          {/* Classification */}
          <div className="bg-white rounded-2xl border border-[#D8E0EE] p-6">
            <h2 className="text-base font-semibold text-[#0F1C35] mb-4">分类信息</h2>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              <div>
                <label className="text-xs font-medium text-[#5A6A85] mb-1.5 block">学习阶段</label>
                <select value={form.category} onChange={(e) => handleChange('category', e.target.value)} className="w-full text-sm border border-[#D8E0EE] rounded-lg px-3 py-2.5 bg-white text-[#0F1C35] focus:outline-none focus:ring-1 focus:ring-[#2E6BE6]">
                  {Object.entries(CATEGORY_LABELS).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
                </select>
              </div>
              <div>
                <label className="text-xs font-medium text-[#5A6A85] mb-1.5 block">学科</label>
                <select value={form.subject} onChange={(e) => handleChange('subject', e.target.value)} className="w-full text-sm border border-[#D8E0EE] rounded-lg px-3 py-2.5 bg-white text-[#0F1C35] focus:outline-none focus:ring-1 focus:ring-[#2E6BE6]">
                  {Object.entries(SUBJECT_LABELS).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
                </select>
              </div>
              <div>
                <label className="text-xs font-medium text-[#5A6A85] mb-1.5 block">年级</label>
                <select value={form.stage} onChange={(e) => handleChange('stage', e.target.value)} className="w-full text-sm border border-[#D8E0EE] rounded-lg px-3 py-2.5 bg-white text-[#0F1C35] focus:outline-none focus:ring-1 focus:ring-[#2E6BE6]">
                  {Object.entries(STAGE_LABELS).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
                </select>
              </div>
              <div>
                <label className="text-xs font-medium text-[#5A6A85] mb-1.5 block">资料类型</label>
                <select value={form.resourceType} onChange={(e) => handleChange('resourceType', e.target.value)} className="w-full text-sm border border-[#D8E0EE] rounded-lg px-3 py-2.5 bg-white text-[#0F1C35] focus:outline-none focus:ring-1 focus:ring-[#2E6BE6]">
                  {Object.entries(RESOURCE_TYPE_LABELS).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
                </select>
              </div>
            </div>
          </div>

          {/* File & Points */}
          <div className="bg-white rounded-2xl border border-[#D8E0EE] p-6">
            <h2 className="text-base font-semibold text-[#0F1C35] mb-4">文件与积分设置</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="text-xs font-medium text-[#5A6A85] mb-1.5 block">文件链接 (URL)</label>
                <input
                  type="url"
                  value={form.fileUrl}
                  onChange={(e) => handleChange('fileUrl', e.target.value)}
                  placeholder="https://..."
                  className="w-full text-sm border border-[#D8E0EE] rounded-lg px-3 py-2.5 bg-white text-[#0F1C35] focus:outline-none focus:ring-1 focus:ring-[#2E6BE6]"
                />
              </div>
              <div>
                <label className="text-xs font-medium text-[#5A6A85] mb-1.5 block">文件名称</label>
                <input
                  type="text"
                  value={form.fileName}
                  onChange={(e) => handleChange('fileName', e.target.value)}
                  placeholder="例：高等数学笔记.pdf"
                  className="w-full text-sm border border-[#D8E0EE] rounded-lg px-3 py-2.5 bg-white text-[#0F1C35] focus:outline-none focus:ring-1 focus:ring-[#2E6BE6]"
                />
              </div>
              <div>
                <label className="text-xs font-medium text-[#5A6A85] mb-1.5 block">页数</label>
                <input
                  type="number"
                  value={form.pageCount}
                  onChange={(e) => handleChange('pageCount', e.target.value)}
                  placeholder="例：48"
                  min="1"
                  className="w-full text-sm border border-[#D8E0EE] rounded-lg px-3 py-2.5 bg-white text-[#0F1C35] focus:outline-none focus:ring-1 focus:ring-[#2E6BE6]"
                />
              </div>
              <div>
                <label className="text-xs font-medium text-[#5A6A85] mb-1.5 block">积分门槛 (0=免费)</label>
                <input
                  type="number"
                  value={form.pointsCost}
                  onChange={(e) => handleChange('pointsCost', Number(e.target.value))}
                  placeholder="0"
                  min="0"
                  max="500"
                  className="w-full text-sm border border-[#D8E0EE] rounded-lg px-3 py-2.5 bg-white text-[#0F1C35] focus:outline-none focus:ring-1 focus:ring-[#2E6BE6]"
                />
              </div>
            </div>
          </div>

          {/* Points Info */}
          <div className="bg-amber-50 border border-amber-200 rounded-xl p-4">
            <div className="flex items-start gap-3">
              <CheckCircle className="w-5 h-5 text-amber-600 mt-0.5 shrink-0" />
              <div>
                <p className="text-sm font-medium text-amber-800">积分奖励说明</p>
                <p className="text-xs text-amber-700 mt-1 leading-relaxed">资料审核通过后，您将获得50-200积分奖励。资料质量越高、下载量越大，奖励积分越多。请确保资料原创且不侵犯版权。</p>
              </div>
            </div>
          </div>

          <button
            type="submit"
            disabled={submitting}
            className="w-full py-4 bg-[#1A3A6B] text-white font-semibold rounded-xl hover:bg-[#2E6BE6] transition-all duration-200 shadow-[0_4px_12px_-2px_rgb(26_58_107_/_0.3)] disabled:opacity-50 flex items-center justify-center gap-2"
          >
            <Upload className="w-5 h-5" />
            {submitting ? '提交中...' : '提交审核'}
          </button>
        </form>
      </div>
    </div>
  );
};

export default UploadView;
