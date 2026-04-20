// src/components/common/AdminRoute.tsx
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { useEffect, useState } from 'react';
import { supabase } from '../../lib/supabase';

interface AdminRouteProps {
  children: React.ReactNode;
}

export function AdminRoute({ children }: AdminRouteProps) {
  const { user, isLoading: authLoading } = useAuth();
  const location = useLocation();
  const [isAdmin, setIsAdmin] = useState(false);
  const [checking, setChecking] = useState(true);

  useEffect(() => {
    // Wait until AuthContext has finished its initial session check
    if (authLoading) return;

    async function verifyAdmin() {
      if (!user) {
        setChecking(false);
        return;
      }

      // Small delay to ensure Supabase client is fully ready (sometimes necessary)
      await new Promise(resolve => setTimeout(resolve, 100));

      const { data, error } = await supabase.rpc('is_admin', { user_id: user.id });

      if (error) {
        console.error('Admin verification error:', error);
        setIsAdmin(false);
      } else {
        setIsAdmin(data || false);
      }
      setChecking(false);
    }

    verifyAdmin();
  }, [user, authLoading]);

  // Show loading spinner while auth is loading or admin check is in progress
  if (authLoading || checking) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  // Not logged in or not admin -> redirect
  if (!user || !isAdmin) {
    return <Navigate to="/" state={{ from: location }} replace />;
  }

  return <>{children}</>;
}