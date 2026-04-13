import { useEffect, useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { supabase } from '../../lib/supabase';
import { ProviderStatusToggle } from '../../components/provider/ProviderStatusToggle';
import { Calendar, MessageCircle, Star, Settings, Image } from 'lucide-react';

interface DashboardStats {
  totalBookings: number;
  pendingBookings: number;
  completedBookings: number;
  averageRating: number;
  reviewCount: number;
}

export default function ProviderDashboard() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [providerData, setProviderData] = useState<any>(null);
  const [stats, setStats] = useState<DashboardStats>({
    totalBookings: 0,
    pendingBookings: 0,
    completedBookings: 0,
    averageRating: 0,
    reviewCount: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;
    fetchProviderData();
    fetchStats();
  }, [user]);

  async function fetchProviderData() {
    const { data } = await supabase
      .from('providers')
      .select('*, profile:profiles(*)')
      .eq('id', user!.id)
      .single();
    setProviderData(data);

    // Redirect to setup if profile is incomplete
    if (data && (!data.profile.lga_id || !data.business_name)) {
      navigate('/provider/setup');
    }
  }

  async function fetchStats() {
    // Bookings stats
    const { data: bookings } = await supabase
      .from('bookings')
      .select('*')
      .eq('provider_id', user!.id);

    const totalCount = bookings?.length || 0;
    const pendingCount = bookings?.filter(b => b.status === 'pending').length || 0;
    const completedCount = bookings?.filter(b => b.status === 'completed').length || 0;

    // Reviews stats
    const { data: reviews } = await supabase
      .from('reviews')
      .select('rating')
      .eq('provider_id', user!.id);

    const avgRating = reviews?.length 
      ? reviews.reduce((acc, r) => acc + r.rating, 0) / reviews.length 
      : 0;

    setStats({
      totalBookings: totalCount,
      pendingBookings: pendingCount,
      completedBookings: completedCount,
      averageRating: avgRating,
      reviewCount: reviews?.length || 0,
    });
    setLoading(false);
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-2xl font-bold text-gray-900">Provider Dashboard</h1>
        {providerData && (
          <ProviderStatusToggle 
            providerId={user!.id} 
            initialStatus={providerData.status} 
            onStatusChange={() => fetchProviderData()}
          />
        )}
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
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
            <MessageCircle className="h-8 w-8 text-yellow-600" />
          </div>
        </div>
        <div className="bg-white rounded-lg shadow-sm border p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">Completed</p>
              <p className="text-2xl font-bold">{stats.completedBookings}</p>
            </div>
            <Calendar className="h-8 w-8 text-green-600" />
          </div>
        </div>
        <div className="bg-white rounded-lg shadow-sm border p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">Rating</p>
              <p className="text-2xl font-bold">
                {stats.averageRating.toFixed(1)} 
                <span className="text-sm text-gray-500 ml-1">({stats.reviewCount})</span>
              </p>
            </div>
            <Star className="h-8 w-8 text-yellow-400" />
          </div>
        </div>
      </div>

      {/* Setup Checklist (if incomplete) */}
      {providerData && (!providerData.profile.lga_id || !providerData.business_name) && (
        <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4 mb-8">
          <div className="flex">
            <div className="flex-shrink-0">
              <Settings className="h-5 w-5 text-yellow-400" />
            </div>
            <div className="ml-3">
              <p className="text-sm text-yellow-700">
                Complete your profile to appear in customer searches.
                <Link to="/provider/setup" className="font-medium underline ml-2">
                  Complete Setup
                </Link>
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
        <Link to="/provider/bookings" className="bg-white rounded-lg shadow-sm border p-6 hover:shadow-md transition">
          <Calendar className="h-8 w-8 text-primary-600 mb-4" />
          <h3 className="font-semibold text-gray-900">Manage Bookings</h3>
          <p className="text-sm text-gray-500">View and manage upcoming appointments</p>
        </Link>
        <Link to="/provider/portfolio" className="bg-white rounded-lg shadow-sm border p-6 hover:shadow-md transition">
          <Image className="h-8 w-8 text-primary-600 mb-4" />
          <h3 className="font-semibold text-gray-900">Portfolio</h3>
          <p className="text-sm text-gray-500">Upload photos of your best work</p>
        </Link>
        <Link to="/provider/profile" className="bg-white rounded-lg shadow-sm border p-6 hover:shadow-md transition">
          <Settings className="h-8 w-8 text-primary-600 mb-4" />
          <h3 className="font-semibold text-gray-900">Profile Settings</h3>
          <p className="text-sm text-gray-500">Update your business information</p>
        </Link>
      </div>
    </div>
  );
}