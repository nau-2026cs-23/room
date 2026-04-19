import { useState, useEffect } from 'react';
import { resourceApi } from '@/lib/api';
import type { Resource } from '@shared/types/api';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Search, Filter, Star, Download, SlidersHorizontal, X } from 'lucide-react';

interface ResourceListPageProps {
  initialFilter?: { category?: string; stage?: string };
  onGoToResource: (id: string) => void;
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
  { value: 'exercise', label: '习题' },
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

const stageLabels: Record<string, string> = { undergraduate: '本科', graduate: '研究生', exam_postgrad: '考研', exam_civil: '考公' };
const typeLabels: Record<string, string> = { notes: '笔记', exam_paper: '真题', slides: '课件', exercise: '习题', solution: '解析', other: '其他' };

export default function ResourceListPage({ initialFilter, onGoToResource }: ResourceListPageProps) {
  const [resources, setResources] = useState<Resource[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState('');
  const [searchInput, setSearchInput] = useState('');
  const [stage, setStage] = useState(initialFilter?.stage || '');
  const [category, setCategory] = useState(initialFilter?.category || '');
  const [resourceType, setResourceType] = useState('');
  const [sortBy, setSortBy] = useState<'createdAt' | 'downloadCount' | 'rating'>('createdAt');
  const [showFilters, setShowFilters] = useState(false);

  const pageSize = 12;

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      try {
        const res = await resourceApi.list({
          page,
          pageSize,
          search: search || undefined,
          stage: stage || undefined,
          category: category || undefined,
          resourceType: resourceType || undefined,
          sortBy,
          sortOrder: 'desc',
        });
        if (res.success) {
          setResources(res.data.resources);
          setTotal(res.data.total);
        }
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [page, search, stage, category, resourceType, sortBy]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setSearch(searchInput);
    setPage(1);
  };

  const clearFilters = () => {
    setStage('');
    setCategory('');
    setResourceType('');
    setSearch('');
    setSearchInput('');
    setPage(1);
  };

  const hasFilters = stage || category || resourceType || search;
  const totalPages = Math.ceil(total / pageSize);

  return (
    <div className="max-w-screen-xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-2xl md:text-3xl font-bold text-[#1E293B] mb-2">资料库</h1>
        <p className="text-[#64748B]">&#20849;&#26377; {total.toLocaleString()} 份资料</p>
      </div>

      {/* Search & Filter Bar */}
      <div className="bg-white rounded-2xl border border-[#E2E8F0] p-4 mb-6 shadow-sm">
        <form onSubmit={handleSearch} className="flex gap-3 mb-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#64748B]" />
            <Input
              placeholder="搜索资料名称..."
              value={searchInput}
              onChange={e => setSearchInput(e.target.value)}
              className="pl-9 h-10 border-[#E2E8F0]"
            />
          </div>
          <Button type="submit" className="bg-[#0F172A] text-white h-10 px-5 rounded-xl">搜索</Button>
          <Button
            type="button"
            variant="outline"
            onClick={() => setShowFilters(!showFilters)}
            className={`h-10 px-4 rounded-xl border-[#E2E8F0] ${showFilters ? 'bg-slate-100' : ''}`}
          >
            <SlidersHorizontal className="w-4 h-4 mr-1" />
            筛选
          </Button>
        </form>

        {showFilters && (
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-3 border-t border-[#E2E8F0]">
            <Select value={stage || 'none'} onValueChange={v => { setStage(v === 'none' ? '' : v); setPage(1); }}>
              <SelectTrigger className="h-9 text-sm border-[#E2E8F0]">
                <SelectValue placeholder="学习阶段" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="none">全部阶段</SelectItem>
                {STAGES.map(s => <SelectItem key={s.value} value={s.value}>{s.label}</SelectItem>)}
              </SelectContent>
            </Select>
            <Select value={category || 'none'} onValueChange={v => { setCategory(v === 'none' ? '' : v); setPage(1); }}>
              <SelectTrigger className="h-9 text-sm border-[#E2E8F0]">
                <SelectValue placeholder="学科分类" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="none">全部分类</SelectItem>
                {CATEGORIES.map(c => <SelectItem key={c.value} value={c.value}>{c.label}</SelectItem>)}
              </SelectContent>
            </Select>
            <Select value={resourceType || 'none'} onValueChange={v => { setResourceType(v === 'none' ? '' : v); setPage(1); }}>
              <SelectTrigger className="h-9 text-sm border-[#E2E8F0]">
                <SelectValue placeholder="资料类型" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="none">全部类型</SelectItem>
                {TYPES.map(t => <SelectItem key={t.value} value={t.value}>{t.label}</SelectItem>)}
              </SelectContent>
            </Select>
            <Select value={sortBy} onValueChange={v => { setSortBy(v as typeof sortBy); setPage(1); }}>
              <SelectTrigger className="h-9 text-sm border-[#E2E8F0]">
                <SelectValue placeholder="排序方式" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="createdAt">最新上传</SelectItem>
                <SelectItem value="downloadCount">下载最多</SelectItem>
                <SelectItem value="rating">评分最高</SelectItem>
              </SelectContent>
            </Select>
          </div>
        )}

        {hasFilters && (
          <div className="flex items-center gap-2 mt-3 flex-wrap">
            <span className="text-xs text-[#64748B]">当前筛选：</span>
            {search && <Badge className="bg-slate-100 text-slate-700 text-xs">搜索: {search} <button onClick={() => { setSearch(''); setSearchInput(''); }} className="ml-1"><X className="w-3 h-3" /></button></Badge>}
            {stage && <Badge className="bg-blue-50 text-blue-700 text-xs">{stageLabels[stage]} <button onClick={() => setStage('')} className="ml-1"><X className="w-3 h-3" /></button></Badge>}
            {category && <Badge className="bg-purple-50 text-purple-700 text-xs">{category} <button onClick={() => setCategory('')} className="ml-1"><X className="w-3 h-3" /></button></Badge>}
            {resourceType && <Badge className="bg-emerald-50 text-emerald-700 text-xs">{typeLabels[resourceType]} <button onClick={() => setResourceType('')} className="ml-1"><X className="w-3 h-3" /></button></Badge>}
            <button onClick={clearFilters} className="text-xs text-red-500 hover:underline">清除全部</button>
          </div>
        )}
      </div>

      {/* Resource Grid */}
      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {Array.from({ length: 12 }).map((_, i) => (
            <div key={i} className="h-44 bg-slate-100 rounded-2xl animate-pulse" />
          ))}
        </div>
      ) : resources.length === 0 ? (
        <div className="text-center py-20">
          <Filter className="w-12 h-12 mx-auto mb-4 text-slate-300" />
          <p className="text-[#64748B] font-medium">暂无匹配的资料</p>
          <p className="text-sm text-[#64748B] mt-1">尝试调整搜索条件</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {resources.map(r => (
            <ResourceCard key={r.id} resource={r} onClick={() => onGoToResource(r.id)} />
          ))}
        </div>
      )}

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-2 mt-10">
          <Button variant="outline" disabled={page === 1} onClick={() => setPage(p => p - 1)} className="rounded-xl border-[#E2E8F0]">上一页</Button>
          <span className="text-sm text-[#64748B] px-4">{page} / {totalPages}</span>
          <Button variant="outline" disabled={page === totalPages} onClick={() => setPage(p => p + 1)} className="rounded-xl border-[#E2E8F0]">下一页</Button>
        </div>
      )}
    </div>
  );
}

function ResourceCard({ resource, onClick }: { resource: Resource; onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      className="bg-white rounded-2xl border border-[#E2E8F0] p-5 text-left hover:shadow-md hover:border-[#6366F1]/30 transition-all group min-h-[160px] flex flex-col w-full"
    >
      <div className="flex items-start justify-between mb-3">
        <div className="flex gap-1.5 flex-wrap">
          <Badge className="bg-slate-100 text-slate-600 text-[10px] px-2 py-0.5">{stageLabels[resource.stage] || resource.stage}</Badge>
          <Badge className="bg-indigo-50 text-indigo-600 text-[10px] px-2 py-0.5">{typeLabels[resource.resourceType] || resource.resourceType}</Badge>
        </div>
        {resource.pointCost > 0 ? (
          <span className="text-xs font-semibold text-amber-600 bg-amber-50 px-2 py-0.5 rounded-full flex-shrink-0">{resource.pointCost}分</span>
        ) : (
          <span className="text-xs font-semibold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full flex-shrink-0">免费</span>
        )}
      </div>
      <h3 className="font-semibold text-[#1E293B] text-sm leading-tight mb-2 flex-1 line-clamp-2 group-hover:text-[#6366F1] transition-colors">{resource.title}</h3>
      {resource.description && (
        <p className="text-xs text-[#64748B] line-clamp-2 mb-3 leading-relaxed">{resource.description}</p>
      )}
      <div className="flex items-center justify-between text-xs text-[#64748B] mt-auto">
        <div className="flex items-center gap-1">
          <Star className="w-3 h-3 text-amber-400 fill-amber-400" />
          <span>{resource.rating > 0 ? resource.rating.toFixed(1) : '-'}</span>
        </div>
        <div className="flex items-center gap-1">
          <Download className="w-3 h-3" />
          <span>{resource.downloadCount.toLocaleString()}</span>
        </div>
        <span className="truncate max-w-[80px]">{resource.uploaderName}</span>
      </div>
    </button>
  );
}
