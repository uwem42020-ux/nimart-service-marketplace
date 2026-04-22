// src/pages/auth/AuthCallback.tsx
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../../lib/supabase';
import { useAuth } from '../../contexts/AuthContext';
import toast from 'react-hot-toast';
import { User, Briefcase, CheckCircle } from 'lucide-react';
import { NimartSpinner } from '../../components/common/NimartSpinner';

export default function AuthCallback() {
  const navigate = useNavigate();
  const { refreshProfile } = useAuth();
  const [loading, setLoading] = useState(true);
  const [needsRole, setNeedsRole] = useState(false);
  const [fullName, setFullName] = useState('');
  const [role, setRole] = useState<'customer' | 'provider'>('customer');
  const [submitting, setSubmitting] = useState(false);
  const [user, setUser] = useState<any>(null);

  useEffect(() => {
    let mounted = true;

    const handleCallback = async () => {
      try {
        const { data: { session }, error } = await supabase.auth.getSession();

        if (error) throw error;
        if (!session) throw new Error('No session established');

        const currentUser = session.user;
        if (!mounted) return;
        setUser(currentUser);

        const { data: profile, error: profileError } = await supabase
          .from('profiles')
          .select('role, full_name')
          .eq('id', currentUser.id)
          .single();

        if (profileError && profileError.code !== 'PGRST116') {
          throw profileError;
        }

        if (profile?.role) {
          await refreshProfile();
          navigate(profile.role === 'provider' ? '/provider/dashboard' : '/customer/dashboard', { replace: true });
        } else {
          setFullName(profile?.full_name || currentUser.user_metadata?.full_name || '');
          setNeedsRole(true);
        }
      } catch (err: any) {
        console.error('Auth callback error:', err);
        toast.error('Authentication failed. Please try again.');
        navigate('/auth/signin', { replace: true });
      } finally {
        if (mounted) setLoading(false);
      }
    };

    handleCallback();

    return () => {
      mounted = false;
    };
  }, [navigate, refreshProfile]);

  async function completeProfile(e: React.FormEvent) {
    e.preventDefault();
    if (!user) return;
    setSubmitting(true);
    try {
      // Update profile with role
      const { error: profileError } = await supabase
        .from('profiles')
        .update({
          full_name: fullName,
          role,
          is_complete: role === 'customer',
        })
        .eq('id', user.id);

      if (profileError) throw profileError;

      if (role === 'provider') {
        // Small delay for database trigger
        await new Promise(resolve => setTimeout(resolve, 300));

        // Get default subcategory
        const { data: defaultSub } = await supabase
          .from('subcategories')
          .select('id')
          .or('name.ilike.%vehicle%,name.ilike.%mechanic%')
          .limit(1)
          .maybeSingle();

        // Upsert provider row
        const { error: providerError } = await supabase
          .from('providers')
          .upsert({
            id: user.id,
            business_name: fullName,
            description: 'Professional service provider',
            selected_tier_slug: 'automotive',
            selected_category_slug: 'vehicle-mechanics',
            selected_subcategory_id: defaultSub?.id || null,
            is_available: true,
            status: 'available',
          }, {
            onConflict: 'id',
            ignoreDuplicates: false,
          });

        if (providerError) {
          console.error('Provider upsert error:', providerError);
        }

        // Mark as incomplete to force setup
        await supabase
          .from('profiles')
          .update({ is_complete: false })
          .eq('id', user.id);

        toast.success('Account created! Please complete your business profile.');
        navigate('/provider/setup', { replace: true });
      } else {
        toast.success('Welcome to Nimart!');
        navigate('/customer/dashboard', { replace: true });
      }
    } catch (error: any) {
      console.error('Profile completion error:', error);
      toast.error(error.message || 'Failed to complete profile');
    } finally {
      setSubmitting(false);
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <NimartSpinner size="lg" />
      </div>
    );
  }

  if (needsRole) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary-50 to-primary-100 px-4">
        <div className="bg-white/90 backdrop-blur-md rounded-2xl shadow-xl p-8 w-full max-w-md">
          <h2 className="text-2xl font-bold text-center mb-2">Welcome to Nimart!</h2>
          <p className="text-gray-600 text-center mb-6">Just one more step to get started.</p>
          <form onSubmit={completeProfile} className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-1">Full Name</label>
              <input
                type="text"
                required
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                className="w-full px-4 py-2 border rounded-lg"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">I want to...</label>
              <div className="grid grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={() => setRole('customer')}
                  className={`p-4 border-2 rounded-xl flex flex-col items-center ${
                    role === 'customer' ? 'border-primary-500 bg-primary-50' : 'border-gray-200'
                  }`}
                >
                  <User className="h-6 w-6 mb-1" />
                  <span className="font-medium">Hire Services</span>
                </button>
                <button
                  type="button"
                  onClick={() => setRole('provider')}
                  className={`p-4 border-2 rounded-xl flex flex-col items-center ${
                    role === 'provider' ? 'border-primary-500 bg-primary-50' : 'border-gray-200'
                  }`}
                >
                  <Briefcase className="h-6 w-6 mb-1" />
                  <span className="font-medium">Offer Services</span>
                </button>
              </div>
            </div>
            <button
              type="submit"
              disabled={submitting}
              className="w-full bg-primary-600 text-white py-3 rounded-lg hover:bg-primary-700 flex items-center justify-center gap-2"
            >
              <CheckCircle className="h-5 w-5" />
              {submitting ? 'Saving...' : 'Continue'}
            </button>
          </form>
        </div>
      </div>
    );
  }

  return null;
}