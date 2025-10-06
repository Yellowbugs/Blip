import React, { useState } from "react";
import GlassCard from "../components/GlassCard";
import Modal from "../components/Modal";
import { useNavigate } from "react-router-dom";
import { doc, updateDoc } from "firebase/firestore";
import { db } from "../firebase";
import { collection, getDocs } from "firebase/firestore";
import { useEffect } from "react";

export default function UserProfile({ currentUser, users, setUsers, logout }) {
  const [uploading, setUploading] = useState(false);
  const [editing, setEditing] = useState(false);
  const [modal, setModal] = useState({ open: false, type: "", search: "" });
  const navigate = useNavigate();
  const [preview, setPreview] = useState(currentUser?.pfp || "");
  const [formData, setFormData] = useState({
    username: currentUser.username || "",
    firstName: currentUser.firstName || "",
    lastName: currentUser.lastName || "",
    email: currentUser.email || "",
  });

  useEffect(() => {
    async function fetchAllUsers() {
      try {
        const usersCol = collection(db, "users");
        const usersSnap = await getDocs(usersCol);
        const userList = usersSnap.docs.map((doc) => ({ uid: doc.id, ...doc.data() }));
        setUsers(userList);
      } catch (err) {
        console.error("Error fetching users:", err);
      }
    }
  
    fetchAllUsers();
  }, [setUsers]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSave = async () => {
    try {
      // Update local state
      setUsers((prev = []) =>
        prev.map((u) =>
          u.id === currentUser.id ? { ...u, ...formData, pfp: preview } : u
        )
      );
  
      // Update Firestore
      const userRef = doc(db, "users", currentUser.uid);
      await updateDoc(userRef, {
        ...formData,
        pfp: preview,
      });
  
      setEditing(false);
    } catch (error) {
      console.error("Error saving profile:", error);
    }
  };
  

  const handleLogout = () => {
    logout();        // log the user out
    navigate("/");   // redirect to home
  };

  const handleFileUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;
  
    const reader = new FileReader();
    reader.onload = (event) => {
      const img = new Image();
      img.src = event.target.result;
      img.onload = () => {
        const canvas = document.createElement("canvas");
        const maxSize = 300; // max width/height in px
        let width = img.width;
        let height = img.height;
  
        // Resize while keeping aspect ratio
        if (width > height) {
          if (width > maxSize) {
            height *= maxSize / width;
            width = maxSize;
          }
        } else {
          if (height > maxSize) {
            width *= maxSize / height;
            height = maxSize;
          }
        }
  
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext("2d");
        ctx.drawImage(img, 0, 0, width, height);
  
        // compress to jpeg with quality 0.7
        const compressedBase64 = canvas.toDataURL("image/jpeg", 0.7);
  
        setPreview(compressedBase64);
  
        // save to Firestore
        setUsers((prevUsers = []) =>
          prevUsers.map((u) =>
            u.id === currentUser.id ? { ...u, pfp: compressedBase64 } : u
          )
        );
      };
    };
    reader.readAsDataURL(file);
  };
  const filteredList = () => {
    if (!modal.type) return [];
    const list =
      modal.type === "Followers"
        ? currentUser.followers || []
        : currentUser.following || [];
    return list
       .map((item) => users.find((u) => u.uid === item.uid)) // use uid
      .filter((u) => u && u.username.toLowerCase().includes(modal.search.toLowerCase()));
  };

  return (
    <div className="min-h-screen p-4 flex justify-center">
      <GlassCard className="w-full max-w-md mt-20 p-6">
        <div className="flex flex-col items-center gap-3 mb-2 relative">
        <div
            className={`relative w-24 h-24 rounded-full overflow-hidden border-2 border-purple-500 cursor-pointer ${
              editing ? "filter" : ""
            }`}
            onClick={() => editing && document.getElementById("pfpInput").click()}
          >
            {preview ? (
              <img
                src={preview}
                alt="Profile"
                className={`w-full h-full object-cover ${editing ? "filter blur-sm" : ""}`}
              />
            ) : (
              <div className="w-full h-full bg-purple-700 flex items-center justify-center text-white text-3xl font-bold uppercase">
                {currentUser.username?.[0] || "?"}
              </div>
            )}
            {editing && (
              <div className="absolute inset-0 flex items-center justify-center text-white text-base bg-black/40">
                Edit
              </div>
            )}
          </div>
          <input
            type="file"
            accept="image/*"
            id="pfpInput"
            className="hidden"
            onChange={handleFileUpload}
            disabled={uploading}
          />

          {/* Pen icon for editing */}
          <button
            onClick={() => setEditing(true)}
            className="absolute top-0 right-0 text-purple-400 hover:text-purple-200"
          >
            ✎
          </button>

          <h2 className="text-2xl font-bold text-purple-400">{currentUser.username}</h2>

          {/* Followers / Following numbers */}
          <div className="flex gap-6 mt-1">
            <div
              className="cursor-pointer"
              onClick={() => setModal({ open: true, type: "Followers", search: "" })}
            >
              <span className="font-bold">{currentUser.followers?.length || 0}</span>{" "}
              <span className="opacity-70">Followers</span>
            </div>
            <div
              className="cursor-pointer"
              onClick={() => setModal({ open: true, type: "Following", search: "" })}
            >
              <span className="font-bold">{currentUser.following?.length || 0}</span>{" "}
              <span className="opacity-70">Following</span>
            </div>
          </div>
        </div>

        {editing && (
          <div className="mt-4 space-y-3 w-full">
            <input
              type="text"
              placeholder="Username"
              name="username"
              value={formData.username}
              onChange={handleChange}
              className="w-full p-2 rounded bg-white/10 text-white"
            />
            <input
              type="text"
              name="firstName"
              placeholder="First Name"
              value={formData.firstName}
              onChange={handleChange}
              className="w-full p-2 rounded bg-white/10 text-white"
            />
            <input
              type="text"
              name="lastName"
              placeholder="Last Name"
              value={formData.lastName}
              onChange={handleChange}
              className="w-full p-2 rounded bg-white/10 text-white"
            />
            <input
              type="email"
              name="email"
              placeholder="Email"
              value={formData.email}
              onChange={handleChange}
              className="w-full p-2 rounded bg-white/10 text-white"
            />
            <button
              onClick={handleSave}
              className="bg-purple-600 hover:bg-purple-700 w-full py-2 rounded-xl mt-2"
            >
              Save
            </button>
          </div>
        )}

        <button
          onClick={handleLogout}
          className="bg-gradient-to-r from-purple-600 to-indigo-600 px-4 py-2 rounded-xl w-full mt-4"
        >
          Logout
        </button>
      </GlassCard>

      {/* Modal for followers/following */}
      {modal.open && (
        <Modal onClose={() => setModal({ ...modal, open: false })}>
          <h3 className="text-lg font-bold text-purple-400 mb-3">{modal.type}</h3>
          <input
            type="text"
            placeholder="Search..."
            value={modal.search}
            onChange={(e) => setModal({ ...modal, search: e.target.value })}
            className="w-full mb-3 p-2 rounded bg-white/10 text-white"
          />
          <ul className="space-y-2 max-h-64 overflow-y-auto">
            {filteredList().length > 0 ? (
              filteredList().map((u) => (
                <li key={u.id}>
                  <div
                    className="flex items-center gap-3 cursor-pointer"
                    onClick={() => setModal({ ...modal, open: false })}
                  >
                    {u.pfp ? (
                      <img
                        onClick={() => navigate(`/profile/${u.uid}`)}
                        src={u.pfp}
                        alt={u.username}
                        className="w-8 h-8 rounded-full object-cover border border-purple-500"
                      />
                    ) : (
                      <div className="w-8 h-8 rounded-full bg-purple-700 flex items-center justify-center text-white font-semibold">
                        {u.username?.[0]?.toUpperCase()}
                      </div>
                    )}
                    <span onClick={() => navigate(`/profile/${u.uid}`)}>{u.username}</span>
                  </div>
                </li>
              ))
            ) : (
              <p className="opacity-50">No users found.</p>
            )}
          </ul>
        </Modal>
      )}
    </div>
  );
}
