import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyDxUJYSCSuH4GpTqe8E5m5Byp993166uIo",
  authDomain: "directnest-a6857.firebaseapp.com",
  projectId: "directnest-a6857",
  storageBucket: "directnest-a6857.firebasestorage.app",
  messagingSenderId: "239725761933",
  appId: "1:239725761933:web:4e851c304d8b14c4e0d9c4",
};

const app = initializeApp(firebaseConfig);

export const auth = getAuth(app);
export const db = getFirestore(app);

export default app;