import { getToken, onMessage, deleteToken } from "firebase/messaging";
import { messaging } from "./firebase";
import { supabase } from "./supabase";

const VAPID_KEY = "BDZ4uN_no-rSBlF-DOYvTlAnAGJ7wDzorZSiYomvSmzayJgcOqRQy1VmKlNpDK5EutkwqaHi_yGZTpbBcDkyIgc";

// Request permission and save the FCM token to the user's profile
export async function requestPushPermission(userId: string) {
  try {
    const permission = await Notification.requestPermission();
    if (permission !== "granted") return null;

    const token = await getToken(messaging, {
      vapidKey: VAPID_KEY,
      serviceWorkerRegistration: await navigator.serviceWorker.getRegistration(),
    });

    if (!token) return null;

    // Save the token to the user's profile
    await supabase.from("profiles").update({ fcm_token: token }).eq("id", userId);

    return token;
  } catch (error) {
    console.error("Failed to get push permission:", error);
    return null;
  }
}

// Remove the token when user logs out
export async function removePushToken(userId: string) {
  try {
    const token = await getToken(messaging, { vapidKey: VAPID_KEY });
    if (token) await deleteToken(messaging);
    await supabase.from("profiles").update({ fcm_token: null }).eq("id", userId);
  } catch (error) {
    console.error("Failed to remove push token:", error);
  }
}

// Listen for foreground messages (when the app is open)
export function onForegroundMessage(callback: (payload: any) => void) {
  return onMessage(messaging, (payload) => {
    callback(payload);
  });
}