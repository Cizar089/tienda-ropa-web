import { initializeApp } from "firebase/app";
import { getAuth, GoogleAuthProvider } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyBe4zbzcEqvrHrKqDyhlN6fPUqNBz4LHS0",
  authDomain: "insignis-web.firebaseapp.com",
  projectId: "insignis-web",
  storageBucket: "insignis-web.firebasestorage.app",
  messagingSenderId: "401254569595",
  appId: "1:401254569595:web:e4b7580ae06e17c26e34de",
};

const app = initializeApp(firebaseConfig);

export const auth = getAuth(app);
export const googleProvider = new GoogleAuthProvider();
export const db = getFirestore(app);

export const db = getFirestore(app);

export default app;