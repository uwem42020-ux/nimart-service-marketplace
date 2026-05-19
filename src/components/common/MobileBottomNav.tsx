// src/components/common/MobileBottomNav.tsx
import { useState, useEffect, useRef } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { useNotifications } from '../../contexts/NotificationContext';
import { cn } from '../../lib/utils';
import { CalendarDays } from 'lucide-react';

// Solid SVG icons (message & bell)
const SolidMessageIcon = ({ className }: { className?: string }) => (
  <svg className={className} viewBox="0 0 24 24" fill="currentColor">
    <path d="M20 2H4c-1.1 0-1.99.9-1.99 2L2 22l4-4h14c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2zm-2 12H6v-2h12v2zm0-3H6V9h12v2zm0-3H6V6h12v2z"/>
  </svg>
);

const SolidBellIcon = ({ className }: { className?: string }) => (
  <svg className={className} viewBox="0 0 24 24" fill="currentColor">
    <path d="M12 22c1.1 0 2-.9 2-2h-4c0 1.1.9 2 2 2zm7-5h-1v-4c0-3.3-2.7-6-6-6s-6 2.7-6 6v4H5v2h14v-2z"/>
  </svg>
);

interface NavItem {
  id: string;
  label: string;
  icon: React.ReactNode;
  onClick: () => Promise<void> | void;
}

export function MobileBottomNav() {
  const { profile } = useAuth();
  const { markBookingsAsSeen, markMessagesAsSeen, markSystemAsSeen } = useNotifications();
  const navigate = useNavigate();
  const location = useLocation();
  
  const [visible, setVisible] = useState(true);
  const [tierPanelOpen, setTierPanelOpen] = useState(false);
  const [loadingId, setLoadingId] = useState<string | null>(null);
  const footerObserverRef = useRef<IntersectionObserver | null>(null);
  
  useEffect(() => {
    const handlePanelOpen = () => setTierPanelOpen(true);
    const handlePanelClose = () => setTierPanelOpen(false);
    window.addEventListener('tierPanelOpened', handlePanelOpen);
    window.addEventListener('tierPanelClosed', handlePanelClose);
    return () => {
      window.removeEventListener('tierPanelOpened', handlePanelOpen);
      window.removeEventListener('tierPanelClosed', handlePanelClose);
    };
  }, []);
  
  useEffect(() => {
    const footer = document.querySelector('footer');
    if (!footer) return;
    footerObserverRef.current = new IntersectionObserver(
      ([entry]) => setVisible(!entry.isIntersecting),
      { threshold: 0, rootMargin: '0px' }
    );
    footerObserverRef.current.observe(footer);
    return () => footerObserverRef.current?.disconnect();
  }, []);
  
  const handleNavigation = async (
    id: string,
    navigateTo: string,
    markAsSeen?: () => Promise<void>
  ) => {
    if (loadingId) return;
    setLoadingId(id);
    navigate(navigateTo);
    if (markAsSeen) {
      markAsSeen().catch(console.error);
    }
    setTimeout(() => setLoadingId(null), 500);
  };
  
  const getLink = (roleSuffix: string) => {
    if (!profile) return '/auth/signin';
    return profile.role === 'provider' ? `/provider/${roleSuffix}` : `/customer/${roleSuffix}`;
  };
  
  const isActive = (path: string) => location.pathname.startsWith(path);
  
  const navItems: NavItem[] = [
    {
      id: 'home',
      label: 'Home',
      icon: (
        <svg className="w-6 h-6" aria-hidden="true">
          <use href="/icons/sprite.svg#home" />
        </svg>
      ),
      onClick: () => navigate('/'),
    },
    {
      id: 'bookings',
      label: 'Bookings',
      icon: <CalendarDays className="w-6 h-6" />,
      onClick: () => handleNavigation('bookings', getLink('bookings'), markBookingsAsSeen),
    },
    {
      id: 'messages',
      label: 'Messages',
      icon: <SolidMessageIcon className="w-6 h-6" />,
      onClick: () => handleNavigation('messages', getLink('messages'), markMessagesAsSeen),
    },
    {
      id: 'alerts',
      label: 'Alerts',
      icon: <SolidBellIcon className="w-6 h-6" />,
      onClick: () => handleNavigation('alerts', getLink('notifications'), markSystemAsSeen),
    },
    {
      id: 'map',
      label: 'Map',
      icon: (
        <svg className="w-6 h-6" aria-hidden="true">
          <use href="/icons/sprite.svg#map" />
        </svg>
      ),
      onClick: () => navigate('/map'),
    },
  ];
  
  if (tierPanelOpen) return null;
  
  return (
    <div
      className={cn(
        'md:hidden fixed bottom-0 left-0 right-0 z-50',
        'bg-white/90 backdrop-blur-md border-t border-gray-200/50',
        'transition-all duration-300 ease-out',
        'pb-[env(safe-area-inset-bottom)] pt-1',
        visible ? 'translate-y-0 opacity-100' : 'translate-y-full opacity-0'
      )}
    >
      <div className="flex justify-around items-center min-h-[56px]">
        {navItems.map((item) => {
          const active = isActive(
            item.id === 'home' ? '/' :
            item.id === 'map' ? '/map' :
            `/${profile?.role}/${item.id}`
          );
          return (
            <button
              key={item.id}
              onClick={item.onClick}
              disabled={loadingId === item.id}
              aria-label={item.label}
              className={cn(
                'relative flex flex-col items-center justify-center flex-1 py-1',
                'transition-colors duration-200',
                active
                  ? 'text-primary-600'
                  : 'text-gray-500 hover:text-primary-600',
                loadingId === item.id && 'opacity-50 cursor-not-allowed'
              )}
            >
              <div className="relative">
                {item.icon}
                {/* No badges */}
              </div>
              <span className="text-[10px] mt-1 leading-tight">{item.label}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
}