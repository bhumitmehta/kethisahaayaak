const admin = require("firebase-admin");
const { initializeApp } = require("firebase/app"); // Correct import for Client SDK
const { getFirestore } = require("firebase/firestore"); // Correct import for Firestore
const serviceAccount = require("C:/Users/20092/OneDrive/Documents/Bhumit/khetisahayaak/backend/kehtisahayaak-firebase-adminsdk-1kbh4-71b645733c.json");

// Initialize Firebase Admin SDK
admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  storageBucket: "kehtisahayaak.appspot.com"
});

// Initialize Firebase Client SDK
const firebaseConfig = {
  apiKey: "AIzaSyAqbvpHep5aNEWnf0gFVCXYJUhKYpWihBs",
  authDomain: "kehtisahayaak.firebaseapp.com",
  projectId: "kehtisahayaak",
  storageBucket: "kehtisahayaak.appspot.com",
  messagingSenderId: "968813007726",
  appId: "1:968813007726:web:e7a8cee962a7c74b7be77f"
};

const app = initializeApp(firebaseConfig); // Initialize Client SDK App

// Export Firebase Firestore and Auth for use in your routes
const auth = admin.auth();
const db = admin.firestore(); // Use admin.firestore() for server-side Firestore
const bucket = admin.storage().bucket();

module.exports = { auth, db, bucket };
