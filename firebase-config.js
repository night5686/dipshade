// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyBY9-hGpKZ5dPV3E9GHQjP2wSNy3yRcjkE",
  authDomain: "dipshade-3dd03.firebaseapp.com",
  projectId: "dipshade-3dd03",
  storageBucket: "dipshade-3dd03.firebasestorage.app",
  messagingSenderId: "824019034596",
  appId: "1:824019034596:web:42a46443127644e5f427f1",
  measurementId: "G-0VNZE2BXN5"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);
const auth = getAuth(app);
const db = getFirestore(app);

// Export for use in other files
export { app, analytics, auth, db };