import { Link, useNavigate, useLocation } from 'react-router-dom';
import { Menu, Bell, MessageCircle, Calendar, User, ChevronDown } from 'lucide-react';
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
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);

  // ✅ Hide message badge when user is already on any messages page
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
    if (!profile) return '/';
    return profile.role === 'provider' ? '/provider/bookings' : '/customer/bookings';
  };

  const getMessagesLink = () => {
    if (!profile) return '/customer/messages';
    return profile.role === 'provider' ? '/provider/messages' : '/customer/messages';
  };

  const getNotificationsLink = () => {
    if (!profile) return '/notifications';
    return profile.role === 'provider' ? '/provider/notifications' : '/customer/notifications';
  };

  const handleBookingsClick = async () => {
    await markBookingsAsSeen();
    navigate(getBookingsLink());
  };

  const handleMessagesClick = async () => {
    // ✅ Wait for the database update to complete before navigating
    await markMessagesAsSeen();
    navigate(getMessagesLink());
  };

  const handleNotificationsClick = async () => {
    await markSystemAsSeen();
    navigate(getNotificationsLink());
  };

  return (
    <header className="sticky top-0 z-50 bg-white border-b border-gray-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center">
            <img src={logo} alt="Nimart" className="h-10 w-auto" />
          </Link>

          {/* Right navigation */}
          <div className="flex items-center space-x-2 sm:space-x-4">
            {user ? (
              <>
                {/* Bookings */}
                <button
                  onClick={handleBookingsClick}
                  className="relative p-2 text-gray-600 hover:text-primary-600"
                >
                  <Calendar className="h-6 w-6" />
                  {counts.bookings > 0 && (
                    <span className="absolute top-0 right-0 inline-flex items-center justify-center px-2 py-1 text-xs font-bold leading-none text-white transform translate-x-1/2 -translate-y-1/2 bg-blue-500 rounded-full">
                      {counts.bookings > 9 ? '9+' : counts.bookings}
                    </span>
                  )}
                </button>

                {/* Messages */}
                <button
                  onClick={handleMessagesClick}
                  className="relative p-2 text-gray-600 hover:text-primary-600"
                >
                  <MessageCircle className="h-6 w-6" />
                  {showMessagesBadge && (
                    <span className="absolute top-0 right-0 inline-flex items-center justify-center px-2 py-1 text-xs font-bold leading-none text-white transform translate-x-1/2 -translate-y-1/2 bg-green-500 rounded-full">
                      {counts.messages > 9 ? '9+' : counts.messages}
                    </span>
                  )}
                </button>

                {/* System Notifications */}
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

                {/* User menu */}
                <div className="relative">
                  <button
                    onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
                    className="flex items-center space-x-2 p-1 rounded-full hover:bg-gray-100"
                  >
                    {profile?.avatar_url ? (
                      <OptimizedImage
                        src={profile.avatar_url}
                        alt={profile.full_name || 'User'}
                        className="h-8 w-8 rounded-full object-cover"
                      />
                    ) : (
                      <div className="h-8 w-8 rounded-full bg-primary-100 flex items-center justify-center">
                        <User className="h-5 w-5 text-primary-600" />
                      </div>
                    )}
                    <ChevronDown className="h-4 w-4 text-gray-500" />
                  </button>

                  {isUserMenuOpen && (
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
              </>
            ) : (
              <>
                <Link
                  to="/auth/signin"
                  className="text-gray-700 hover:text-primary-600 px-3 py-2 text-sm font-medium"
                >
                  Sign In
                </Link>
                <Link
                  to="/auth/signup"
                  className="bg-primary-600 text-white hover:bg-primary-700 px-4 py-2 rounded-full text-sm font-medium"
                >
                  Sign Up
                </Link>
              </>
            )}

            {/* Mobile menu button */}
            <button
              className="md:hidden p-2 rounded-md text-gray-600 hover:text-primary-600 hover:bg-gray-100"
              onClick={() => setIsMenuOpen(!isMenuOpen)}
            >
              <Menu className="h-6 w-6" />
            </button>
          </div>
        </div>
      </div>
    </header>
  );
}