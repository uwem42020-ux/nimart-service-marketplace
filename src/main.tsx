import React from 'react';
import ReactDOM from 'react-dom/client';
import { RouterProvider } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Toaster } from 'react-hot-toast';
import { HelmetProvider } from 'react-helmet-async';
import { AuthProvider } from './contexts/AuthContext';
import { NotificationProvider } from './contexts/NotificationContext';
import { router } from './routes';
import { UpdateNotification } from './components/common/UpdateNotification';
import './styles/globals.css';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5,
      gcTime: 1000 * 60 * 10,
      retry: 1,
      refetchOnWindowFocus: false,
    },
  },
});

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <HelmetProvider>
      <QueryClientProvider client={queryClient}>
        <AuthProvider>
          <NotificationProvider>
            <UpdateNotification />
            <RouterProvider router={router} />
            <Toaster
              position="top-center"
              toastOptions={{
                duration: 4000,
                style: { background: '#363636', color: '#fff' },
                success: {
                  duration: 3000,
                  iconTheme: { primary: '#008751', secondary: '#fff' },
                },
              }}
            />
          </NotificationProvider>
        </AuthProvider>
      </QueryClientProvider>
    </HelmetProvider>
  </React.StrictMode>
);

// Prefetch critical provider data once service worker is ready
if ('serviceWorker' in navigator) {
  navigator.serviceWorker.ready.then(() => {
    const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL;
    const SUPABASE_ANON_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY;
    if (SUPABASE_URL && SUPABASE_ANON_KEY) {
      fetch(`${SUPABASE_URL}/rest/v1/providers?select=*&limit=20`, {
        headers: { 'apikey': SUPABASE_ANON_KEY, 'Authorization': `Bearer ${SUPABASE_ANON_KEY}` },
      }).catch(() => {
        // Silently fail – offline data will be served from cache if available
      });
    }
  });
}