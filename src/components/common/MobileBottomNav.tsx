// src/components/common/MobileBottomNav.tsx
import { useState, useEffect, useRef } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { useNotifications } from '../../contexts/NotificationContext';
import { cn } from '../../lib/utils';
import { Map, Home, Calendar, MessageCircle, Bell } from 'lucide-react';

export function MobileBottomNav() {
  const { user, profile } = useAuth();
  const { counts, markBookingsAsSeen, markMessagesAsSeen, markSystemAsSeen } = useNotifications();
  const navigate = useNavigate();
  const location = useLocation();
  const [visible, setVisible] = useState(true);
  const [tierPanelOpen, setTierPanelOpen] = useState(false);
  const hideTimer = useRef<NodeJS.Timeout | null>(null);

  // Hide when a tier panel is open
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

  // Hide when footer is visible
  useEffect(() => {
    const footer = document.querySelector('footer');
    if (!footer) return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          hideTimer.current = setTimeout(() => setVisible(false), 200);
        } else {
          if (hideTimer.current) clearTimeout(hideTimer.current);
          setVisible(true);
        }
      },
      { rootMargin: '0px', threshold: 0.1 }
    );
    observer.observe(footer);
    return () => {
      observer.disconnect();
      if (hideTimer.current) clearTimeout(hideTimer.current);
    };
  }, []);

  const isOnMessagesPage = location.pathname.includes('/messages');
  const showMessagesBadge = !isOnMessagesPage && counts.messages > 0;

  const getBookingsLink = () => {
    if (!profile) return '/auth/signin';
    return profile.role === 'provider' ? '/provider/bookings' : '/customer/bookings';
  };

  const getMessagesLink = () => {
    if (!profile) return '/auth/signin';
    return profile.role === 'provider' ? '/provider/messages' : '/customer/messages';
  };

  const getNotificationsLink = () => {
    if (!profile) return '/auth/signin';
    return profile.role === 'provider' ? '/provider/notifications' : '/customer/notifications';
  };

  // Fixed click handlers: mark as seen, then navigate
  const handleBookingsClick = async (e: React.MouseEvent) => {
    e.preventDefault();
    if (!user) {
      navigate('/auth/signin');
      return;
    }
    await markBookingsAsSeen();
    navigate(getBookingsLink());
  };

  const handleMessagesClick = async (e: React.MouseEvent) => {
    e.preventDefault();
    if (!user) {
      navigate('/auth/signin');
      return;
    }
    await markMessagesAsSeen();
    navigate(getMessagesLink());
  };

  const handleNotificationsClick = async (e: React.MouseEvent) => {
    e.preventDefault();
    if (!user) {
      navigate('/auth/signin');
      return;
    }
    await markSystemAsSeen();
    navigate(getNotificationsLink());
  };

  const buttonClass =
    'relative flex flex-col items-center justify-center flex-1 h-14 text-gray-500 hover:text-primary-600 transition-colors';

  const showNav = visible && !tierPanelOpen;

  return (
    <div
      className={cn(
        'md:hidden fixed bottom-0 left-0 right-0 z-50 bg-white/90 backdrop-blur-md border-t border-gray-200/50 transition-all duration-300',
        'pb-[env(safe-area-inset-bottom)]',
        showNav ? 'translate-y-0 opacity-100' : 'translate-y-full opacity-0'
      )}
    >
      <div className="flex justify-around items-center h-14">
        {/* Home */}
        <Link to="/" className={buttonClass}>
          <Home className="h-6 w-6" />
          <span className="text-[10px] mt-0.5 leading-tight">Home</span>
        </Link>

        {/* Bookings */}
        <Link to={getBookingsLink()} onClick={handleBookingsClick} className={buttonClass}>
          <Calendar className="h-6 w-6" />
          {counts.bookings > 0 && (
            <span className="absolute top-1 right-1/3 inline-flex items-center justify-center px-1.5 py-0.5 text-xs font-bold leading-none text-white bg-red-500 rounded-full min-w-[18px]">
              {counts.bookings > 9 ? '9+' : counts.bookings}
            </span>
          )}
          <span className="text-[10px] mt-0.5 leading-tight">Bookings</span>
        </Link>

        {/* Messages */}
        <Link to={getMessagesLink()} onClick={handleMessagesClick} className={buttonClass}>
          <MessageCircle className="h-6 w-6" />
          {showMessagesBadge && (
            <span className="absolute top-1 right-1/3 inline-flex items-center justify-center px-1.5 py-0.5 text-xs font-bold leading-none text-white bg-red-500 rounded-full min-w-[18px]">
              {counts.messages > 9 ? '9+' : counts.messages}
            </span>
          )}
          <span className="text-[10px] mt-0.5 leading-tight">Messages</span>
        </Link>

        {/* Notifications */}
        <Link to={getNotificationsLink()} onClick={handleNotificationsClick} className={buttonClass}>
          <Bell className="h-6 w-6" />
          {counts.system > 0 && (
            <span className="absolute top-1 right-1/3 inline-flex items-center justify-center px-1.5 py-0.5 text-xs font-bold leading-none text-white bg-red-500 rounded-full min-w-[18px]">
              {counts.system > 9 ? '9+' : counts.system}
            </span>
          )}
          <span className="text-[10px] mt-0.5 leading-tight">Alerts</span>
        </Link>

        {/* Map */}
        <Link to="/map" className={buttonClass}>
          <Map className="h-6 w-6" />
          <span className="text-[10px] mt-0.5 leading-tight">Map</span>
        </Link>
      </div>
    </div>
  );
}