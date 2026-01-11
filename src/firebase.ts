// src/firebase.ts
import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getAuth } from "firebase/auth";

const firebaseConfig = {
  apiKey: "AIzaSyAhwYtmnFjAJIj5v52ogZHIqq6lHGi4yvc",
  authDomain: "pomodoro-2524d.firebaseapp.com",
  projectId: "pomodoro-2524d",
  storageBucket: "pomodoro-2524d.firebasestorage.app",
  messagingSenderId: "292259088483",
  appId: "1:292259088483:web:86217903c17975396a1056",
  measurementId: "G-NVQ67F8DZ5"
};

// ✅ Инициализация Firebase
const app = initializeApp(firebaseConfig);

// ✅ Подключаем сервисы
export const db = getFirestore(app);
export const auth = getAuth(app);
