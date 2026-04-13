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
} from 'lucide-react';
import type { Tier } from '../../data/categories';

// Map tier slugs to Lucide icons
const iconMap: Record<string, React.ElementType> = {
  'automotive': Car,
  'home-property': Home,
  'emergency': AlertTriangle,
  'professional': Briefcase,
  'technology': Laptop,
  'beauty': Sparkles,
  'food': Utensils,
  'events': PartyPopper,
  'education': GraduationCap,
  'health': Heart,
  'logistics': Truck,
  'social': Users,
  'business-partners': Handshake,
  'trade': Globe,
};

interface CategoryButtonsProps {
  tiers: Tier[];
}

export function CategoryButtons({ tiers }: CategoryButtonsProps) {
  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-7 gap-3">
      {tiers.map((tier) => {
        const Icon = iconMap[tier.slug] || Briefcase;
        return (
          <Link
            key={tier.slug}
            to={`/search?tier=${tier.slug}`}
            className="flex flex-col items-center justify-center p-4 bg-white rounded-xl border border-gray-200 shadow-sm hover:shadow-md hover:border-primary-200 transition-all group"
          >
            <div className="w-14 h-14 rounded-full bg-primary-50 flex items-center justify-center mb-2 group-hover:bg-primary-100 transition">
              <Icon className="h-7 w-7 text-primary-600" />
            </div>
            <span className="text-xs font-medium text-gray-700 text-center leading-tight">
              {tier.name}
            </span>
          </Link>
        );
      })}
    </div>
  );
}