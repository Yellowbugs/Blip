// src/seedUsers.js
import { auth, db } from "./firebase.js";
import { createUserWithEmailAndPassword, updateProfile } from "firebase/auth";
import { doc, setDoc } from "firebase/firestore";

// Test users
const testUsers = [
  {
    email: "josh@example.com",
    password: "password123",
    username: "joshclinton",
    firstName: "Josh",
    lastName: "Clinton",
    pfp: "https://i.pravatar.cc/150?img=5"
  },
  {
    email: "riley@example.com",
    password: "mypassword",
    username: "riley",
    firstName: "Riley",
    lastName: "Smith",
    pfp: "https://i.pravatar.cc/150?img=12"
  }
];

async function seedUsers() {
  for (const user of testUsers) {
    try {
      // 1️⃣ Create Auth user
      const userCredential = await createUserWithEmailAndPassword(auth, user.email, user.password);

      // 2️⃣ Update Auth profile (display name + photo)
      await updateProfile(userCredential.user, {
        displayName: user.username,
        photoURL: user.pfp
      });

      // 3️⃣ Add extra info to Firestore
      await setDoc(doc(db, "users", userCredential.user.uid), {
        username: user.username,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        pfp: user.pfp,
        createdAt: Date.now()
      });

      console.log(`✅ Added ${user.username}`);
    } catch (err) {
      console.error(`❌ Failed to add ${user.username}:`, err.message);
    }
  }
  console.log("All users processed!");
}

seedUsers();
