import React, { useEffect, useState } from "react";
import GlassCard from "../components/GlassCard";
import { useAuth } from "../context/AuthContext";
import { db } from "../firebase";
import { doc, onSnapshot, updateDoc,getDoc, getDocs, collection } from "firebase/firestore";
import { useNavigate } from "react-router-dom";

export default function Following() {
  const { user } = useAuth();
  const [profile, setProfile] = useState(null);
  const [suggestions, setSuggestions] = useState([]);
  const navigate = useNavigate();

  // Listen to the current user's profile in real time
  useEffect(() => {
    if (!user) return;
    const unsub = onSnapshot(doc(db, "users", user.uid), (snap) => {
      if (snap.exists()) setProfile(snap.data());
    });
    return () => unsub();
  }, [user]);

  // Fetch suggested users
  useEffect(() => {
  async function fetchSuggestions() {
    if (!user?.uid) return;

    const allUsers = await getDocs(collection(db, "users"));
    const list = [];
    allUsers.forEach((docSnap) => {
      const id = docSnap.id;
      if (id && id !== user.uid && !(user.following?.some(f => f.uid === id))) {
        list.push({ uid: id, ...docSnap.data() });
      }
    });
    setSuggestions(list);
  }
  fetchSuggestions();
}, [user]);


async function followUser(targetUser) {
  if (!profile || !targetUser) return;

  const userRef = doc(db, "users", user.uid);
  const targetRef = doc(db, "users", targetUser.uid);

  // 1️⃣ Update your following array
  const newFollowing = [
    ...(profile.following || []),
    {
      uid: targetUser.uid,
      username: targetUser.username,
      pfp: targetUser.pfp || "",
    },
  ];
  await updateDoc(userRef, { following: newFollowing });

  // 2️⃣ Update target user's followers array
  const targetSnap = await getDoc(targetRef);
  if (targetSnap.exists()) {
    const targetData = targetSnap.data();
    const newFollowers = [
      ...(targetData.followers || []),
      {
        uid: user.uid,
        username: profile.username,
        pfp: profile.pfp || "",
      },
    ];
    await updateDoc(targetRef, { followers: newFollowers });
  }

  // 3️⃣ Remove target from suggestions immediately
  setSuggestions(prev => prev.filter(s => s.uid !== targetUser.uid));
}
  if (!user)
    return (
      <div className="flex justify-center items-center h-screen text-white">
        Log in to see following.
      </div>
    );

  return (
    <div className="min-h-screen p-4 flex flex-col items-center">
      <GlassCard className="w-full max-w-md mt-20 p-6">
        <h2 className="text-2xl font-bold text-purple-400 mb-4">Following</h2>

        <div className="space-y-2 mb-6">
          {profile?.following?.length ? (
            profile.following.map((f, i) => (
              <div
                key={i}
                onClick={() => navigate(`/profile/${f.uid}`)}
                className="flex items-center gap-3 p-2 rounded-md hover:bg-white/5 cursor-pointer"
              >
                {f.pfp ? (
                  <img
                    src={f.pfp}
                    alt={f.username}
                    className="w-10 h-10 rounded-full object-cover border border-purple-500"
                  />
                ) : (
                  <div className="w-10 h-10 rounded-full bg-purple-700 flex items-center justify-center text-white font-semibold">
                    {f.username[0]?.toUpperCase()}
                  </div>
                )}
                <span className="text-slate-200">{f.username}</span>
              </div>
            ))
          ) : (
            <p className="text-slate-400 text-center">You’re not following anyone yet.</p>
          )}
        </div>

        {/* Suggested Users */}
        {suggestions.length > 0 && (
          <>
            <h3 className="text-lg font-semibold text-purple-400 mb-2">
              Suggested Users
            </h3>
            <div className="space-y-2">
              {suggestions.map((s, i) => (
                <div
                  key={i}
                  className="flex items-center justify-between p-2 rounded-md hover:bg-white/5"
                >
                  <div
                    onClick={() => navigate(`/profile/${s.uid}`)}
                    className="flex items-center gap-3 cursor-pointer"
                  >
                    {s.pfp ? (
                      <img
                        src={s.pfp}
                        alt={s.username}
                        className="w-10 h-10 rounded-full object-cover border border-purple-500"
                      />
                    ) : (
                      <div className="w-10 h-10 rounded-full bg-purple-700 flex items-center justify-center text-white font-semibold">
                        {s.username[0]?.toUpperCase()}
                      </div>
                    )}
                    <span className="text-slate-200">{s.username}</span>
                  </div>
                  <button
                    onClick={() => followUser(s)}
                    className="text-sm text-white bg-purple-600 px-3 py-1 rounded-lg hover:bg-purple-700 transition"
                  >
                    Follow
                  </button>
                </div>
              ))}
            </div>
          </>
        )}
      </GlassCard>
    </div>
  );
}
