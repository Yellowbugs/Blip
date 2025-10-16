// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";
import { getAuth } from "firebase/auth";       // TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyCYytbdthyLJTBB1eO8MdeXSm-tpyayiAY",
  authDomain: "blip-3eb10.firebaseapp.com",
  projectId: "blip-3eb10",
  storageBucket: "gs://blip-3eb10.firebasestorage.app",
  messagingSenderId: "17399215383",
  appId: "1:17399215383:web:e1e913e08c1580eac93352",
  measurementId: "G-LXHBFVH9KG"
};

const app = initializeApp(firebaseConfig);


// Initialize Firebase
export const db = getFirestore(app);
export const storage = getStorage(app);
export const auth = getAuth(app);