// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import { getAuth } from "firebase/auth";
import { getStorage } from "firebase/storage";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyCOwHd6e-eKAS9fGoxvkowDOJonsBfVS50",
  authDomain: "netflixgpt-e671d.firebaseapp.com",
  projectId: "netflixgpt-e671d",
  storageBucket: "netflixgpt-e671d.firebasestorage.app",
  messagingSenderId: "350530668256",
  appId: "1:350530668256:web:2ddd5207f7a965f608b285",
  measurementId: "G-LGHHZCM7C3"
};

// Initialize Firebase
export const app = initializeApp(firebaseConfig);
getAnalytics(app);

export const auth = getAuth(app)
export const storage = getStorage(app)