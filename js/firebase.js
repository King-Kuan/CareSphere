// ============================================================
//  CareSphere — Firebase Shared Config
// ============================================================
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-app.js";
import { getFirestore }  from "https://www.gstatic.com/firebasejs/10.12.0/firebase-firestore.js";
import { getAuth }       from "https://www.gstatic.com/firebasejs/10.12.0/firebase-auth.js";

const firebaseConfig = {
  apiKey:            "AIzaSyBwq7tPqEgv446a9p6I25oyXznwlEIwcwc",
  authDomain:        "carespher.firebaseapp.com",
  databaseURL:       "https://carespher-default-rtdb.europe-west1.firebasedatabase.app",
  projectId:         "carespher",
  storageBucket:     "carespher.firebasestorage.app",
  messagingSenderId: "1063379902456",
  appId:             "1:1063379902456:web:f26ebd2dcbde18e86a000d",
  measurementId:     "G-PCREP5P5SE"
};

const app        = initializeApp(firebaseConfig);
export const db   = getFirestore(app);
export const auth = getAuth(app);
export default app;
