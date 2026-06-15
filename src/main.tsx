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
import { ErrorBoundary } from './components/common/ErrorBoundary';
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
            <ErrorBoundary>
              <RouterProvider router={router} />
            </ErrorBoundary>
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

// ---------- Firebase lazy‑loading (after idle) ----------
// This delays Firebase SDK until the page is interactive,
// reducing initial JavaScript execution time and TBT.
setTimeout(async () => {
  try {
    const { initializeApp, getApp, getApps } = await import('firebase/app');
    const { getMessaging, getToken } = await import('firebase/messaging');

    const firebaseConfig = {
      apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
      authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
      projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
      storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
      messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
      appId: import.meta.env.VITE_FIREBASE_APP_ID,
    };

    const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApp();
    const messaging = getMessaging(app);

    if ('serviceWorker' in navigator && 'Notification' in window) {
      try {
        const token = await getToken(messaging, { vapidKey: import.meta.env.VITE_FIREBASE_VAPID_KEY });
        if (token) {
          console.log('Firebase token:', token);
        }
      } catch (err) {
        console.warn('Unable to get Firebase token:', err);
      }
    }
  } catch (err) {
    console.warn('Firebase failed to load:', err);
  }
}, 300);