import { initializeApp, getApp, getApps } from "firebase/app";
import type { Messaging } from "firebase/messaging";

const firebaseConfig = {
  apiKey: "AIzaSyCCSOq11ORgRJ2978hOUaQ6bsAHNWNyC2g",
  authDomain: "nimart-9ccb9.firebaseapp.com",
  projectId: "nimart-9ccb9",
  storageBucket: "nimart-9ccb9.firebasestorage.app",
  messagingSenderId: "813664294734",
  appId: "1:813664294734:web:abda56291a587157bef01f",
};

// Only initialise Firebase app if it hasn't been created yet
const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApp();

let messaging: Messaging | null = null;
try {
  if (typeof window !== 'undefined' && 'serviceWorker' in navigator) {
    const { getMessaging } = await import("firebase/messaging");
    messaging = getMessaging(app);
  }
} catch (error) {
  console.warn("Firebase messaging not available:", error);
}

export { messaging };