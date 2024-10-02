const admin = require("firebase-admin");
const serviceAccount = require("/Users/bhumitmehta/kehti/SIH2022/backend/kehtisahayaak-firebase-adminsdk-1kbh4-fba328aff3.json"); // Download this file from Firebase
const Firebase = require("firebase/compat/app");

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  storageBucket: "your-project-id.appspot.com"
});

// Initialize Client SDK (if needed for any client-side Firebase operations)
const firebaseConfig = {
  apiKey: "AIzaSyAqbvpHep5aNEWnf0gFVCXYJUhKYpWihBs",
  authDomain: "kehtisahayaak.firebaseapp.com",
  projectId: "kehtisahayaak",
  storageBucket: "kehtisahayaak.appspot.com",
  messagingSenderId: "968813007726",
  appId: "1:968813007726:web:e7a8cee962a7c74b7be77f"
};

Firebase.initializeApp(firebaseConfig);

// Export Firebase Firestore and Auth for use in your routes
const auth = admin.auth();
const db = Firebase.firestore();
const bucket = admin.storage().bucket();

module.exports = { auth, db, bucket };
