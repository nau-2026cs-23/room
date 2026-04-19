import { useState } from 'react';
import { resourceApi } from '@/lib/api';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';
import { Upload, FileText, X, Plus, Loader2, CheckCircle, Info } from 'lucide-react';

interface UploadPageProps {
  onSuccess: () => void;
}

const STAGES = [
  { value: 'undergraduate', label: '本科' },
  { value: 'graduate', label: '研究生' },
  { value: 'exam_postgrad', label: '考研' },
  { value: 'exam_civil', label: '考公' },
];

const TYPES = [
  { value: 'notes', label: '笔记' },
  { value: 'exam_paper', label: '真题' },
  { value: 'slides', label: '课件' },
  { value: 'exercise', label: '习题集' },
  { value: 'solution', label: '解析' },
  { value: 'other', label: '其他' },
];

const CATEGORIES = [
  { value: 'math', label: '数学类' },
  { value: 'cs', label: '计算机类' },
  { value: 'physics', label: '物理类' },
  { value: 'english', label: '英语类' },
  { value: 'economics', label: '经济类' },
  { value: 'law', label: '法学类' },
  { value: 'other', label: '其他' },
];

const POINT_TIERS = [
  { value: '0', label: '免费 (0积分)' },
  { value: '5', label: '基础档 (5积分)' },
  { value: '15', label: '标准档 (15积分)' },
  { value: '30', label: '高级档 (30积分)' },
];

export default function UploadPage({ onSuccess }: UploadPageProps) {
  const { user } = useAuth();
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState('');
  const [stage, setStage] = useState('');
  const [resourceType, setResourceType] = useState('');
  const [pointCost, setPointCost] = useState('0');
  const [school, setSchool] = useState('');
  const [year, setYear] = useState('');
  const [tagInput, setTagInput] = useState('');
  const [tags, setTags] = useState<string[]>([]);
  const [fileUrl, setFileUrl] = useState('');
  const [fileName, setFileName] = useState('');
  const [fileSize, setFileSize] = useState(0);
  const [pageCount, setPageCount] = useState('');
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const addTag = () => {
    const t = tagInput.trim();
    if (t && !tags.includes(t) && tags.length < 10) {
      setTags(prev => [...prev, t]);
      setTagInput('');
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const maxSize = 100 * 1024 * 1024;
    if (file.size > maxSize) { toast.error('文件过大', { description: '单文件不能超过100MB' }); return; }
    const allowed = ['.pdf', '.doc', '.docx', '.ppt', '.pptx'];
    const ext = '.' + file.name.split('.').pop()?.toLowerCase();
    if (!allowed.includes(ext)) { toast.error('格式不支持', { description: '支持格式：PDF、DOC/DOCX、PPT/PPTX' }); return; }
    setFileName(file.name);
    setFileSize(file.size);
    // Simulate upload - in production this would upload to S3
    setFileUrl(`https://storage.example.com/resources/${Date.now()}_${file.name}`);
    toast.success('文件已选择', { description: '提交后将进入审核队列' });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!fileUrl) { toast.error('请选择要上传的文件'); return; }
    if (!title || !category || !stage || !resourceType) { toast.error('请填写必要信息'); return; }
    setLoading(true);
    try {
      const res = await resourceApi.create({
        title,
        description,
        category,
        stage: stage as 'undergraduate' | 'graduate' | 'exam_postgrad' | 'exam_civil',
        resourceType: resourceType as 'notes' | 'exam_paper' | 'slides' | 'exercise' | 'solution' | 'other',
        fileUrl,
        fileName,
        fileSize,
        pageCount: parseInt(pageCount) || 0,
        pointCost: parseInt(pointCost) as 0 | 5 | 15 | 30,
        tags,
        year: year ? parseInt(year) : undefined,
        school: school || undefined,
      });
      if (res.success) {
        setSubmitted(true);
        toast.success('上传成功', { description: '资料已提交审核，审核通过后将获得30积分奖励' });
      } else {
        toast.error('上传失败', { description: res.message });
      }
    } finally {
      setLoading(false);
    }
  };

  if (submitted) {
    return (
      <div className="max-w-2xl mx-auto px-4 sm:px-6 py-16 text-center">
        <div className="w-20 h-20 bg-emerald-50 rounded-full flex items-center justify-center mx-auto mb-6">
          <CheckCircle className="w-10 h-10 text-emerald-500" />
        </div>
        <h2 className="text-2xl font-bold text-[#1E293B] mb-3">上传成功！</h2>
        <p className="text-[#64748B] mb-2">资料已提交审核队列</p>
        <p className="text-sm text-[#64748B] mb-8">普通用户资料将24小时内完成审核，认证教师资料可享6小时快速通道</p>
        <div className="flex gap-3 justify-center">
          <Button onClick={() => setSubmitted(false)} variant="outline" className="rounded-xl border-[#E2E8F0]">继续上传</Button>
          <Button onClick={onSuccess} className="bg-[#0F172A] text-white rounded-xl">查看我的资料</Button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-8">
        <h1 className="text-2xl md:text-3xl font-bold text-[#1E293B] mb-2">上传资料</h1>
        <p className="text-[#64748B]">分享优质内容，审核通过后获得30积分奖励</p>
      </div>

      {/* Upload Rules */}
      <div className="bg-blue-50 border border-blue-200 rounded-2xl p-4 mb-6">
        <div className="flex items-start gap-3">
          <Info className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
          <div className="text-sm text-blue-800">
            <p className="font-semibold mb-1">审核要求</p>
            <ul className="space-y-1 text-xs text-blue-700">
              <li>• 支持格式：PDF、DOC/DOCX、PPT/PPTX，单文件≤100MB</li>
              <li>• 内容需与分类标签高度匹配，不得包含版权侵权内容</li>
              <li>• 审核通过后自动发放30积分，每次被下载额外获得2积分</li>
            </ul>
          </div>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* File Upload */}
        <div className="bg-white rounded-2xl border border-[#E2E8F0] p-6">
          <h3 className="font-semibold text-[#1E293B] mb-4">选择文件</h3>
          <label className="block">
            <div className={`border-2 border-dashed rounded-xl p-8 text-center cursor-pointer transition-colors ${
              fileName ? 'border-emerald-300 bg-emerald-50' : 'border-[#E2E8F0] hover:border-[#6366F1] hover:bg-slate-50'
            }`}>
              {fileName ? (
                <div className="flex items-center justify-center gap-3">
                  <FileText className="w-8 h-8 text-emerald-500" />
                  <div className="text-left">
                    <p className="font-medium text-[#1E293B]">{fileName}</p>
                    <p className="text-sm text-[#64748B]">{(fileSize / 1024 / 1024).toFixed(2)} MB</p>
                  </div>
                </div>
              ) : (
                <>
                  <Upload className="w-10 h-10 text-[#64748B] mx-auto mb-3" />
                  <p className="font-medium text-[#1E293B] mb-1">点击选择文件</p>
                  <p className="text-sm text-[#64748B]">PDF、DOC/DOCX、PPT/PPTX，最大100MB</p>
                </>
              )}
            </div>
            <input type="file" className="hidden" accept=".pdf,.doc,.docx,.ppt,.pptx" onChange={handleFileChange} />
          </label>
        </div>

        {/* Basic Info */}
        <div className="bg-white rounded-2xl border border-[#E2E8F0] p-6 space-y-5">
          <h3 className="font-semibold text-[#1E293B]">基本信息</h3>
          <div className="space-y-2">
            <Label className="text-[#1E293B] font-medium">资料标题 *</Label>
            <Input value={title} onChange={e => setTitle(e.target.value)} placeholder="输入资料标题" required className="border-[#E2E8F0]" />
          </div>
          <div className="space-y-2">
            <Label className="text-[#1E293B] font-medium">资料简介</Label>
            <Textarea value={description} onChange={e => setDescription(e.target.value)} placeholder="描述资料内容、适用对象、主要知识点..." rows={3} className="border-[#E2E8F0] resize-none" />
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label className="text-[#1E293B] font-medium">学习阶段 *</Label>
              <Select value={stage || 'none'} onValueChange={v => setStage(v === 'none' ? '' : v)}>
                <SelectTrigger className="border-[#E2E8F0]"><SelectValue placeholder="选择阶段" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">选择阶段</SelectItem>
                  {STAGES.map(s => <SelectItem key={s.value} value={s.value}>{s.label}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label className="text-[#1E293B] font-medium">学科分类 *</Label>
              <Select value={category || 'none'} onValueChange={v => setCategory(v === 'none' ? '' : v)}>
                <SelectTrigger className="border-[#E2E8F0]"><SelectValue placeholder="选择分类" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">选择分类</SelectItem>
                  {CATEGORIES.map(c => <SelectItem key={c.value} value={c.value}>{c.label}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label className="text-[#1E293B] font-medium">资料类型 *</Label>
              <Select value={resourceType || 'none'} onValueChange={v => setResourceType(v === 'none' ? '' : v)}>
                <SelectTrigger className="border-[#E2E8F0]"><SelectValue placeholder="选择类型" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">选择类型</SelectItem>
                  {TYPES.map(t => <SelectItem key={t.value} value={t.value}>{t.label}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label className="text-[#1E293B] font-medium">积分门槛</Label>
              <Select value={pointCost} onValueChange={setPointCost}>
                <SelectTrigger className="border-[#E2E8F0]"><SelectValue /></SelectTrigger>
                <SelectContent>
                  {POINT_TIERS.map(t => <SelectItem key={t.value} value={t.value}>{t.label}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label className="text-[#1E293B] font-medium">适用学校</Label>
              <Input value={school} onChange={e => setSchool(e.target.value)} placeholder="如：清华大学" className="border-[#E2E8F0]" />
            </div>
            <div className="space-y-2">
              <Label className="text-[#1E293B] font-medium">年份</Label>
              <Input value={year} onChange={e => setYear(e.target.value)} placeholder="如：2025" type="number" min="2000" max="2030" className="border-[#E2E8F0]" />
            </div>
          </div>
          <div className="space-y-2">
            <Label className="text-[#1E293B] font-medium">标签</Label>
            <div className="flex gap-2">
              <Input
                value={tagInput}
                onChange={e => setTagInput(e.target.value)}
                onKeyDown={e => { if (e.key === 'Enter') { e.preventDefault(); addTag(); } }}
                placeholder="输入标签后按Enter添加"
                className="border-[#E2E8F0]"
              />
              <Button type="button" onClick={addTag} variant="outline" size="sm" className="border-[#E2E8F0] px-3">
                <Plus className="w-4 h-4" />
              </Button>
            </div>
            {tags.length > 0 && (
              <div className="flex flex-wrap gap-2 mt-2">
                {tags.map(tag => (
                  <Badge key={tag} className="bg-slate-100 text-slate-700 text-xs">
                    {tag}
                    <button type="button" onClick={() => setTags(prev => prev.filter(t => t !== tag))} className="ml-1">
                      <X className="w-3 h-3" />
                    </button>
                  </Badge>
                ))}
              </div>
            )}
          </div>
        </div>

        <Button
          type="submit"
          disabled={loading || !fileUrl}
          className="w-full h-12 bg-[#0F172A] hover:bg-[#1E293B] text-white font-semibold rounded-xl text-base"
        >
          {loading ? <><Loader2 className="w-4 h-4 animate-spin mr-2" />提交中...</> : <><Upload className="w-4 h-4 mr-2" />提交审核</>}
        </Button>
      </form>
    </div>
  );
}
