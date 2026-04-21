import { initializeApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyBUI54W1NVgqNokajWX7sBQOpJLm2cVjHE",
  authDomain: "ai-music-transparency-test.firebaseapp.com",
  projectId: "ai-music-transparency-test",
  storageBucket: "ai-music-transparency-test.firebasestorage.app",
  messagingSenderId: "215470250538",
  appId: "1:215470250538:web:f0cdc803eab0d3be8c8153"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Firestore
export const db = getFirestore(app);