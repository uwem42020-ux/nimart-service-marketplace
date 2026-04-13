import { Navigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { useEffect, useState } from 'react';
import { supabase } from '../../lib/supabase';

interface ProtectedRouteProps {
  children: React.ReactNode;
  allowedRoles?: ('customer' | 'provider')[];
}

export function ProtectedRoute({ children, allowedRoles }: ProtectedRouteProps) {
  const { user, profile, isLoading } = useAuth();
  const [checkingSetup, setCheckingSetup] = useState(true);
  const [needsSetup, setNeedsSetup] = useState(false);

  useEffect(() => {
    async function checkProviderSetup() {
      if (!user || profile?.role !== 'provider') {
        setCheckingSetup(false);
        return;
      }

      const { data: provider } = await supabase
        .from('providers')
        .select('business_name')
        .eq('id', user.id)
        .single();

      const { data: profileData } = await supabase
        .from('profiles')
        .select('lga_id')
        .eq('id', user.id)
        .single();

      if (!provider?.business_name || !profileData?.lga_id) {
        setNeedsSetup(true);
      }
      setCheckingSetup(false);
    }

    checkProviderSetup();
  }, [user, profile]);

  if (isLoading || checkingSetup) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/auth/signin" replace />;
  }

  if (allowedRoles && profile && !allowedRoles.includes(profile.role)) {
    return <Navigate to="/" replace />;
  }

  if (needsSetup && !window.location.pathname.includes('/provider/setup')) {
    return <Navigate to="/provider/setup" replace />;
  }

  return <>{children}</>;
}