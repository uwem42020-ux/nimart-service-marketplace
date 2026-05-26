import { initializeApp } from "firebase/app";
import { getMessaging, getToken, onMessage } from "firebase/messaging";

const firebaseConfig = {
  apiKey: "AIzaSyCCSOq11ORgRJ2978hOUaQ6bsAHNWNyC2g",
  authDomain: "nimart-9ccb9.firebaseapp.com",
  projectId: "nimart-9ccb9",
  storageBucket: "nimart-9ccb9.firebasestorage.app",
  messagingSenderId: "813664294734",
  appId: "1:813664294734:web:abda56291a587157bef01f",
};

const app = initializeApp(firebaseConfig);
const messaging = getMessaging(app);

export { messaging };