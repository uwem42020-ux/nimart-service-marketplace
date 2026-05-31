import { useEffect, useRef, useState } from 'react';
import { useRegisterSW } from 'virtual:pwa-register/react';
import { RefreshCw, X } from 'lucide-react';

export function UpdateNotification() {
  const {
    offlineReady: [offlineReady, setOfflineReady],
    needRefresh: [needRefresh, setNeedRefresh],
    updateServiceWorker,
  } = useRegisterSW({
    onRegisteredSW(swUrl, r) {
      console.log('Service Worker registered:', swUrl);
      r && setInterval(() => r.update(), 30 * 60 * 1000); // check every 30 min
    },
    onRegisterError(error) {
      console.error('SW registration error:', error);
    },
  });

  const [dismissed, setDismissed] = useState(false);

  // Show a persistent bar when a new version is ready
  if (!needRefresh || dismissed) return null;

  return (
    <div className="fixed bottom-20 left-4 right-4 z-50 md:left-auto md:right-4 md:w-80">
      <div className="bg-primary-600 text-white rounded-xl shadow-lg p-4 flex items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <RefreshCw className="h-5 w-5 animate-spin" />
          <span className="text-sm font-medium">New version available</span>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => updateServiceWorker(true)}
            className="bg-white text-primary-600 px-3 py-1 rounded-lg text-sm font-semibold hover:bg-gray-100"
          >
            Update
          </button>
          <button
            onClick={() => setDismissed(true)}
            className="text-white/70 hover:text-white"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      </div>
    </div>
  );
}