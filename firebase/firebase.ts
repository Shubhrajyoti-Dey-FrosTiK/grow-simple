"use client";

// Import the functions you need from the SDKs you need
import firebase from "firebase/compat/app";
import {
  getAuth,
  GoogleAuthProvider,
  connectAuthEmulator,
} from "firebase/auth";
import { getFirestore } from "firebase/firestore";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_CLIENT_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_CLIENT_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_CLIENT_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_CLIENT_STORAGE_BUCKET,
  messagingSenderId:
    process.env.NEXT_PUBLIC_FIREBASE_CLIENT_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_CLIENT_APP_ID,
  measurementId: process.env.NEXT_PUBLIC_FIREBASE_CLIENT_MEASUREMENT_ID,
};

// Initialize Firebase
export const firebaseInstance = firebase.initializeApp(firebaseConfig);
export const auth = getAuth(firebaseInstance);
const db = getFirestore(firebaseInstance);
connectAuthEmulator(auth, "http://localhost:9099");

// Auth
export const googleAuthProvider = new GoogleAuthProvider();
