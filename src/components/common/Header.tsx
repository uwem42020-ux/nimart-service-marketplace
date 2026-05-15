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
  const role = profile?.role || 'customer';

  const handleSignOut = async () => {
    await signOut();
    navigate('/');
    setIsUserMenuOpen(false);
    setMobileProfileOpen(false);
    setMobileView('main');
  };

  const getDashboardLink = () => (role === 'provider' ? '/provider/dashboard' : '/customer/dashboard');
  const getBookingsLink = () => (role === 'provider' ? '/provider/bookings' : '/customer/bookings');
  const getMessagesLink = () => (role === 'provider' ? '/provider/messages' : '/customer/messages');
  const getNotificationsLink = () => (role === 'provider' ? '/provider/notifications' : '/customer/notifications');
  const getProfileLink = () => (role === 'provider' ? '/provider/profile' : '/customer/profile');
  const getPortfolioLink = () => (role === 'provider' ? '/provider/portfolio' : null);
  const getServicesLink = () => (role === 'provider' ? '/provider/services' : null);
  const getVerificationLink = () => (role === 'provider' ? '/provider/verification' : null);

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
    if (closeTimeoutRef.current) clearTimeout(closeTimeoutRef.current);
    if (user) setIsUserMenuOpen(true);
  };

  const handleMouseLeave = () => {
    if (!user) return;
    closeTimeoutRef.current = setTimeout(() => setIsUserMenuOpen(false), 150);
  };

  useEffect(() => {
    return () => {
      if (closeTimeoutRef.current) clearTimeout(closeTimeoutRef.current);
    };
  }, []);

  // Mobile menu items (unchanged – uses Lucide icons)
  const mobileMainItems = [
    { label: 'Dashboard', icon: <LayoutDashboard className="h-5 w-5" />, to: getDashboardLink(), disabled: false },
    { label: 'Messages', icon: <MessageCircle className="h-5 w-5" />, to: getMessagesLink(), disabled: false },
    { label: 'My Bookings', icon: <Calendar className="h-5 w-5" />, to: getBookingsLink(), disabled: false },
    ...(role === 'provider' ? [
      { label: 'Portfolio', icon: <Image className="h-5 w-5" />, to: getPortfolioLink()!, disabled: false },
      { label: 'Set Prices', icon: <Package className="h-5 w-5" />, to: getServicesLink()!, disabled: false },
      { label: 'Get Verified', icon: <Shield className="h-5 w-5" />, to: getVerificationLink()!, disabled: profile?.is_verified === true },
    ] : []),
    { label: 'Settings', icon: <Settings className="h-5 w-5" />, action: () => setMobileView('settings'), disabled: false },
  ];

  const mobileSettingsItems = [
    { label: 'Profile Setup', icon: <Settings className="h-5 w-5" />, to: getProfileLink() },
    { label: 'Change Phone/Email', icon: <Phone className="h-5 w-5" />, to: getProfileLink() },
    { label: 'Change Language', icon: <Globe className="h-5 w-5" />, action: () => toast.success('Language selector coming soon') },
    { label: 'Change Password', icon: <Lock className="h-5 w-5" />, to: '/auth/reset-password' },
    { label: 'Delete My Account', icon: <Trash2 className="h-5 w-5 text-red-500" />, action: () => {
      if (window.confirm('Are you sure you want to delete your account? This action cannot be undone.')) {
        toast.error('Account deletion is not yet implemented.');
      }
    }, danger: true },
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
            <Link to="/" className="flex items-center">
              <img src={logo} alt="Nimart" className="h-10 w-auto" />
            </Link>

            <div className="flex items-center space-x-1 sm:space-x-2">
              {/* Bookings icon – Nimart dark green icon, light gray circle */}
              <button
                onClick={handleBookingsClick}
                title="Bookings"
                aria-label="Bookings"
                className="relative hidden md:block"
              >
                <span className="absolute inset-0 flex items-center justify-center rounded-full bg-gray-100" />
                <span className="relative flex items-center justify-center w-9 h-9">
                  <svg className="w-5 h-5 text-[#008751] transition-colors" aria-hidden="true">
                    <use href="/icons/sprite.svg#booking" />
                  </svg>
                  {counts.bookings > 0 && (
                    <span className="absolute -top-1 -right-1 flex items-center justify-center min-w-[18px] h-[18px] px-1 text-[10px] font-bold leading-none text-white bg-red-500 rounded-full">
                      {counts.bookings > 9 ? '9+' : counts.bookings}
                    </span>
                  )}
                </span>
              </button>

              {/* Messages icon – Nimart dark green */}
              <button
                onClick={handleMessagesClick}
                title="Messages"
                aria-label="Messages"
                className="relative hidden md:block"
              >
                <span className="absolute inset-0 flex items-center justify-center rounded-full bg-gray-100" />
                <span className="relative flex items-center justify-center w-9 h-9">
                  <svg className="w-5 h-5 text-[#008751] transition-colors" aria-hidden="true">
                    <use href="/icons/sprite.svg#message" />
                  </svg>
                  {showMessagesBadge && (
                    <span className="absolute -top-1 -right-1 flex items-center justify-center min-w-[18px] h-[18px] px-1 text-[10px] font-bold leading-none text-white bg-red-500 rounded-full">
                      {counts.messages > 9 ? '9+' : counts.messages}
                    </span>
                  )}
                </span>
              </button>

              {/* Notifications icon – Nimart dark green */}
              <button
                onClick={handleNotificationsClick}
                title="Notifications"
                aria-label="Notifications"
                className="relative hidden md:block"
              >
                <span className="absolute inset-0 flex items-center justify-center rounded-full bg-gray-100" />
                <span className="relative flex items-center justify-center w-9 h-9">
                  <svg className="w-5 h-5 text-[#008751] transition-colors" aria-hidden="true">
                    <use href="/icons/sprite.svg#bell" />
                  </svg>
                  {counts.system > 0 && (
                    <span className="absolute -top-1 -right-1 flex items-center justify-center min-w-[18px] h-[18px] px-1 text-[10px] font-bold leading-none text-white bg-red-500 rounded-full">
                      {counts.system > 9 ? '9+' : counts.system}
                    </span>
                  )}
                </span>
              </button>

              {/* Avatar / Profile – dark green circle, white icon (reverse) */}
              <div
                className="relative"
                ref={userMenuRef}
                onMouseEnter={handleMouseEnter}
                onMouseLeave={handleMouseLeave}
              >
                <button
                  title={user ? "Account" : "Sign In"}
                  aria-label={user ? "Account" : "Sign In"}
                  onClick={() => {
                    if (!user) navigate('/auth/signin');
                    else handleMobileProfileClick();
                  }}
                  className="flex items-center space-x-1 p-1"
                >
                  <span className="relative flex items-center justify-center w-9 h-9">
                    {/* Dark green circle background */}
                    <span className="absolute inset-0 rounded-full bg-[#008751]" />
                    {user && profile?.avatar_url ? (
                      <OptimizedImage
                        src={profile.avatar_url}
                        alt={profile.full_name || 'User'}
                        className="relative w-8 h-8 rounded-full object-cover ring-2 ring-white"
                      />
                    ) : (
                      <svg className="relative w-5 h-5 text-white" aria-hidden="true">
                        <use href="/icons/sprite.svg#avatar" />
                      </svg>
                    )}
                  </span>
                  {user && <ChevronDown className="h-4 w-4 text-gray-500 hidden md:block" />}
                </button>

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
                        to={getProfileLink()}
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

      {/* Mobile full‑screen profile panel (unchanged) */}
      {mobileProfileOpen && (
        <div className="fixed inset-0 z-50 md:hidden flex flex-col bg-white">
          <div className="flex items-center gap-4 px-4 py-3 border-b border-gray-200">
            <button
              onClick={() => {
                if (mobileView === 'settings') setMobileView('main');
                else closeMobileProfile();
              }}
              className="p-1 hover:bg-gray-100 rounded-full"
              aria-label="Back"
            >
              <ArrowLeft className="h-5 w-5 text-gray-600" />
            </button>
            <h2 className="font-semibold text-lg text-gray-900">
              {mobileView === 'settings' ? 'Settings' : 'Profile'}
            </h2>
          </div>
          <div className="flex-1 overflow-y-auto px-4 py-6">
            {mobileView === 'main' ? (
              <div className="grid grid-cols-2 gap-4">
                {mobileMainItems.map((item) =>
                  item.action ? (
                    <button
                      key={item.label}
                      onClick={item.action}
                      disabled={item.disabled}
                      className={cn(
                        'flex flex-col items-center justify-center p-4 rounded-xl border border-gray-100 bg-gray-50 transition',
                        item.disabled
                          ? 'opacity-40 pointer-events-none'
                          : 'hover:bg-primary-50 hover:border-primary-200'
                      )}
                      aria-label={item.label}
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
                <button
                  onClick={handleSignOut}
                  className="flex flex-col items-center justify-center p-4 rounded-xl border border-gray-100 bg-gray-50 hover:bg-red-50 hover:border-red-200 transition group"
                  aria-label="Sign Out"
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
                      aria-label={item.label}
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