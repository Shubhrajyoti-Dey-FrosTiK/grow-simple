"use client";

// Import the functions you need from the SDKs you need
import firebase from "firebase/compat/app";
import { getAuth, GoogleAuthProvider } from "firebase/auth";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
import firebaseConfig from "../firebase.json";

// Initialize Firebase
export const firebaseInstance = firebase.initializeApp(firebaseConfig);
export const auth = getAuth(firebaseInstance);

// Auth
export const googleAuthProvider = new GoogleAuthProvider();
