// src/pages/customer/Dashboard.tsx
import { useEffect, useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { supabase } from '../../lib/supabase';
import { Link } from 'react-router-dom';
import { Calendar, Clock, CheckCircle, Search, User } from 'lucide-react';
import { LocationPrompt } from '../../components/customer/LocationPrompt';
import { NimartSpinner } from '../../components/common/NimartSpinner';

interface DashboardStats {
  totalBookings: number;
  pendingBookings: number;
  completedBookings: number;
  upcomingBookings: number;
}

interface BookingWithProvider {
  id: string;
  service_name: string;
  booking_date: string;
  booking_time: string;
  status: string;
  provider_id: string;
  provider?: {
    business_name: string | null;
    profile: {
      full_name: string | null;
    } | null;
  };
}

export default function CustomerDashboard() {
  const { user, profile } = useAuth();
  const [stats, setStats] = useState<DashboardStats>({
    totalBookings: 0,
    pendingBookings: 0,
    completedBookings: 0,
    upcomingBookings: 0,
  });
  const [recentBookings, setRecentBookings] = useState<BookingWithProvider[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;
    fetchDashboardData();
  }, [user]);

  async function fetchDashboardData() {
    setLoading(true);
    try {
      const { data: bookings, error } = await supabase
        .from('bookings')
        .select('*')
        .eq('customer_id', user!.id)
        .order('booking_date', { ascending: true })
        .order('booking_time', { ascending: true });

      if (error) throw error;
      if (!bookings) {
        setStats({ totalBookings: 0, pendingBookings: 0, completedBookings: 0, upcomingBookings: 0 });
        setRecentBookings([]);
        setLoading(false);
        return;
      }

      const providerIds = [...new Set(bookings.map(b => b.provider_id))];

      const { data: providers } = await supabase
        .from('providers')
        .select('id, business_name')
        .in('id', providerIds);

      const { data: profiles } = await supabase
        .from('profiles')
        .select('id, full_name')
        .in('id', providerIds);

      const providerMap = new Map();
      providers?.forEach(p => {
        const profile = profiles?.find(prof => prof.id === p.id);
        providerMap.set(p.id, {
          business_name: p.business_name,
          profile: { full_name: profile?.full_name || null },
        });
      });

      const bookingsWithProviders = bookings.map(booking => ({
        ...booking,
        provider: providerMap.get(booking.provider_id) || null,
      }));

      const today = new Date().toISOString().split('T')[0];
      const pending = bookings.filter(b => b.status === 'pending').length;
      const completed = bookings.filter(b => b.status === 'completed').length;
      const upcoming = bookings.filter(b => b.booking_date >= today && ['pending', 'confirmed'].includes(b.status)).length;

      setStats({
        totalBookings: bookings.length,
        pendingBookings: pending,
        completedBookings: completed,
        upcomingBookings: upcoming,
      });

      setRecentBookings(bookingsWithProviders.slice(0, 5));
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
    } finally {
      setLoading(false);
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <NimartSpinner size="lg" />
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <LocationPrompt />

      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">
          Welcome back, {profile?.full_name?.split(' ')[0] || 'Customer'}!
        </h1>
        <p className="text-gray-600 mt-1">Here's an overview of your activity.</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <div className="bg-white rounded-lg shadow-sm border p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">Total Bookings</p>
              <p className="text-2xl font-bold">{stats.totalBookings}</p>
            </div>
            <Calendar className="h-8 w-8 text-primary-600" />
          </div>
        </div>
        <div className="bg-white rounded-lg shadow-sm border p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">Pending</p>
              <p className="text-2xl font-bold">{stats.pendingBookings}</p>
            </div>
            <Clock className="h-8 w-8 text-yellow-600" />
          </div>
        </div>
        <div className="bg-white rounded-lg shadow-sm border p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">Completed</p>
              <p className="text-2xl font-bold">{stats.completedBookings}</p>
            </div>
            <CheckCircle className="h-8 w-8 text-green-600" />
          </div>
        </div>
        <div className="bg-white rounded-lg shadow-sm border p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">Upcoming</p>
              <p className="text-2xl font-bold">{stats.upcomingBookings}</p>
            </div>
            <Calendar className="h-8 w-8 text-blue-600" />
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
        <Link
          to="/search"
          className="bg-white rounded-lg shadow-sm border p-6 hover:shadow-md transition flex items-center gap-4"
        >
          <div className="bg-primary-100 rounded-full p-3">
            <Search className="h-6 w-6 text-primary-600" />
          </div>
          <div>
            <h3 className="font-semibold text-gray-900">Find Services</h3>
            <p className="text-sm text-gray-500">Browse and book providers</p>
          </div>
        </Link>
        <Link
          to="/customer/bookings"
          className="bg-white rounded-lg shadow-sm border p-6 hover:shadow-md transition flex items-center gap-4"
        >
          <div className="bg-blue-100 rounded-full p-3">
            <Calendar className="h-6 w-6 text-blue-600" />
          </div>
          <div>
            <h3 className="font-semibold text-gray-900">My Bookings</h3>
            <p className="text-sm text-gray-500">View and manage appointments</p>
          </div>
        </Link>
        <Link
          to="/customer/profile"
          className="bg-white rounded-lg shadow-sm border p-6 hover:shadow-md transition flex items-center gap-4"
        >
          <div className="bg-green-100 rounded-full p-3">
            <User className="h-6 w-6 text-green-600" />
          </div>
          <div>
            <h3 className="font-semibold text-gray-900">Profile Settings</h3>
            <p className="text-sm text-gray-500">Update your information</p>
          </div>
        </Link>
      </div>

      <div className="bg-white rounded-lg shadow-sm border p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-gray-900">Recent Bookings</h2>
          <Link to="/customer/bookings" className="text-sm text-primary-600 hover:underline">
            View all
          </Link>
        </div>

        {recentBookings.length === 0 ? (
          <div className="text-center py-8 bg-gray-50 rounded-lg">
            <Calendar className="mx-auto h-10 w-10 text-gray-400" />
            <p className="mt-2 text-gray-500">No bookings yet.</p>
            <Link to="/search" className="mt-2 inline-block text-primary-600 hover:underline">
              Find a provider
            </Link>
          </div>
        ) : (
          <div className="space-y-3">
            {recentBookings.map((booking) => (
              <div key={booking.id} className="flex items-center justify-between py-2 border-b last:border-0">
                <div>
                  <p className="font-medium">{booking.service_name}</p>
                  <p className="text-sm text-gray-500">
                    {booking.provider?.business_name || booking.provider?.profile?.full_name || 'Unknown Provider'} • {booking.booking_date} at {booking.booking_time}
                  </p>
                </div>
                <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                  booking.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                  booking.status === 'confirmed' ? 'bg-blue-100 text-blue-800' :
                  booking.status === 'completed' ? 'bg-green-100 text-green-800' :
                  'bg-gray-100 text-gray-800'
                }`}>
                  {booking.status}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}