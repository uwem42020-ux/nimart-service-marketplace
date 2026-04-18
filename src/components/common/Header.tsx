// src/components/common/Header.tsx
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { ChevronDown, LayoutDashboard, Settings, LogOut } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { useNotifications } from '../../contexts/NotificationContext';
import { useState, useRef, useEffect } from 'react';
import { cn } from '../../lib/utils';
import { OptimizedImage } from './OptimizedImage';
import { CustomAvatarIcon } from '../icons/CustomAvatarIcon';
import { CustomBellIcon } from '../icons/CustomBellIcon';
import { CustomMessageIcon } from '../icons/CustomMessageIcon';
import { CustomBookingIcon } from '../icons/CustomBookingIcon';
import logo from '/logo.png';

export function Header() {
  const { user, profile, signOut } = useAuth();
  const { counts, markBookingsAsSeen, markMessagesAsSeen, markSystemAsSeen } = useNotifications();
  const navigate = useNavigate();
  const location = useLocation();
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const closeTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const isOnMessagesPage = location.pathname.includes('/messages');
  const showMessagesBadge = !isOnMessagesPage && counts.messages > 0;

  const handleSignOut = async () => {
    await signOut();
    navigate('/');
  };

  const getDashboardLink = () => {
    if (!profile) return '/';
    return profile.role === 'provider' ? '/provider/dashboard' : '/customer/dashboard';
  };

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

  const handleBookingsClick = async () => {
    if (!user) {
      navigate('/auth/signin');
      return;
    }
    await markBookingsAsSeen();
    navigate(getBookingsLink());
  };

  const handleMessagesClick = async () => {
    if (!user) {
      navigate('/auth/signin');
      return;
    }
    await markMessagesAsSeen();
    navigate(getMessagesLink());
  };

  const handleNotificationsClick = async () => {
    if (!user) {
      navigate('/auth/signin');
      return;
    }
    await markSystemAsSeen();
    navigate(getNotificationsLink());
  };

  const handleMouseEnter = () => {
    if (closeTimeoutRef.current) {
      clearTimeout(closeTimeoutRef.current);
      closeTimeoutRef.current = null;
    }
    if (user) setIsUserMenuOpen(true);
  };

  const handleMouseLeave = () => {
    if (!user) return;
    closeTimeoutRef.current = setTimeout(() => {
      setIsUserMenuOpen(false);
    }, 150);
  };

  useEffect(() => {
    return () => {
      if (closeTimeoutRef.current) clearTimeout(closeTimeoutRef.current);
    };
  }, []);

  return (
    <header className="sticky top-0 z-50 bg-white/70 backdrop-blur-md border-b border-gray-200/50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center">
            <img src={logo} alt="Nimart" className="h-10 w-auto" />
          </Link>

          {/* Right navigation */}
          <div className="flex items-center space-x-1 sm:space-x-2">
            {/* Bookings */}
            <button
              onClick={handleBookingsClick}
              title="Bookings"
              className="relative"
            >
              <CustomBookingIcon />
              {counts.bookings > 0 && (
                <span className="absolute top-0 right-0 inline-flex items-center justify-center px-2 py-1 text-xs font-bold leading-none text-white transform translate-x-1/4 -translate-y-1/4 bg-red-500 rounded-full">
                  {counts.bookings > 9 ? '9+' : counts.bookings}
                </span>
              )}
            </button>

            {/* Messages */}
            <button
              onClick={handleMessagesClick}
              title="Messages"
              className="relative"
            >
              <CustomMessageIcon />
              {showMessagesBadge && (
                <span className="absolute top-0 right-0 inline-flex items-center justify-center px-2 py-1 text-xs font-bold leading-none text-white transform translate-x-1/4 -translate-y-1/4 bg-red-500 rounded-full">
                  {counts.messages > 9 ? '9+' : counts.messages}
                </span>
              )}
            </button>

            {/* Notifications */}
            <button
              onClick={handleNotificationsClick}
              title="Notifications"
              className="relative"
            >
              <CustomBellIcon />
              {counts.system > 0 && (
                <span className="absolute top-0 right-0 inline-flex items-center justify-center px-2 py-1 text-xs font-bold leading-none text-white transform translate-x-1/4 -translate-y-1/4 bg-red-500 rounded-full">
                  {counts.system > 9 ? '9+' : counts.system}
                </span>
              )}
            </button>

            {/* User Menu */}
            <div
              className="relative"
              onMouseEnter={handleMouseEnter}
              onMouseLeave={handleMouseLeave}
            >
              <button
                title={user ? "Account" : "Sign In"}
                onClick={() => {
                  if (!user) {
                    navigate('/auth/signin');
                  }
                }}
                className="flex items-center space-x-1 p-1"
              >
                {user && profile?.avatar_url ? (
                  <OptimizedImage
                    src={profile.avatar_url}
                    alt={profile.full_name || 'User'}
                    className="h-8 w-8 rounded-full object-cover ring-2 ring-white"
                  />
                ) : (
                  <CustomAvatarIcon />
                )}
                {user && <ChevronDown className="h-4 w-4 text-gray-500" />}
              </button>

              {/* Dropdown Menu */}
              {user && isUserMenuOpen && (
                <div
                  className="absolute right-0 pt-2 z-10"
                  onMouseEnter={handleMouseEnter}
                  onMouseLeave={handleMouseLeave}
                >
                  <div className="bg-white rounded-md shadow-lg py-1 border border-gray-200 min-w-[180px]">
                    <Link
                      to={getDashboardLink()}
                      className="flex items-center gap-3 px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 transition-colors"
                      onClick={() => setIsUserMenuOpen(false)}
                    >
                      <LayoutDashboard className="h-4 w-4 text-gray-500" />
                      Dashboard
                    </Link>
                    <Link
                      to={profile?.role === 'provider' ? '/provider/profile' : '/customer/profile'}
                      className="flex items-center gap-3 px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 transition-colors"
                      onClick={() => setIsUserMenuOpen(false)}
                    >
                      <Settings className="h-4 w-4 text-gray-500" />
                      Profile Settings
                    </Link>
                    <hr className="my-1 border-gray-100" />
                    <button
                      onClick={handleSignOut}
                      className="flex items-center gap-3 w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50 transition-colors"
                    >
                      <LogOut className="h-4 w-4" />
                      Sign Out
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}