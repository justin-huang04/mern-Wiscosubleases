// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: "mern-sublease.firebaseapp.com",
  projectId: "mern-sublease",
  storageBucket: "mern-sublease.appspot.com",
  messagingSenderId: "363567762625",
  appId: "1:363567762625:web:90c0b7ef1c9726b767d840",
};

// Initialize Firebase
export const app = initializeApp(firebaseConfig);
