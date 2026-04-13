import { Link } from 'react-router-dom';
import {
  Car,
  Home,
  AlertTriangle,
  Briefcase,
  Laptop,
  Sparkles,
  Utensils,
  PartyPopper,
  GraduationCap,
  Heart,
  Truck,
  Users,
  Handshake,
  Globe,
  ChevronRight,
} from 'lucide-react';
import { useState } from 'react';
import { cn } from '../../lib/utils';

interface Category {
  name: string;
  slug: string;
  icon: React.ElementType;
  subcategories?: { name: string; slug: string }[];
}

const categories: Category[] = [
  {
    name: 'Automotive',
    slug: 'automotive',
    icon: Car,
    subcategories: [
      { name: 'Vehicle Mechanics', slug: 'vehicle-mechanics' },
      { name: 'Roadside Emergencies', slug: 'roadside-emergencies' },
      { name: 'Auto Repair', slug: 'auto-repair' },
      { name: 'Auto Maintenance', slug: 'auto-maintenance' },
    ],
  },
  {
    name: 'Home & Property',
    slug: 'home-property',
    icon: Home,
    subcategories: [
      { name: 'Plumbing', slug: 'plumbing' },
      { name: 'Electrical', slug: 'electrical' },
      { name: 'Construction', slug: 'construction' },
      { name: 'Carpentry', slug: 'carpentry' },
      { name: 'Painting', slug: 'painting' },
      { name: 'Cleaning', slug: 'cleaning' },
    ],
  },
  {
    name: 'Emergency & Safety',
    slug: 'emergency',
    icon: AlertTriangle,
  },
  {
    name: 'Professional Services',
    slug: 'professional',
    icon: Briefcase,
  },
  {
    name: 'Technology & Digital',
    slug: 'technology',
    icon: Laptop,
  },
  {
    name: 'Personal Care & Beauty',
    slug: 'beauty',
    icon: Sparkles,
  },
  {
    name: 'Food & Catering',
    slug: 'food',
    icon: Utensils,
  },
  {
    name: 'Events & Celebrations',
    slug: 'events',
    icon: PartyPopper,
  },
  {
    name: 'Education & Learning',
    slug: 'education',
    icon: GraduationCap,
  },
  {
    name: 'Health & Wellness',
    slug: 'health',
    icon: Heart,
  },
  {
    name: 'Logistics & Transportation',
    slug: 'logistics',
    icon: Truck,
  },
  {
    name: 'Social & Community',
    slug: 'social',
    icon: Users,
  },
  {
    name: 'Business Partners',
    slug: 'business-partners',
    icon: Handshake,
  },
  {
    name: 'Import/Export & Trade',
    slug: 'trade',
    icon: Globe,
  },
];

export function CategorySidebar() {
  const [expandedCategory, setExpandedCategory] = useState<string | null>(null);

  const toggleCategory = (slug: string) => {
    setExpandedCategory(expandedCategory === slug ? null : slug);
  };

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
      <h3 className="font-semibold text-gray-900 mb-3">Browse Categories</h3>
      <ul className="space-y-1">
        {categories.map((category) => {
          const Icon = category.icon;
          const isExpanded = expandedCategory === category.slug;
          const hasSubcategories = category.subcategories && category.subcategories.length > 0;

          return (
            <li key={category.slug}>
              <div className="flex items-center">
                <Link
                  to={`/search?category=${category.slug}`}
                  className="flex-1 flex items-center gap-2 py-2 px-2 rounded hover:bg-gray-50 text-sm text-gray-700 hover:text-primary-600 transition-colors"
                >
                  <Icon className="h-4 w-4 text-primary-500 flex-shrink-0" />
                  <span className="font-medium">{category.name}</span>
                </Link>
                {hasSubcategories && (
                  <button
                    onClick={() => toggleCategory(category.slug)}
                    className="p-1 hover:bg-gray-100 rounded transition-transform"
                    aria-label={isExpanded ? 'Collapse' : 'Expand'}
                  >
                    <ChevronRight
                      className={cn(
                        'h-4 w-4 text-gray-400 transition-transform',
                        isExpanded && 'rotate-90'
                      )}
                    />
                  </button>
                )}
              </div>
              {hasSubcategories && isExpanded && (
                <ul className="ml-6 mt-1 space-y-1 border-l-2 border-gray-100 pl-2">
                  {category.subcategories!.map((sub) => (
                    <li key={sub.slug}>
                      <Link
                        to={`/search?category=${category.slug}&subcategory=${sub.slug}`}
                        className="block py-1.5 px-2 text-sm text-gray-600 hover:text-primary-600 hover:bg-gray-50 rounded"
                      >
                        {sub.name}
                      </Link>
                    </li>
                  ))}
                </ul>
              )}
            </li>
          );
        })}
      </ul>
    </div>
  );
}