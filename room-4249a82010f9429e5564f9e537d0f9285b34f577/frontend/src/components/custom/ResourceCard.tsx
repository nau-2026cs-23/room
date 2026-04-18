import { useState } from 'react';
import { Star, Download, Heart, Flag } from 'lucide-react';
import type { Resource } from '../../types';
import { RESOURCE_TYPE_LABELS, SUBJECT_LABELS, STAGE_LABELS } from '../../types';

interface ResourceCardProps {
  resource: Resource & { avgRating?: number; reviewCount?: number };
  onView: (id: string) => void;
  onFavorite?: (id: string) => void;
  isFavorited?: boolean;
  showStatus?: boolean;
}

const ResourceCard = ({ resource, onView, onFavorite, isFavorited, showStatus }: ResourceCardProps) => {
  const [favorited, setFavorited] = useState(isFavorited || false);

  const handleFavorite = (e: React.MouseEvent) => {
    e.stopPropagation();
    setFavorited(!favorited);
    onFavorite?.(resource.id);
  };

  const typeLabel = RESOURCE_TYPE_LABELS[resource.resourceType] || resource.resourceType;
  const subjectLabel = SUBJECT_LABELS[resource.subject] || resource.subject;
  const stageLabel = STAGE_LABELS[resource.stage] || resource.stage;

  const statusColors: Record<string, string> = {
    pending: 'text-amber-600 bg-amber-50',
    approved: 'text-green-600 bg-green-50',
    rejected: 'text-red-600 bg-red-50',
  };

  return (
    <article
      className="group bg-white rounded-2xl border border-[#D8E0EE] overflow-hidden hover:shadow-[0_10px_24px_-4px_rgb(26_58_107_/_0.15)] hover:-translate-y-1 transition-all duration-300 cursor-pointer"
      onClick={() => onView(resource.id)}
    >
      {/* Cover */}
      <div className={`relative h-36 overflow-hidden bg-gradient-to-br ${resource.coverGradient}`}>
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
        <div className="absolute top-3 left-3">
          <span className={`text-xs font-semibold text-white ${resource.tagColor} rounded-full px-2.5 py-1 transition-all duration-200 group-hover:scale-105`}>
            {typeLabel}
          </span>
        </div>
        <div className="absolute top-3 right-3">
          <button
            aria-label="收藏"
            onClick={handleFavorite}
            className="w-8 h-8 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center hover:bg-white/40 transition-all duration-200 transform group-hover:scale-110"
          >
            <Heart className={`w-4 h-4 transition-all duration-300 ${favorited ? 'fill-red-400 text-red-400 scale-110' : 'text-white'}`} />
          </button>
        </div>
        <div className="absolute bottom-3 left-3 right-3">
          <h3 className="text-sm font-bold text-white leading-tight line-clamp-2 transition-all duration-300 group-hover:opacity-90">{resource.title}</h3>
        </div>
      </div>

      {/* Body */}
      <div className="p-4">
        <div className="flex items-center gap-2 mb-3">
          <div className="flex items-center gap-1">
            <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
            <span className="text-xs font-semibold text-[#0F1C35]">
              {resource.avgRating ? resource.avgRating.toFixed(1) : '—'}
            </span>
          </div>
          <span className="text-xs text-[#5A6A85]">· {resource.reviewCount || 0} 评论</span>
          {resource.pageCount && (
            <span className="ml-auto text-xs text-[#5A6A85]">{resource.pageCount}页</span>
          )}
        </div>

        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-1.5">
            <div className="w-5 h-5 rounded-full bg-[#1A3A6B] flex items-center justify-center text-white text-xs font-bold">
              {resource.uploaderName.charAt(0)}
            </div>
            <span className="text-xs text-[#5A6A85] truncate max-w-[100px]">{resource.uploaderName}</span>
          </div>
          <div className="flex items-center gap-1 text-xs font-medium text-[#2E6BE6] transition-all duration-200 group-hover:translate-x-0.5">
            <Download className="w-3.5 h-3.5" />
            <span>{resource.downloadCount.toLocaleString()}</span>
          </div>
        </div>

        <div className="pt-3 border-t border-[#D8E0EE] flex items-center justify-between">
          <span className="text-xs font-medium text-[#5A6A85] bg-[#F4F6FA] rounded-full px-2.5 py-1 transition-all duration-200 group-hover:bg-[#E8EEFA]">
            {subjectLabel} · {stageLabel}
          </span>
          {showStatus ? (
            <span className={`text-xs font-medium rounded-full px-2.5 py-1 ${statusColors[resource.status] || 'text-gray-600 bg-gray-50'} transition-all duration-200 group-hover:scale-105`}>
              {resource.status === 'pending' ? '审核中' : resource.status === 'approved' ? '已通过' : '未通过'}
            </span>
          ) : resource.pointsCost > 0 ? (
            <button className="text-xs font-semibold text-white bg-[#2E6BE6] rounded-lg px-3 py-1.5 hover:bg-[#1A3A6B] transition-all duration-200 transform group-hover:scale-105">
              <span>{resource.pointsCost}积分</span>
            </button>
          ) : (
            <button className="text-xs font-semibold text-white bg-[#2E6BE6] rounded-lg px-3 py-1.5 hover:bg-[#1A3A6B] transition-all duration-200 transform group-hover:scale-105">
              免费下载
            </button>
          )}
        </div>
      </div>
    </article>
  );
};

export default ResourceCard;
