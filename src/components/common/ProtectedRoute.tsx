// src/components/common/ProtectedRoute.tsx
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { useEffect, useState } from 'react';
import { supabase } from '../../lib/supabase';

interface ProtectedRouteProps {
  children: React.ReactNode;
  allowedRoles?: ('customer' | 'provider')[];
}

export function ProtectedRoute({ children, allowedRoles }: ProtectedRouteProps) {
  const { user, profile, isLoading } = useAuth();
  const location = useLocation();
  const [checkingSetup, setCheckingSetup] = useState(true);
  const [needsSetup, setNeedsSetup] = useState(false);

  useEffect(() => {
    let mounted = true;

    async function checkProviderSetup() {
      if (!user || profile?.role !== 'provider') {
        if (mounted) setCheckingSetup(false);
        return;
      }

      try {
        // Check if provider has completed essential setup fields
        const { data: provider, error: providerError } = await supabase
          .from('providers')
          .select('business_name')
          .eq('id', user.id)
          .single();

        if (providerError && providerError.code !== 'PGRST116') {
          console.error('Provider check error:', providerError);
        }

        const { data: profileData, error: profileError } = await supabase
          .from('profiles')
          .select('lga_id')
          .eq('id', user.id)
          .single();

        if (profileError && profileError.code !== 'PGRST116') {
          console.error('Profile check error:', profileError);
        }

        // Setup is incomplete if business_name or lga_id is missing
        const incomplete = !provider?.business_name || !profileData?.lga_id;
        if (mounted) setNeedsSetup(incomplete);
      } catch (err) {
        console.error('Provider setup check failed:', err);
      } finally {
        if (mounted) setCheckingSetup(false);
      }
    }

    checkProviderSetup();

    return () => {
      mounted = false;
    };
  }, [user, profile]);

  // Show loading spinner while checking auth or setup status
  if (isLoading || checkingSetup) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  // Not logged in – redirect to sign in
  if (!user) {
    return <Navigate to="/auth/signin" state={{ from: location }} replace />;
  }

  // Logged in but wrong role for this route
  if (allowedRoles && profile && !allowedRoles.includes(profile.role)) {
    return <Navigate to="/" replace />;
  }

  // Provider needs to complete setup and is not already on the setup page
  if (needsSetup && !location.pathname.startsWith('/provider/setup')) {
    return <Navigate to="/provider/setup" replace />;
  }

  // All checks passed – render the protected content
  return <>{children}</>;
}