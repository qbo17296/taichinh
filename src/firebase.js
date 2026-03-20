// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import { getFirestore } from "firebase/firestore";

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyAuHOvGnUGBYRlIHY25kzm43X2LXGc5ik4",
  authDomain: "taichinh-8cc54.firebaseapp.com",
  projectId: "taichinh-8cc54",
  storageBucket: "taichinh-8cc54.firebasestorage.app",
  messagingSenderId: "128339155845",
  appId: "1:128339155845:web:3875882b3d3bb8375a02ec",
  measurementId: "G-Y4L6XG3FDS"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
export const analytics = getAnalytics(app);
export const db = getFirestore(app);
