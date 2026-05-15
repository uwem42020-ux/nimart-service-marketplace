// src/components/common/MobileBottomNav.tsx
import { useState, useEffect, useRef, useCallback } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { useNotifications } from '../../contexts/NotificationContext';
import { cn } from '../../lib/utils';

interface NavItem {
  id: string;
  label: string;
  iconId: string;      // sprite symbol id
  onClick: () => Promise<void> | void;
  badgeCount?: number;
  showBadge?: boolean;
}

export function MobileBottomNav() {
  const { user, profile } = useAuth();
  const { counts, markBookingsAsSeen, markMessagesAsSeen, markSystemAsSeen } = useNotifications();
  const navigate = useNavigate();
  const location = useLocation();
  
  // Local optimistic badge counts
  const [localBookings, setLocalBookings] = useState(counts.bookings);
  const [localMessages, setLocalMessages] = useState(counts.messages);
  const [localSystem, setLocalSystem] = useState(counts.system);
  
  const [visible, setVisible] = useState(true);
  const [tierPanelOpen, setTierPanelOpen] = useState(false);
  const [loadingId, setLoadingId] = useState<string | null>(null);
  const footerObserverRef = useRef<IntersectionObserver | null>(null);
  
  // Sync remote counts to local
  useEffect(() => {
    setLocalBookings(counts.bookings);
    setLocalMessages(counts.messages);
    setLocalSystem(counts.system);
  }, [counts.bookings, counts.messages, counts.system]);
  
  // Watch for tier panel events (from MobileCategoryPanel)
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
  
  // Hide nav when footer enters viewport
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
    markAsSeen?: () => Promise<void>,
    optimisticSetter?: (setter: React.Dispatch<React.SetStateAction<number>>) => void
  ) => {
    if (loadingId) return;
    setLoadingId(id);
    
    if (optimisticSetter) optimisticSetter(() => 0);
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
      iconId: 'home',
      onClick: () => navigate('/'),
    },
    {
      id: 'bookings',
      label: 'Bookings',
      iconId: 'booking',
      onClick: () => handleNavigation(
        'bookings',
        getLink('bookings'),
        markBookingsAsSeen,
        setLocalBookings
      ),
      badgeCount: localBookings,
      showBadge: localBookings > 0,
    },
    {
      id: 'messages',
      label: 'Messages',
      iconId: 'message',
      onClick: () => handleNavigation(
        'messages',
        getLink('messages'),
        markMessagesAsSeen,
        setLocalMessages
      ),
      badgeCount: localMessages,
      showBadge: localMessages > 0 && !location.pathname.includes('/messages'),
    },
    {
      id: 'alerts',
      label: 'Alerts',
      iconId: 'bell',
      onClick: () => handleNavigation(
        'alerts',
        getLink('notifications'),
        markSystemAsSeen,
        setLocalSystem
      ),
      badgeCount: localSystem,
      showBadge: localSystem > 0,
    },
    {
      id: 'map',
      label: 'Map',
      iconId: 'map',
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
                <svg className="w-6 h-6" aria-hidden="true">
                  <use href={`/icons/sprite.svg#${item.iconId}`} />
                </svg>
                {item.showBadge && (
                  <span className="absolute -top-1 -right-2 flex items-center justify-center min-w-[18px] h-[18px] px-1 text-[10px] font-bold leading-none text-white bg-red-500 rounded-full">
                    {item.badgeCount && item.badgeCount > 9 ? '9+' : item.badgeCount}
                  </span>
                )}
              </div>
              <span className="text-[10px] mt-1 leading-tight">{item.label}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
}