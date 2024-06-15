// firebaseConfig.js
import { initializeApp } from "firebase/app";

import { getAuth, setPersistence, browserSessionPersistence } from "firebase/auth";
import { getFirestore } from "firebase/firestore"
import { getAnalytics } from 'firebase/analytics';

const firebaseConfig = {
    apiKey: "AIzaSyAMaaO2sWHlh7CSec5uEQPt-c6XaoKlV3g",
    authDomain: "findmyjamm.firebaseapp.com",
    projectId: "findmyjamm",
    storageBucket: "findmyjamm.appspot.com",
    messagingSenderId: "225987458754",
    appId: "1:225987458754:web:5b8419db50dc84b82fed5b",
    measurementId: "G-KH6YZX82YW"
  };
  
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);

// Enable session persistence
setPersistence(auth, browserSessionPersistence)
  .then(() => {
    console.log("Session persistence enabled");
  })
  .catch((error) => {
    console.error("Error enabling session persistence: ", error);
  });

const db = getFirestore(app);
const analytics = getAnalytics(app);

export {app, analytics, auth, db};