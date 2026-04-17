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
    <div className="grid grid-cols-4 md:grid-cols-7 gap-2 md:gap-3">
      {tiers.map((tier) => {
        const Icon = iconMap[tier.slug] || Briefcase;
        return (
          <Link
            key={tier.slug}
            to={`/search?tier=${tier.slug}`}
            className="flex flex-col items-center justify-center p-2 md:p-4 bg-white md:rounded-xl md:border md:border-gray-200 md:shadow-sm hover:shadow-md hover:border-primary-200 transition-all group"
          >
            <div className="w-10 h-10 md:w-14 md:h-14 rounded-full bg-primary-50 flex items-center justify-center mb-1 md:mb-2 group-hover:bg-primary-100 transition">
              <Icon className="h-5 w-5 md:h-7 md:w-7 text-primary-600" />
            </div>
            <span className="text-[10px] md:text-xs font-medium text-gray-700 text-center leading-tight">
              {tier.name}
            </span>
          </Link>
        );
      })}
    </div>
  );
}