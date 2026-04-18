import { useState } from 'react';
import { Link } from 'react-router-dom';
import { ChevronRight, ChevronDown, ChevronUp } from 'lucide-react';
import { TIERS, CATEGORIES, SUBCATEGORIES } from '../../data/categories';
import { cn } from '../../lib/utils';

const tierIconMap: Record<string, string> = {
  automotive: '/categoryicons/roadside.png',
  'home-property': '/categoryicons/home.png',
  emergency: '/categoryicons/safety.png',
  professional: '/categoryicons/services.png',
  technology: '/categoryicons/technology.png',
  beauty: '/categoryicons/beauty.png',
  food: '/categoryicons/food.png',
  events: '/categoryicons/event.png',
  education: '/categoryicons/education.png',
  health: '/categoryicons/health.png',
  logistics: '/categoryicons/logistics.png',
  social: '/categoryicons/social.png',
  'business-partners': '/categoryicons/partner&support.png',
  trade: '/categoryicons/export.png',
};

const getCategoryIcon = (name: string) => {
  const firstChar = name.charAt(0).toUpperCase();
  return (
    <div className="w-5 h-5 rounded-full bg-primary-100 flex items-center justify-center text-primary-600 text-xs font-medium">
      {firstChar}
    </div>
  );
};

interface CategorySidebarProps {
  providerCounts: Record<string, number>;
  subcategoryCounts: Record<number, number>;
}

export function CategorySidebar({ providerCounts, subcategoryCounts }: CategorySidebarProps) {
  const [hoveredTier, setHoveredTier] = useState<string | null>(null);
  const [hoveredCategory, setHoveredCategory] = useState<string | null>(null);
  const [expanded, setExpanded] = useState(false);

  const visibleTiers = expanded ? TIERS : TIERS.slice(0, 7);

  const currentCategories = hoveredTier
    ? CATEGORIES.filter(c => c.tier_slug === hoveredTier)
    : [];
  const currentSubcategories = hoveredCategory
    ? SUBCATEGORIES.filter(s => s.category_slug === hoveredCategory)
    : [];

  const getTierCount = (tierSlug: string) => {
    const cats = CATEGORIES.filter(c => c.tier_slug === tierSlug);
    return cats.reduce((sum, cat) => sum + (providerCounts[cat.slug] || 0), 0);
  };

  const handleMouseLeave = () => {
    setHoveredTier(null);
    setHoveredCategory(null);
  };

  return (
    <div className="relative" onMouseLeave={handleMouseLeave}>
      <div className="sticky top-[64px] bg-white/80 backdrop-blur-md rounded-lg shadow-sm border border-gray-200/50 overflow-hidden max-h-[calc(100vh-80px)] overflow-y-auto w-64">
        <div className="pt-1">
          {visibleTiers.map(tier => (
            <div
              key={tier.slug}
              onMouseEnter={() => {
                setHoveredTier(tier.slug);
                setHoveredCategory(null);
              }}
              className="relative"
            >
              <Link
                to={`/search?tier=${tier.slug}`}
                className={cn(
                  'flex items-center justify-between px-3 py-2.5 hover:bg-gray-50/50 transition-colors',
                  hoveredTier === tier.slug && 'bg-primary-50/80 text-primary-700'
                )}
              >
                <div className="flex items-center gap-2">
                  <img
                    src={tierIconMap[tier.slug]}
                    alt={tier.name}
                    className="w-7 h-7 object-contain"
                  />
                  <span className="text-sm font-medium">{tier.name}</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-xs text-gray-400">({getTierCount(tier.slug)})</span>
                  <ChevronRight className="h-4 w-4 text-gray-400" />
                </div>
              </Link>
            </div>
          ))}

          {!expanded && TIERS.length > 7 && (
            <button
              onClick={() => setExpanded(true)}
              className="w-full flex items-center justify-center gap-1 px-3 py-2 text-sm text-primary-600 hover:bg-gray-50/50 transition-colors border-t border-gray-100"
            >
              <ChevronDown className="h-4 w-4" />
              More Categories
            </button>
          )}
          {expanded && (
            <button
              onClick={() => setExpanded(false)}
              className="w-full flex items-center justify-center gap-1 px-3 py-2 text-sm text-primary-600 hover:bg-gray-50/50 transition-colors border-t border-gray-100"
            >
              <ChevronUp className="h-4 w-4" />
              Show Less
            </button>
          )}
        </div>
      </div>

      {hoveredTier && currentCategories.length > 0 && (
        <div
          className="absolute left-64 top-0 w-64 bg-white/80 backdrop-blur-md rounded-r-lg shadow-lg border border-gray-200/50 z-50 max-h-96 overflow-y-auto"
          style={{ maxHeight: 'calc(100vh - 80px)' }}
          onMouseEnter={() => setHoveredTier(hoveredTier)}
        >
          {currentCategories.map(cat => (
            <div
              key={cat.slug}
              onMouseEnter={() => setHoveredCategory(cat.slug)}
              className="relative"
            >
              <Link
                to={`/search?category=${cat.slug}`}
                className={cn(
                  'flex items-center justify-between px-3 py-2.5 hover:bg-gray-50/50 transition-colors',
                  hoveredCategory === cat.slug && 'bg-primary-50/80 text-primary-700'
                )}
              >
                <div className="flex items-center gap-2">
                  {getCategoryIcon(cat.name)}
                  <span className="text-sm">{cat.name}</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-xs text-gray-400">({providerCounts[cat.slug] || 0})</span>
                  {SUBCATEGORIES.some(s => s.category_slug === cat.slug) && (
                    <ChevronRight className="h-4 w-4 text-gray-400" />
                  )}
                </div>
              </Link>
            </div>
          ))}
        </div>
      )}

      {hoveredCategory && currentSubcategories.length > 0 && (
        <div
          className="absolute left-[32rem] top-0 w-64 bg-white/80 backdrop-blur-md rounded-r-lg shadow-lg border border-gray-200/50 z-50 max-h-96 overflow-y-auto"
          style={{ maxHeight: 'calc(100vh - 80px)' }}
          onMouseEnter={() => setHoveredCategory(hoveredCategory)}
        >
          {currentSubcategories.map(sub => (
            <Link
              key={sub.id}
              to={`/search?subcategory=${sub.id}`}
              className="flex items-center justify-between px-3 py-2.5 text-sm text-gray-700 hover:bg-gray-50/50 hover:text-primary-600 transition-colors"
            >
              <div className="flex items-center gap-2">
                {getCategoryIcon(sub.name)}
                <span>{sub.name}</span>
              </div>
              <span className="text-xs text-gray-400">({subcategoryCounts[sub.id] || 0})</span>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}