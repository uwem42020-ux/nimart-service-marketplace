import { useEffect, useRef } from 'react';
import toast from 'react-hot-toast';
import { useRegisterSW } from 'virtual:pwa-register/react';
import { RefreshCw } from 'lucide-react';

export function UpdateNotification() {
  const {
    offlineReady: [offlineReady, setOfflineReady],
    needRefresh: [needRefresh, setNeedRefresh],
    updateServiceWorker,
  } = useRegisterSW({
    onRegisteredSW(swUrl, r) {
      console.log('Service Worker registered:', swUrl);
      // Check for updates every 30 minutes (was 1 hour)
      r && setInterval(() => r.update(), 1800000);
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
      if (reloadTimerRef.current) clearTimeout(reloadTimerRef.current);

      // Show a persistent toast with an action
      toast(
        (t) => (
          <div className="flex items-center gap-3">
            <span className="text-sm font-medium">New version available</span>
            <button
              onClick={() => {
                toast.dismiss(t.id);
                updateServiceWorker(true); // forces reload
              }}
              className="bg-primary-600 text-white px-3 py-1 rounded-lg text-xs font-medium hover:bg-primary-700"
            >
              Update now
            </button>
          </div>
        ),
        { duration: Infinity, id: 'sw-update' }
      );
    }

    return () => {
      if (reloadTimerRef.current) clearTimeout(reloadTimerRef.current);
    };
  }, [needRefresh, updateServiceWorker]);

  return null;
}