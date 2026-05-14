// src/pages/provider/Dashboard.tsx
import { useEffect, useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { supabase } from '../../lib/supabase';
import { ProviderStatusToggle } from '../../components/provider/ProviderStatusToggle';
import {
  Calendar,
  MessageCircle,
  Star,
  Settings,
  Image,
  Package,
  Shield,
  Coins,
  TrendingUp,
  Zap,
  Tag,
  X,
} from 'lucide-react';
import { NimartSpinner } from '../../components/common/NimartSpinner';
import toast from 'react-hot-toast';
import { getCategoriesByTier, CATEGORIES } from '../../data/categories';

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
  const [isVerified, setIsVerified] = useState(false);
  const [hasPendingVerification, setHasPendingVerification] = useState(false);

  // Coin state
  const [coinBalance, setCoinBalance] = useState(0);
  const [showBoostModal, setShowBoostModal] = useState(false);
  const [showTopPlacementModal, setShowTopPlacementModal] = useState(false);
  const [showExtraCategoryModal, setShowExtraCategoryModal] = useState(false);
  const [boostLoading, setBoostLoading] = useState(false);
  const [boostType, setBoostType] = useState<'standard' | 'premium'>('standard');

  // Extra category
  const [extraCategorySlug, setExtraCategorySlug] = useState('');
  const [extraCategoryCost, setExtraCategoryCost] = useState(1500);

  useEffect(() => {
    if (!user) return;
    fetchProviderData();
    fetchStats();
    checkVerificationStatus();
  }, [user]);

  useEffect(() => {
    if (user) fetchCoinData();
  }, [user]);

  async function fetchCoinData() {
    const { data } = await supabase
      .from('providers')
      .select('coin_balance, boost_until, top_placement_until, extra_category_slugs')
      .eq('id', user!.id)
      .single();
    if (data) setCoinBalance(data.coin_balance || 0);
  }

  async function fetchProviderData() {
    const { data: provider } = await supabase
      .from('providers')
      .select('*')
      .eq('id', user!.id)
      .single();
    const { data: profile } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', user!.id)
      .single();
    const combined = { ...provider, profile };
    setProviderData(combined);
    setIsVerified(profile?.is_verified || false);
    if (combined && (!combined.profile?.lga_id || !combined.business_name)) {
      navigate('/provider/setup');
    }
  }

  async function fetchStats() {
    const { data: bookings } = await supabase.from('bookings').select('*').eq('provider_id', user!.id);
    const totalCount = bookings?.length || 0;
    const pendingCount = bookings?.filter(b => b.status === 'pending').length || 0;
    const completedCount = bookings?.filter(b => b.status === 'completed').length || 0;
    const { data: reviews } = await supabase.from('reviews').select('rating').eq('provider_id', user!.id);
    const avgRating = reviews?.length ? reviews.reduce((acc, r) => acc + r.rating, 0) / reviews.length : 0;
    setStats({
      totalBookings: totalCount,
      pendingBookings: pendingCount,
      completedBookings: completedCount,
      averageRating: avgRating,
      reviewCount: reviews?.length || 0,
    });
    setLoading(false);
  }

  async function checkVerificationStatus() {
    const { data } = await supabase
      .from('verification_documents')
      .select('status')
      .eq('provider_id', user!.id)
      .eq('status', 'pending')
      .limit(1);
    setHasPendingVerification(data && data.length > 0);
  }

  // Boost handler
  const handleBoost = async () => {
    setBoostLoading(true);
    try {
      const cost = boostType === 'standard' ? 1000 : 3000;
      const { data: provider } = await supabase
        .from('providers')
        .select('coin_balance, status')
        .eq('id', user!.id)
        .single();
      if (!provider || provider.coin_balance < cost) {
        toast.error('Insufficient Nicoin');
        return;
      }
      if (provider.status === 'away') {
        toast.error('Set your status to Available or Busy to boost');
        return;
      }
      const duration = boostType === 'standard' ? 7 : 30;
      const newBoost = new Date();
      newBoost.setDate(newBoost.getDate() + duration);
      await supabase.rpc('purchase_boost', {
        p_provider_id: user!.id,
        p_cost: cost,
        p_boost_until: newBoost.toISOString(),
      });
      setCoinBalance(prev => prev - cost);
      toast.success(`Profile boosted for ${duration} days!`);
      setShowBoostModal(false);
      fetchCoinData();
    } catch (error: any) {
      toast.error(error.message);
    } finally {
      setBoostLoading(false);
    }
  };

  // Top placement handler
  const handleTopPlacement = async () => {
    setBoostLoading(true);
    try {
      const cost = 10000;
      const { data: provider } = await supabase
        .from('providers')
        .select('coin_balance, status')
        .eq('id', user!.id)
        .single();
      if (!provider || provider.coin_balance < cost) {
        toast.error('Insufficient Nicoin');
        return;
      }
      if (provider.status === 'away') {
        toast.error('Set your status to Available or Busy to use Top Placement');
        return;
      }
      const newTop = new Date();
      newTop.setDate(newTop.getDate() + 7);
      await supabase.rpc('purchase_top_placement', {
        p_provider_id: user!.id,
        p_cost: cost,
        p_top_until: newTop.toISOString(),
      });
      setCoinBalance(prev => prev - cost);
      toast.success('Top placement activated for 7 days!');
      setShowTopPlacementModal(false);
      fetchCoinData();
    } catch (error: any) {
      toast.error(error.message);
    } finally {
      setBoostLoading(false);
    }
  };

  // Extra category handler
  const handleExtraCategory = async () => {
    if (!extraCategorySlug) return;
    setBoostLoading(true);
    try {
      const cost = 1500; // adjust as needed
      await supabase.rpc('purchase_extra_category', {
        p_provider_id: user!.id,
        p_category_slug: extraCategorySlug,
        p_cost: cost,
      });
      setCoinBalance(prev => prev - cost);
      toast.success('Extra category added!');
      setShowExtraCategoryModal(false);
      fetchCoinData();
    } catch (error: any) {
      toast.error(error.message);
    } finally {
      setBoostLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <NimartSpinner size="lg" />
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-2xl font-bold text-gray-900">Provider Dashboard</h1>
        {providerData ? (
          <ProviderStatusToggle
            providerId={user!.id}
            initialStatus={providerData.status}
            onStatusChange={() => fetchProviderData()}
          />
        ) : (
          <div className="h-10 w-32 bg-gray-200 rounded-lg animate-pulse" />
        )}
      </div>

      {/* Verification banners (unchanged) */}
      {!isVerified && !hasPendingVerification && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Shield className="h-6 w-6 text-blue-600" />
            <div>
              <p className="font-medium text-blue-800">Get verified to build trust with customers</p>
              <p className="text-sm text-blue-600">Verified providers get more bookings</p>
            </div>
          </div>
          <Link to="/provider/verification" className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 text-sm font-medium">Get Verified</Link>
        </div>
      )}
      {hasPendingVerification && (
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-6 flex items-center gap-3">
          <Shield className="h-6 w-6 text-yellow-600" />
          <div><p className="font-medium text-yellow-800">Verification in progress</p><p className="text-sm text-yellow-600">We're reviewing your documents. This usually takes 24-48 hours.</p></div>
        </div>
      )}
      {isVerified && (
        <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-6 flex items-center gap-3">
          <Shield className="h-6 w-6 text-green-600" />
          <div><p className="font-medium text-green-800">Your account is verified!</p><p className="text-sm text-green-600">The verified badge appears on your profile.</p></div>
        </div>
      )}

      {/* Quick Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <div className="bg-white rounded-lg shadow-sm border p-6"><div className="flex items-center justify-between"><div><p className="text-sm text-gray-500">Total Bookings</p><p className="text-2xl font-bold">{stats.totalBookings}</p></div><Calendar className="h-8 w-8 text-primary-600" /></div></div>
        <div className="bg-white rounded-lg shadow-sm border p-6"><div className="flex items-center justify-between"><div><p className="text-sm text-gray-500">Pending</p><p className="text-2xl font-bold">{stats.pendingBookings}</p></div><MessageCircle className="h-8 w-8 text-yellow-600" /></div></div>
        <div className="bg-white rounded-lg shadow-sm border p-6"><div className="flex items-center justify-between"><div><p className="text-sm text-gray-500">Completed</p><p className="text-2xl font-bold">{stats.completedBookings}</p></div><Calendar className="h-8 w-8 text-green-600" /></div></div>
        <div className="bg-white rounded-lg shadow-sm border p-6"><div className="flex items-center justify-between"><div><p className="text-sm text-gray-500">Rating</p><p className="text-2xl font-bold">{stats.averageRating.toFixed(1)}<span className="text-sm text-gray-500 ml-1">({stats.reviewCount})</span></p></div><Star className="h-8 w-8 text-yellow-400" /></div></div>
      </div>

      {/* Setup checklist (if needed) */}
      {providerData && (!providerData.profile?.lga_id || !providerData.business_name) && (
        <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4 mb-8">
          <div className="flex"><Settings className="h-5 w-5 text-yellow-400 mr-2" /><p className="text-sm text-yellow-700">Complete your profile to appear in customer searches. <Link to="/provider/setup" className="font-medium underline">Complete Setup</Link></p></div>
        </div>
      )}

      {/* Nicoin Balance */}
      <div className="bg-white rounded-lg shadow-sm border p-6 mb-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Coins className="h-6 w-6 text-yellow-500" />
            <span className="text-2xl font-bold text-gray-900">{coinBalance.toLocaleString()}</span>
            <span className="text-sm text-gray-500">Nicoin</span>
          </div>
          <Link to="/provider/payment" className="text-sm text-primary-600 hover:underline">Buy Nicoin</Link>
        </div>
      </div>

      {/* Boost Actions */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
        {/* Standard Boost */}
        <div className="bg-white rounded-lg shadow-sm border p-5">
          <TrendingUp className="h-5 w-5 text-primary-600 mb-2" />
          <h3 className="font-semibold text-gray-900">Standard Boost</h3>
          <p className="text-sm text-gray-500 mb-4">7 days at top of search results</p>
          <p className="text-lg font-bold text-gray-900 mb-4">1,000 Nicoin</p>
          <button
            onClick={() => { setBoostType('standard'); setShowBoostModal(true); }}
            disabled={coinBalance < 1000}
            className="w-full bg-primary-600 text-white py-2 rounded-lg hover:bg-primary-700 disabled:opacity-50 transition"
          >
            Boost Now
          </button>
        </div>

        {/* Premium Boost */}
        <div className="bg-white rounded-lg shadow-sm border p-5 ring-2 ring-primary-200">
          <Zap className="h-5 w-5 text-amber-500 mb-2" />
          <h3 className="font-semibold text-gray-900">Premium Boost</h3>
          <p className="text-sm text-gray-500 mb-4">Top placement for a full month</p>
          <p className="text-lg font-bold text-gray-900 mb-4">3,000 Nicoin</p>
          <button
            onClick={() => { setBoostType('premium'); setShowBoostModal(true); }}
            disabled={coinBalance < 3000}
            className="w-full bg-amber-500 text-white py-2 rounded-lg hover:bg-amber-600 disabled:opacity-50 transition"
          >
            Boost 1 Month
          </button>
        </div>

        {/* Top Placement */}
        <div className="bg-white rounded-lg shadow-sm border p-5">
          <Tag className="h-5 w-5 text-purple-600 mb-2" />
          <h3 className="font-semibold text-gray-900">Top Placement</h3>
          <p className="text-sm text-gray-500 mb-4">Guaranteed top‑3 spot for 7 days</p>
          <p className="text-lg font-bold text-gray-900 mb-4">10,000 Nicoin</p>
          <button
            onClick={() => setShowTopPlacementModal(true)}
            disabled={coinBalance < 10000}
            className="w-full bg-purple-600 text-white py-2 rounded-lg hover:bg-purple-700 disabled:opacity-50 transition"
          >
            Get Top Spot
          </button>
        </div>
      </div>

      {/* Extra Category Button */}
      <div className="mb-8">
        <button
          onClick={() => setShowExtraCategoryModal(true)}
          className="inline-flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium hover:bg-gray-50"
        >
          <Package className="h-4 w-4" /> Add Extra Category (1,500 Nicoin)
        </button>
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-4 mb-8">
        <Link to="/provider/bookings" className="bg-white rounded-lg shadow-sm border p-6 hover:shadow-md transition"><Calendar className="h-8 w-8 text-primary-600 mb-4" /><h3 className="font-semibold text-gray-900">Manage Bookings</h3><p className="text-sm text-gray-500">View and manage appointments</p></Link>
        <Link to="/provider/portfolio" className="bg-white rounded-lg shadow-sm border p-6 hover:shadow-md transition"><Image className="h-8 w-8 text-primary-600 mb-4" /><h3 className="font-semibold text-gray-900">Portfolio</h3><p className="text-sm text-gray-500">Upload photos of your work</p></Link>
        <Link to="/provider/services" className="bg-white rounded-lg shadow-sm border p-6 hover:shadow-md transition"><Package className="h-8 w-8 text-primary-600 mb-4" /><h3 className="font-semibold text-gray-900">Services & Pricing</h3><p className="text-sm text-gray-500">Define your offerings</p></Link>
        <Link to="/provider/verification" className="bg-white rounded-lg shadow-sm border p-6 hover:shadow-md transition"><Shield className="h-8 w-8 text-primary-600 mb-4" /><h3 className="font-semibold text-gray-900">Get Verified</h3><p className="text-sm text-gray-500">Earn the verified badge</p></Link>
        <Link to="/provider/profile" className="bg-white rounded-lg shadow-sm border p-6 hover:shadow-md transition"><Settings className="h-8 w-8 text-primary-600 mb-4" /><h3 className="font-semibold text-gray-900">Profile Settings</h3><p className="text-sm text-gray-500">Update your information</p></Link>
      </div>

      {/* Boost Modal */}
      {showBoostModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-sm p-6">
            <h3 className="text-lg font-semibold mb-2">Activate {boostType === 'standard' ? 'Standard' : 'Premium'} Boost</h3>
            <p className="text-sm text-gray-600 mb-4">
              {boostType === 'standard' ? '1,000' : '3,000'} Nicoin will be deducted. Your profile will appear at the top for {boostType === 'standard' ? '7 days' : '30 days'}.
            </p>
            <div className="flex gap-3">
              <button onClick={() => setShowBoostModal(false)} className="flex-1 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50">Cancel</button>
              <button onClick={handleBoost} disabled={boostLoading} className="flex-1 bg-primary-600 text-white px-4 py-2 rounded-lg hover:bg-primary-700 disabled:opacity-50">
                {boostLoading ? 'Activating...' : 'Confirm'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Top Placement Modal */}
      {showTopPlacementModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-sm p-6">
            <h3 className="text-lg font-semibold mb-2">Activate Top Placement</h3>
            <p className="text-sm text-gray-600 mb-4">10,000 Nicoin will be deducted. You'll appear in the Top Providers slider for 7 days.</p>
            <div className="flex gap-3">
              <button onClick={() => setShowTopPlacementModal(false)} className="flex-1 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50">Cancel</button>
              <button onClick={handleTopPlacement} disabled={boostLoading} className="flex-1 bg-purple-600 text-white px-4 py-2 rounded-lg hover:bg-purple-700 disabled:opacity-50">
                {boostLoading ? 'Activating...' : 'Confirm'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Extra Category Modal */}
      {showExtraCategoryModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-sm p-6">
            <h3 className="text-lg font-semibold mb-2">Add Extra Category</h3>
            <p className="text-sm text-gray-600 mb-4">1,500 Nicoin per category. Pick one to add to your profile.</p>
            <select
              value={extraCategorySlug}
              onChange={(e) => setExtraCategorySlug(e.target.value)}
              className="w-full px-3 py-2 border rounded-lg mb-4"
            >
              <option value="">Select category</option>
              {CATEGORIES.map(cat => (
                <option key={cat.slug} value={cat.slug}>{cat.name}</option>
              ))}
            </select>
            <div className="flex gap-3">
              <button onClick={() => setShowExtraCategoryModal(false)} className="flex-1 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50">Cancel</button>
              <button onClick={handleExtraCategory} disabled={boostLoading || !extraCategorySlug} className="flex-1 bg-primary-600 text-white px-4 py-2 rounded-lg hover:bg-primary-700 disabled:opacity-50">
                {boostLoading ? 'Adding...' : 'Add Category'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}