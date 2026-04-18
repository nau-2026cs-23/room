import { useState, useEffect } from 'react';
import { Search, Filter, SlidersHorizontal, BookOpen, X } from 'lucide-react';
import { getResources } from '../../lib/api';
import ResourceCard from './ResourceCard';
import type { Resource, ViewType } from '../../types';
import { CATEGORY_LABELS, SUBJECT_LABELS, STAGE_LABELS, RESOURCE_TYPE_LABELS } from '../../types';

interface ResourcesViewProps {
  onNavigate: (view: ViewType, resourceId?: string) => void;
  initialCategory?: string;
  initialSearch?: string;
}

const ResourcesView = ({ onNavigate, initialCategory, initialSearch }: ResourcesViewProps) => {
  const [search, setSearch] = useState(initialSearch || '');
  const [category, setCategory] = useState(initialCategory || '');
  const [subject, setSubject] = useState('');
  const [stage, setStage] = useState('');
  const [resourceType, setResourceType] = useState('');
  const [sortBy, setSortBy] = useState('latest');
  const [resources, setResources] = useState<(Resource & { avgRating: number; reviewCount: number })[]>([]);
  const [loading, setLoading] = useState(true);
  const [showFilters, setShowFilters] = useState(false);

  useEffect(() => {
    loadResources();
  }, [category, subject, stage, resourceType, sortBy]);

  const loadResources = async () => {
    setLoading(true);
    try {
      const res = await getResources({
        category,
        subject,
        stage,
        resourceType,
        sortBy: sortBy === 'downloads' ? 'downloads' : '',
        search,
      });
      if (res.success) setResources(res.data);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    loadResources();
  };

  const clearFilters = () => {
    setCategory('');
    setSubject('');
    setStage('');
    setResourceType('');
    setSearch('');
  };

  const hasFilters = category || subject || stage || resourceType || search;

  return (
    <div className="min-h-screen bg-[#F4F6FA]">
      {/* Header */}
      <div className="bg-white border-b border-[#D8E0EE] py-8">
        <div className="max-w-screen-xl mx-auto px-4 sm:px-6 lg:px-8">
          <h1 className="text-2xl font-bold text-[#0F1C35] mb-4">资料广场</h1>
          <form onSubmit={handleSearch} className="flex gap-3">
            <div className="flex-1 relative">
              <input
                type="search"
                placeholder="搜索资料标题、内容…"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-[#D8E0EE] bg-[#F4F6FA] text-[#0F1C35] text-sm focus:outline-none focus:ring-2 focus:ring-[#2E6BE6] focus:border-transparent"
              />
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#5A6A85]" />
            </div>
            <button type="submit" className="px-5 py-2.5 bg-[#1A3A6B] text-white text-sm font-semibold rounded-xl hover:bg-[#2E6BE6] transition-colors">
              搜索
            </button>
            <button
              type="button"
              onClick={() => setShowFilters(!showFilters)}
              className={`flex items-center gap-2 px-4 py-2.5 text-sm font-medium rounded-xl border transition-colors ${
                showFilters ? 'bg-[#1A3A6B] text-white border-[#1A3A6B]' : 'bg-white text-[#5A6A85] border-[#D8E0EE] hover:border-[#2E6BE6]'
              }`}
            >
              <SlidersHorizontal className="w-4 h-4" />
              <span className="hidden sm:inline">筛选</span>
            </button>
          </form>

          {/* Filters Panel */}
          {showFilters && (
            <div className="mt-4 p-4 bg-[#F4F6FA] rounded-xl border border-[#D8E0EE] grid grid-cols-2 sm:grid-cols-4 gap-4">
              <div>
                <label className="text-xs font-medium text-[#5A6A85] mb-1.5 block">学习阶段</label>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  className="w-full text-sm border border-[#D8E0EE] rounded-lg px-3 py-2 bg-white text-[#0F1C35] focus:outline-none focus:ring-1 focus:ring-[#2E6BE6]"
                >
                  <option value="">全部</option>
                  {Object.entries(CATEGORY_LABELS).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
                </select>
              </div>
              <div>
                <label className="text-xs font-medium text-[#5A6A85] mb-1.5 block">学科</label>
                <select
                  value={subject}
                  onChange={(e) => setSubject(e.target.value)}
                  className="w-full text-sm border border-[#D8E0EE] rounded-lg px-3 py-2 bg-white text-[#0F1C35] focus:outline-none focus:ring-1 focus:ring-[#2E6BE6]"
                >
                  <option value="">全部</option>
                  {Object.entries(SUBJECT_LABELS).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
                </select>
              </div>
              <div>
                <label className="text-xs font-medium text-[#5A6A85] mb-1.5 block">年级</label>
                <select
                  value={stage}
                  onChange={(e) => setStage(e.target.value)}
                  className="w-full text-sm border border-[#D8E0EE] rounded-lg px-3 py-2 bg-white text-[#0F1C35] focus:outline-none focus:ring-1 focus:ring-[#2E6BE6]"
                >
                  <option value="">全部</option>
                  {Object.entries(STAGE_LABELS).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
                </select>
              </div>
              <div>
                <label className="text-xs font-medium text-[#5A6A85] mb-1.5 block">资料类型</label>
                <select
                  value={resourceType}
                  onChange={(e) => setResourceType(e.target.value)}
                  className="w-full text-sm border border-[#D8E0EE] rounded-lg px-3 py-2 bg-white text-[#0F1C35] focus:outline-none focus:ring-1 focus:ring-[#2E6BE6]"
                >
                  <option value="">全部</option>
                  {Object.entries(RESOURCE_TYPE_LABELS).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
                </select>
              </div>
            </div>
          )}

          {/* Active Filters */}
          {hasFilters && (
            <div className="mt-3 flex items-center gap-2 flex-wrap">
              <span className="text-xs text-[#5A6A85]">当前筛选：</span>
              {category && <span className="text-xs bg-blue-100 text-[#2E6BE6] rounded-full px-2.5 py-1">{CATEGORY_LABELS[category]}</span>}
              {subject && <span className="text-xs bg-blue-100 text-[#2E6BE6] rounded-full px-2.5 py-1">{SUBJECT_LABELS[subject]}</span>}
              {stage && <span className="text-xs bg-blue-100 text-[#2E6BE6] rounded-full px-2.5 py-1">{STAGE_LABELS[stage]}</span>}
              {resourceType && <span className="text-xs bg-blue-100 text-[#2E6BE6] rounded-full px-2.5 py-1">{RESOURCE_TYPE_LABELS[resourceType]}</span>}
              {search && <span className="text-xs bg-blue-100 text-[#2E6BE6] rounded-full px-2.5 py-1">"{search}"</span>}
              <button onClick={clearFilters} className="text-xs text-red-500 hover:text-red-700 flex items-center gap-1">
                <X className="w-3 h-3" /> 清除筛选
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Sort Bar */}
      <div className="bg-white border-b border-[#D8E0EE]">
        <div className="max-w-screen-xl mx-auto px-4 sm:px-6 lg:px-8 py-3 flex items-center justify-between">
          <span className="text-sm text-[#5A6A85]">共 {resources.length} 份资料</span>
          <div className="flex items-center gap-2">
            <span className="text-xs text-[#5A6A85]">排序：</span>
            {[{ key: 'latest', label: '最新' }, { key: 'downloads', label: '下载最多' }, { key: 'rating', label: '评分最高' }].map((s) => (
              <button
                key={s.key}
                onClick={() => setSortBy(s.key)}
                className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-colors ${
                  sortBy === s.key ? 'text-[#2E6BE6] bg-blue-50' : 'text-[#5A6A85] hover:text-[#2E6BE6]'
                }`}
              >
                {s.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Grid */}
      <div className="max-w-screen-xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
            {[...Array(12)].map((_, i) => (
              <div key={i} className="bg-white rounded-2xl border border-[#D8E0EE] overflow-hidden animate-pulse">
                <div className="h-36 bg-gray-200" />
                <div className="p-4 space-y-3">
                  <div className="h-3 bg-gray-200 rounded w-3/4" />
                  <div className="h-3 bg-gray-200 rounded w-1/2" />
                </div>
              </div>
            ))}
          </div>
        ) : resources.length === 0 ? (
          <div className="text-center py-20">
            <BookOpen className="w-16 h-16 text-[#D8E0EE] mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-[#0F1C35] mb-2">暂无相关资料</h3>
            <p className="text-[#5A6A85] mb-6">尝试调整搜索条件，或成为第一个贡献者</p>
            <button onClick={() => onNavigate('upload')} className="px-6 py-2.5 bg-[#1A3A6B] text-white rounded-xl text-sm font-semibold hover:bg-[#2E6BE6] transition-colors">
              上传资料
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
            {resources.map((r) => (
              <ResourceCard
                key={r.id}
                resource={r}
                onView={(id) => onNavigate('resource-detail', id)}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default ResourcesView;
