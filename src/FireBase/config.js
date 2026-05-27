import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyARb-OKQqlYTj_qlxabnOKGkjzLT5JmLxg",
  authDomain: "proyecto-2026-1-web.firebaseapp.com",
  projectId: "proyecto-2026-1-web",
  storageBucket: "proyecto-2026-1-web.firebasestorage.app",
  messagingSenderId: "698755934470",
  appId: "1:698755934470:web:ec6bb535de78d20afc5687"
};

const app = initializeApp(firebaseConfig);

export const auth = getAuth(app);
export const db = getFirestore(app);
export default app;