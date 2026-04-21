// src/components/common/UpdateNotification.tsx
import { useEffect } from 'react';
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
    },
    onRegisterError(error) {
      console.error('SW registration error:', error);
    },
  });

  useEffect(() => {
    if (offlineReady) {
      toast.success('App ready to work offline', { id: 'offline-ready' });
    }
  }, [offlineReady]);

  useEffect(() => {
    if (needRefresh) {
      toast(
        (t) => (
          <div className="flex items-center gap-3">
            <span className="text-sm font-medium">New version available!</span>
            <button
              className="bg-primary-600 text-white px-3 py-1 rounded-md text-sm"
              onClick={() => {
                updateServiceWorker(true);
                toast.dismiss(t.id);
                window.location.reload();
              }}
            >
              Refresh
            </button>
            <button
              className="text-gray-500 hover:text-gray-700 text-sm"
              onClick={() => {
                setNeedRefresh(false);
                toast.dismiss(t.id);
              }}
            >
              Dismiss
            </button>
          </div>
        ),
        {
          duration: Infinity,
          id: 'sw-update',
        }
      );
    }
  }, [needRefresh, updateServiceWorker, setNeedRefresh]);

  return null;
}