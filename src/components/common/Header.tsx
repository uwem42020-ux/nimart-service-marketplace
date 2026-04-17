import { Link, useNavigate, useLocation } from 'react-router-dom';
import { Bell, MessageCircle, Calendar, User, ChevronDown } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { useNotifications } from '../../contexts/NotificationContext';
import { useState } from 'react';
import { cn } from '../../lib/utils';
import { OptimizedImage } from './OptimizedImage';
import logo from '/logo.png';

export function Header() {
  const { user, profile, signOut } = useAuth();
  const { counts, markBookingsAsSeen, markMessagesAsSeen, markSystemAsSeen } = useNotifications();
  const navigate = useNavigate();
  const location = useLocation();
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);

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

  return (
    <header className="sticky top-0 z-50 bg-white/70 backdrop-blur-md border-b border-gray-200/50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <Link to="/" className="flex items-center">
            <img src={logo} alt="Nimart" className="h-10 w-auto" />
          </Link>

          <div className="flex items-center space-x-2 sm:space-x-4">
            <button
              onClick={handleBookingsClick}
              className="relative p-2 text-gray-600 hover:text-primary-600"
            >
              <Calendar className="h-6 w-6" />
              {counts.bookings > 0 && (
                <span className="absolute top-0 right-0 inline-flex items-center justify-center px-2 py-1 text-xs font-bold leading-none text-white transform translate-x-1/2 -translate-y-1/2 bg-red-500 rounded-full">
                  {counts.bookings > 9 ? '9+' : counts.bookings}
                </span>
              )}
            </button>

            <button
              onClick={handleMessagesClick}
              className="relative p-2 text-gray-600 hover:text-primary-600"
            >
              <MessageCircle className="h-6 w-6" />
              {showMessagesBadge && (
                <span className="absolute top-0 right-0 inline-flex items-center justify-center px-2 py-1 text-xs font-bold leading-none text-white transform translate-x-1/2 -translate-y-1/2 bg-red-500 rounded-full">
                  {counts.messages > 9 ? '9+' : counts.messages}
                </span>
              )}
            </button>

            <button
              onClick={handleNotificationsClick}
              className="relative p-2 text-gray-600 hover:text-primary-600"
            >
              <Bell className="h-6 w-6" />
              {counts.system > 0 && (
                <span className="absolute top-0 right-0 inline-flex items-center justify-center px-2 py-1 text-xs font-bold leading-none text-white transform translate-x-1/2 -translate-y-1/2 bg-red-500 rounded-full">
                  {counts.system > 9 ? '9+' : counts.system}
                </span>
              )}
            </button>

            <div className="relative">
              <button
                onClick={() => {
                  if (!user) {
                    navigate('/auth/signin');
                  } else {
                    setIsUserMenuOpen(!isUserMenuOpen);
                  }
                }}
                className="flex items-center space-x-2 p-1 rounded-full hover:bg-gray-100/50"
              >
                {user && profile?.avatar_url ? (
                  <OptimizedImage
                    src={profile.avatar_url}
                    alt={profile.full_name || 'User'}
                    className="h-8 w-8 rounded-full object-cover"
                  />
                ) : (
                  <div className="h-8 w-8 rounded-full bg-gray-200 flex items-center justify-center">
                    <User className="h-5 w-5 text-gray-600" />
                  </div>
                )}
                {user && <ChevronDown className="h-4 w-4 text-gray-500" />}
              </button>

              {user && isUserMenuOpen && (
                <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg py-1 border border-gray-200 z-10">
                  <Link
                    to={getDashboardLink()}
                    className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                    onClick={() => setIsUserMenuOpen(false)}
                  >
                    Dashboard
                  </Link>
                  <Link
                    to={profile?.role === 'provider' ? '/provider/profile' : '/customer/profile'}
                    className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                    onClick={() => setIsUserMenuOpen(false)}
                  >
                    Profile Settings
                  </Link>
                  <button
                    onClick={handleSignOut}
                    className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                  >
                    Sign Out
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}