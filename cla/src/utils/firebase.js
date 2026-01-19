// Firebase Configuration
// IMPORTANT: You need to add your Firebase Web App credentials here
// To get these credentials:
// 1. Go to Firebase Console: https://console.firebase.google.com/
// 2. Select your project: careconnect-42772
// 3. Click the gear icon ⚙️ → Project settings
// 4. Scroll down to "Your apps" section
// 5. Click the </> (Web) icon to add a web app (if not already added)
// 6. Copy the firebaseConfig object

import { initializeApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';
import { getAuth } from 'firebase/auth';

// TODO: Replace with your Firebase Web App config
// IMPORTANT: You're currently using the Android app ID - this won't work!
// You need to create a WEB app in Firebase Console and get its appId
// 
// Steps:
// 1. Go to Firebase Console → Project Settings
// 2. Scroll to "Your apps" section
// 3. Click the </> (Web) icon to add a web app
// 4. Give it a name like "CareConnect Admin Portal"
// 5. Copy the appId (it will look like: "1:713688982594:web:xxxxxxxxxxxxx")
// 6. Replace the appId below
//
// NOTE: You only need ONE web app for the entire admin portal.
// Admin and SuperAdmin are just roles in your code (handled by auth.js),
// they both use the same Firebase app.
const firebaseConfig = {
  apiKey: "AIzaSyAeMC3szpfKrX5LWcY5m9_311HAMg_LASI",
  authDomain: "careconnect-42772.firebaseapp.com",
  projectId: "careconnect-42772",
  storageBucket: "careconnect-42772.firebasestorage.app",
  messagingSenderId: "713688982594",
  appId: "1:713688982594:web:8753620067f0e46d52b9db" // ⚠️ Replace with actual WEB app ID (not Android!)
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Firestore
export const db = getFirestore(app);

// Initialize Auth (if needed for admin authentication)
export const auth = getAuth(app);

export default app;
