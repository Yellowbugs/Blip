import React, { createContext, useContext, useState, useEffect } from "react";
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  updateProfile,
} from "firebase/auth";
import { doc, setDoc, getDoc } from "firebase/firestore";
import { auth, db } from "../firebase";

const AuthContext = createContext();
export function useAuth() {
  return useContext(AuthContext);
}

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // 🔹 Fetch user profile from Firestore
  const loadUserProfile = async (firebaseUser) => {
    if (!firebaseUser) return null;
  
    const userRef = doc(db, "users", firebaseUser.uid);
    const docSnap = await getDoc(userRef);
  
    if (docSnap.exists()) {
      return docSnap.data(); // includes username, followers, following, etc.
    } else {
      // Create default document if missing
      const newUser = {
        uid: firebaseUser.uid,
        username: firebaseUser.displayName || "NewUser",
        firstName: "",
        lastName: "",
        email: firebaseUser.email,
        pfp: "",
        followers: [],
        following: [],
        createdAt: Date.now(),
      };
      await setDoc(userRef, newUser);
      return newUser;
    }
  };
  

  // 🔹 Register a new user
  const register = async ({ email, password, username, firstName, lastName }) => {
    // 1️⃣ Create Auth user
    const cred = await createUserWithEmailAndPassword(auth, email, password);
  
    // 2️⃣ Update displayName in Auth profile
    await updateProfile(cred.user, { displayName: username });
  
    // 3️⃣ Create Firestore user document with all necessary fields
    const userRef = doc(db, "users", cred.user.uid);
    const userData = {
      uid: cred.user.uid,
      username,      // unique username
      firstName,
      lastName,
      email,
      pfp: "",
      followers: [], // empty array
      following: [], // empty array
      createdAt: Date.now(),
    };
  
    await setDoc(userRef, userData);
  
    // 4️⃣ Update context
    setUser(userData);
  };
  

  // 🔹 Login existing user
  const login = async (email, password) => {
    const cred = await signInWithEmailAndPassword(auth, email, password);
    const profile = await loadUserProfile(cred.user);
    setUser(profile);
  };

  // 🔹 Logout
  const logout = async () => {
    await signOut(auth);
    setUser(null);
  };

  // 🔹 Auto-sync user state
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      if (firebaseUser) {
        const profile = await loadUserProfile(firebaseUser);
        setUser(profile);
      } else {
        setUser(null);
      }
      setLoading(false);
    });
    return unsubscribe;
  }, []);

  return (
    <AuthContext.Provider value={{ user, register, login, logout, loading }}>
      {!loading && children}
    </AuthContext.Provider>
  );
}
