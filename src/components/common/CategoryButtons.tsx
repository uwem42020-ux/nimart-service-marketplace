import { Link } from 'react-router-dom';
import { TIERS } from '../../data/categories';

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

export function CategoryButtons() {
  return (
    <div className="grid grid-cols-4 gap-2">
      {TIERS.map(tier => (
        <Link
          key={tier.slug}
          to={`/category/${tier.slug}`}
          className="flex flex-col items-center justify-center p-2 group"
        >
          <div className="w-14 h-14 rounded-full bg-primary-50 flex items-center justify-center mb-1 group-hover:bg-primary-100 transition-colors">
            <img
              src={tierIconMap[tier.slug]}
              alt={tier.name}
              className="w-9 h-9 object-contain"
            />
          </div>
          <span className="text-[10px] font-medium text-gray-700 text-center leading-tight">
            {tier.name}
          </span>
        </Link>
      ))}
    </div>
  );
}