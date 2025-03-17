import { initializeApp } from "firebase/app";
// import { getAnalytics } from "firebase/analytics";
import { getAuth } from "firebase/auth";

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyBgDJkuLrZ3IgvSHBQiK3UY2EwJLB3bsfA",
  authDomain: "mynutriapps.firebaseapp.com",
  projectId: "mynutriapps",
  storageBucket: "mynutriapps.firebasestorage.app",
  messagingSenderId: "448807147122",
  appId: "1:448807147122:web:dda2e240a76aa37afe94eb",
  measurementId: "G-SPBSELGHXJ",
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
// export const analytics = getAnalytics(app);
export const auth = getAuth(app);
