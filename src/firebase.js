import Firebase from 'firebase/compat/app';
import 'firebase/compat/firestore';
// import {getStorage} from 'firebase/storage'
const app = {
    apiKey: "AIzaSyAqbvpHep5aNEWnf0gFVCXYJUhKYpWihBs",
    authDomain: "kehtisahayaak.firebaseapp.com",
    projectId: "kehtisahayaak",
    storageBucket: "kehtisahayaak.appspot.com",
    messagingSenderId: "968813007726",
    appId: "1:968813007726:web:e7a8cee962a7c74b7be77f"
  };

const FirebaseApp = Firebase.initializeApp(app);
const db = FirebaseApp.firestore();
// const storage = getStorage(app);

export  {db};