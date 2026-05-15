// src/components/common/UpdateNotification.tsx
import { useEffect, useRef } from 'react';
import toast from 'react-hot-toast';
import { useRegisterSW } from 'virtual:pwa-register/react';

export function UpdateNotification() {
  const {
    offlineReady: [offlineReady, setOfflineReady],
    needRefresh: [needRefresh, setNeedRefresh],
    updateServiceWorker,
  } = useRegisterSW({
    onRegisteredSW(swUrl, r) {
      console.log('Service Worker registered:', swUrl);
      // Check for updates every hour
      r && setInterval(() => r.update(), 3600000);
    },
    onRegisterError(error) {
      console.error('SW registration error:', error);
    },
  });

  const reloadTimerRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    if (offlineReady) {
      toast.success('App ready to work offline', { id: 'offline-ready' });
    }
  }, [offlineReady]);

  useEffect(() => {
    if (needRefresh) {
      // Clear any existing timer
      if (reloadTimerRef.current) clearTimeout(reloadTimerRef.current);

      // Show a toast that will auto‑reload after 5 seconds
      const toastId = toast(
        (t) => (
          <div className="flex items-center gap-3">
            <span className="text-sm font-medium">New version available – reloading in 5 seconds</span>
          </div>
        ),
        { duration: 5000, id: 'sw-update' }
      );

      // Set timer to reload
      reloadTimerRef.current = setTimeout(() => {
        updateServiceWorker(true);
        // No need to manually reload; updateServiceWorker(true) will reload
      }, 5000);
    }

    return () => {
      if (reloadTimerRef.current) clearTimeout(reloadTimerRef.current);
    };
  }, [needRefresh, updateServiceWorker]);

  return null;
}