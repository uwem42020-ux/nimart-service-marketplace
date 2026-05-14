// src/components/common/CategorySidebar.tsx
import { useState, useRef, useEffect } from 'react';
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
  const closeTimeout = useRef<NodeJS.Timeout | null>(null);

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

  // Delay closing flyouts to avoid accidental collapse
  const scheduleClose = () => {
    if (closeTimeout.current) clearTimeout(closeTimeout.current);
    closeTimeout.current = setTimeout(() => {
      setHoveredTier(null);
      setHoveredCategory(null);
    }, 100);
  };

  const cancelClose = () => {
    if (closeTimeout.current) clearTimeout(closeTimeout.current);
  };

  useEffect(() => {
    return () => {
      if (closeTimeout.current) clearTimeout(closeTimeout.current);
    };
  }, []);

  const handleMouseEnterTier = (tierSlug: string) => {
    cancelClose();
    setHoveredTier(tierSlug);
    setHoveredCategory(null);
  };

  const handleMouseEnterCategory = (catSlug: string) => {
    cancelClose();
    setHoveredCategory(catSlug);
  };

  const handleMouseLeaveSidebar = () => {
    scheduleClose();
  };

  const hoveredTierObj = hoveredTier ? TIERS.find(t => t.slug === hoveredTier) : null;
  const hoveredCategoryObj = hoveredCategory
    ? currentCategories.find(c => c.slug === hoveredCategory)
    : null;

  return (
    <div className="relative" onMouseLeave={handleMouseLeaveSidebar}>
      {/* Main tier list */}
      <div className="bg-white/80 backdrop-blur-md rounded-lg shadow-sm border border-gray-200/50 w-64">
        <div className="overflow-y-auto max-h-[calc(100vh-80px)]">
          <div className="pt-1">
            {visibleTiers.map(tier => (
              <div
                key={tier.slug}
                onMouseEnter={() => handleMouseEnterTier(tier.slug)}
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
                    <div>
                      <span className="text-sm font-medium block">{tier.name}</span>
                      <span className="text-xs text-gray-400">
                        {getTierCount(tier.slug)} provider{getTierCount(tier.slug) !== 1 ? 's' : ''}
                      </span>
                    </div>
                  </div>
                  <ChevronRight className="h-4 w-4 text-gray-400 flex-shrink-0" />
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
      </div>

      {/* Flyout for categories – full height, header with tier icon & name, 4px gap */}
      {hoveredTier && currentCategories.length > 0 && (
        <div
          className="absolute top-0 w-64 bg-white/80 backdrop-blur-md rounded-r-lg shadow-lg border border-gray-200/50 z-50 overflow-hidden flex flex-col"
          style={{ height: 'calc(100vh - 80px)', left: 'calc(16rem + 0.25rem)' }}
          onMouseEnter={() => {
            cancelClose();
            setHoveredTier(hoveredTier);  // keep active
          }}
          onMouseLeave={scheduleClose}
        >
          {/* Flyout header – matches mobile style */}
          <div className="sticky top-0 bg-primary-50/80 backdrop-blur-md border-b border-primary-100 flex items-center gap-3 px-3 py-2.5">
            {hoveredTierObj && (
              <img
                src={tierIconMap[hoveredTierObj.slug]}
                alt={hoveredTierObj.name}
                className="w-7 h-7 object-contain"
              />
            )}
            <h3 className="font-semibold text-gray-900 text-sm">
              {hoveredTierObj?.name}
            </h3>
          </div>
          <div className="overflow-y-auto flex-1">
            {currentCategories.map(cat => {
              const catCount = providerCounts[cat.slug] || 0;
              return (
                <div
                  key={cat.slug}
                  onMouseEnter={() => handleMouseEnterCategory(cat.slug)}
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
                      <span className="text-xs text-gray-400">
                        {catCount} provider{catCount !== 1 ? 's' : ''}
                      </span>
                      {SUBCATEGORIES.some(s => s.category_slug === cat.slug) && (
                        <ChevronRight className="h-4 w-4 text-gray-400" />
                      )}
                    </div>
                  </Link>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Flyout for subcategories – full height, header with category name, 4px gap */}
      {hoveredCategory && currentSubcategories.length > 0 && (
        <div
          className="absolute top-0 w-64 bg-white/80 backdrop-blur-md rounded-r-lg shadow-lg border border-gray-200/50 z-50 overflow-hidden flex flex-col"
          style={{ height: 'calc(100vh - 80px)', left: 'calc(32rem + 0.5rem)' }}
          onMouseEnter={() => {
            cancelClose();
            setHoveredCategory(hoveredCategory);
          }}
          onMouseLeave={scheduleClose}
        >
          {/* Subcategory flyout header */}
          <div className="sticky top-0 bg-primary-50/80 backdrop-blur-md border-b border-primary-100 flex items-center px-3 py-2.5">
            <h3 className="font-semibold text-gray-900 text-sm">
              {hoveredCategoryObj?.name}
            </h3>
          </div>
          <div className="overflow-y-auto flex-1">
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
                <span className="text-xs text-gray-400">
                  {subcategoryCounts[sub.id] || 0} provider{(subcategoryCounts[sub.id] || 0) !== 1 ? 's' : ''}
                </span>
              </Link>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}