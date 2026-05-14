// src/components/common/Header.tsx
import { Link, useNavigate, useLocation } from 'react-router-dom';
import {
  ChevronDown,
  LayoutDashboard,
  Settings,
  LogOut,
  ArrowLeft,
  Shield,
  Calendar,
  Image,
  Package,
  Phone,
  Globe,
  Lock,
  Trash2,
  MessageCircle,
} from 'lucide-react';
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
import toast from 'react-hot-toast';

export function Header() {
  const { user, profile, signOut } = useAuth();
  const { counts, markBookingsAsSeen, markMessagesAsSeen, markSystemAsSeen } = useNotifications();
  const navigate = useNavigate();
  const location = useLocation();
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const [mobileProfileOpen, setMobileProfileOpen] = useState(false);
  const [mobileView, setMobileView] = useState<'main' | 'settings'>('main');
  const userMenuRef = useRef<HTMLDivElement>(null);
  const closeTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const isOnMessagesPage = location.pathname.includes('/messages');
  const showMessagesBadge = !isOnMessagesPage && counts.messages > 0;

  const handleSignOut = async () => {
    await signOut();
    navigate('/');
    setIsUserMenuOpen(false);
    setMobileProfileOpen(false);
    setMobileView('main');
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

  const getProfileLink = () => {
    if (!profile) return '/auth/signin';
    return profile.role === 'provider' ? '/provider/profile' : '/customer/profile';
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

  // Mobile main menu items – includes Messages
  const mobileMainItems = [
    {
      label: 'Dashboard',
      icon: <LayoutDashboard className="h-5 w-5" />,
      to: getDashboardLink(),
      disabled: false,
    },
    {
      label: 'Messages',
      icon: <MessageCircle className="h-5 w-5" />,
      to: getMessagesLink(),
      disabled: false,
    },
    {
      label: 'My Bookings',
      icon: <Calendar className="h-5 w-5" />,
      to: getBookingsLink(),
      disabled: false,
    },
    {
      label: 'Portfolio',
      icon: <Image className="h-5 w-5" />,
      to: '/provider/portfolio',
      disabled: false,
    },
    {
      label: 'Set Prices',
      icon: <Package className="h-5 w-5" />,
      to: '/provider/services',
      disabled: false,
    },
    {
      label: 'Get Verified',
      icon: <Shield className="h-5 w-5" />,
      to: '/provider/verification',
      disabled: profile?.is_verified,
    },
    {
      label: 'Settings',
      icon: <Settings className="h-5 w-5" />,
      action: () => setMobileView('settings'),
      disabled: false,
    },
  ];

  // Mobile settings sub‑menu items (unchanged)
  const mobileSettingsItems = [
    {
      label: 'Profile Setup',
      icon: <Settings className="h-5 w-5" />,
      to: getProfileLink(),
    },
    {
      label: 'Change Phone/Email',
      icon: <Phone className="h-5 w-5" />,
      to: getProfileLink(),
    },
    {
      label: 'Change Language',
      icon: <Globe className="h-5 w-5" />,
      action: () => toast.success('Language selector coming soon'),
    },
    {
      label: 'Change Password',
      icon: <Lock className="h-5 w-5" />,
      to: '/auth/reset-password',
    },
    {
      label: 'Delete My Account',
      icon: <Trash2 className="h-5 w-5 text-red-500" />,
      action: () => {
        if (window.confirm('Are you sure you want to delete your account? This action cannot be undone.')) {
          toast.error('Account deletion is not yet implemented.');
        }
      },
      danger: true,
    },
  ];

  const handleMobileProfileClick = () => {
    if (!user) {
      navigate('/auth/signin');
      return;
    }
    setMobileView('main');
    setMobileProfileOpen(true);
  };

  const closeMobileProfile = () => {
    setMobileProfileOpen(false);
    setMobileView('main');
  };

  return (
    <>
      <header className="sticky top-0 z-50 bg-white/70 backdrop-blur-md border-b border-gray-200/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            {/* Logo */}
            <Link to="/" className="flex items-center">
              <img src={logo} alt="Nimart" className="h-10 w-auto" />
            </Link>

            {/* Right navigation – desktop: all icons; mobile: only Profile */}
            <div className="flex items-center space-x-1 sm:space-x-2">
              {/* Desktop only: Bookings */}
              <button
                onClick={handleBookingsClick}
                title="Bookings"
                className="relative hidden md:block"
              >
                <CustomBookingIcon />
                {counts.bookings > 0 && (
                  <span className="absolute top-0 right-0 inline-flex items-center justify-center px-1.5 py-0.5 text-xs font-bold leading-none text-white transform translate-x-1/4 -translate-y-1/4 bg-red-500 rounded-full min-w-[18px]">
                    {counts.bookings > 9 ? '9+' : counts.bookings}
                  </span>
                )}
              </button>

              {/* Desktop only: Messages */}
              <button
                onClick={handleMessagesClick}
                title="Messages"
                className="relative hidden md:block"
              >
                <CustomMessageIcon />
                {showMessagesBadge && (
                  <span className="absolute top-0 right-0 inline-flex items-center justify-center px-1.5 py-0.5 text-xs font-bold leading-none text-white transform translate-x-1/4 -translate-y-1/4 bg-red-500 rounded-full min-w-[18px]">
                    {counts.messages > 9 ? '9+' : counts.messages}
                  </span>
                )}
              </button>

              {/* Desktop only: Notifications */}
              <button
                onClick={handleNotificationsClick}
                title="Notifications"
                className="relative hidden md:block"
              >
                <CustomBellIcon />
                {counts.system > 0 && (
                  <span className="absolute top-0 right-0 inline-flex items-center justify-center px-1.5 py-0.5 text-xs font-bold leading-none text-white transform translate-x-1/4 -translate-y-1/4 bg-red-500 rounded-full min-w-[18px]">
                    {counts.system > 9 ? '9+' : counts.system}
                  </span>
                )}
              </button>

              {/* User Menu – desktop dropdown, mobile full panel */}
              <div
                className="relative"
                ref={userMenuRef}
                onMouseEnter={handleMouseEnter}
                onMouseLeave={handleMouseLeave}
              >
                <button
                  title={user ? "Account" : "Sign In"}
                  onClick={() => {
                    if (!user) {
                      navigate('/auth/signin');
                    } else {
                      handleMobileProfileClick();
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
                  {user && <ChevronDown className="h-4 w-4 text-gray-500 hidden md:block" />}
                </button>

                {/* Desktop dropdown */}
                {user && isUserMenuOpen && (
                  <div
                    className="absolute right-0 pt-2 z-10 hidden md:block"
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

      {/* Mobile full‑screen profile panel */}
      {mobileProfileOpen && (
        <div className="fixed inset-0 z-50 md:hidden flex flex-col bg-white">
          {/* Header with back button */}
          <div className="flex items-center gap-4 px-4 py-3 border-b border-gray-200">
            <button
              onClick={() => {
                if (mobileView === 'settings') {
                  setMobileView('main');
                } else {
                  closeMobileProfile();
                }
              }}
              className="p-1 hover:bg-gray-100 rounded-full"
            >
              <ArrowLeft className="h-5 w-5 text-gray-600" />
            </button>
            <h2 className="font-semibold text-lg text-gray-900">
              {mobileView === 'settings' ? 'Settings' : 'Profile'}
            </h2>
          </div>

          {/* Content */}
          <div className="flex-1 overflow-y-auto px-4 py-6">
            {mobileView === 'main' ? (
              <div className="grid grid-cols-2 gap-4">
                {mobileMainItems.map((item) =>
                  item.action ? (
                    <button
                      key={item.label}
                      onClick={item.action}
                      className={cn(
                        'flex flex-col items-center justify-center p-4 rounded-xl border border-gray-100 bg-gray-50 transition',
                        item.disabled
                          ? 'opacity-40 pointer-events-none'
                          : 'hover:bg-primary-50 hover:border-primary-200'
                      )}
                    >
                      <div className={cn('mb-2', item.disabled ? 'text-gray-400' : 'text-primary-600')}>
                        {item.icon}
                      </div>
                      <span className={cn('text-xs font-medium text-center', item.disabled ? 'text-gray-400' : 'text-gray-700')}>
                        {item.label}
                      </span>
                    </button>
                  ) : (
                    <Link
                      key={item.label}
                      to={item.to || '#'}
                      onClick={closeMobileProfile}
                      className={cn(
                        'flex flex-col items-center justify-center p-4 rounded-xl border border-gray-100 bg-gray-50 transition',
                        item.disabled
                          ? 'opacity-40 pointer-events-none'
                          : 'hover:bg-primary-50 hover:border-primary-200'
                      )}
                    >
                      <div className={cn('mb-2', item.disabled ? 'text-gray-400' : 'text-primary-600')}>
                        {item.icon}
                      </div>
                      <span className={cn('text-xs font-medium text-center', item.disabled ? 'text-gray-400' : 'text-gray-700')}>
                        {item.label}
                      </span>
                    </Link>
                  )
                )}

                {/* Sign Out */}
                <button
                  onClick={handleSignOut}
                  className="flex flex-col items-center justify-center p-4 rounded-xl border border-gray-100 bg-gray-50 hover:bg-red-50 hover:border-red-200 transition group"
                >
                  <LogOut className="h-5 w-5 text-red-500 group-hover:text-red-600 mb-2" />
                  <span className="text-xs font-medium text-red-500 group-hover:text-red-600">Sign Out</span>
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-2 gap-4">
                {mobileSettingsItems.map((item) =>
                  item.action ? (
                    <button
                      key={item.label}
                      onClick={item.action}
                      className={cn(
                        'flex flex-col items-center justify-center p-4 rounded-xl border border-gray-100 bg-gray-50 transition hover:bg-primary-50 hover:border-primary-200',
                        item.danger && 'hover:bg-red-50 hover:border-red-200'
                      )}
                    >
                      <div className={cn('mb-2', item.danger ? 'text-red-500' : 'text-primary-600')}>
                        {item.icon}
                      </div>
                      <span className={cn('text-xs font-medium text-center', item.danger ? 'text-red-500' : 'text-gray-700')}>
                        {item.label}
                      </span>
                    </button>
                  ) : (
                    <Link
                      key={item.label}
                      to={item.to || '#'}
                      onClick={closeMobileProfile}
                      className={cn(
                        'flex flex-col items-center justify-center p-4 rounded-xl border border-gray-100 bg-gray-50 transition hover:bg-primary-50 hover:border-primary-200',
                        item.danger && 'hover:bg-red-50 hover:border-red-200'
                      )}
                    >
                      <div className={cn('mb-2', item.danger ? 'text-red-500' : 'text-primary-600')}>
                        {item.icon}
                      </div>
                      <span className={cn('text-xs font-medium text-center', item.danger ? 'text-red-500' : 'text-gray-700')}>
                        {item.label}
                      </span>
                    </Link>
                  )
                )}
              </div>
            )}
          </div>
        </div>
      )}
    </>
  );
}