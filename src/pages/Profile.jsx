import React, { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { db } from "../firebase";
import { doc, getDoc, onSnapshot, updateDoc } from "firebase/firestore";

export default function UserProfile() {
  const { uid } = useParams(); // /profile/:uid
  const { user: currentUser } = useAuth();
  const [profileUser, setProfileUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isFollowing, setIsFollowing] = useState(false);

  // Load user profile from Firestore
  useEffect(() => {
    if (!uid) return;
    const userRef = doc(db, "users", uid);
    const unsub = onSnapshot(userRef, (snap) => {
      if (snap.exists()) {
        const data = snap.data();
        setProfileUser({ uid: snap.id, ...data });
      } else {
        setProfileUser(null);
      }
      setLoading(false);
    });
    return () => unsub();
  }, [uid]);

  // Check if currentUser is following profileUser
  useEffect(() => {
    if (!currentUser || !profileUser) return;
    setIsFollowing(
      Array.isArray(currentUser.following) &&
        currentUser.following.some((f) => f.uid === profileUser.uid)
    );
  }, [currentUser, profileUser]);

  const toggleFollow = async () => {
    if (!currentUser || !profileUser) return;

    const currentRef = doc(db, "users", currentUser.uid);
    const profileRef = doc(db, "users", profileUser.uid);

    try {
      // Update currentUser following
      const currentSnap = await getDoc(currentRef);
      const currentData = currentSnap.data();
      const following = Array.isArray(currentData.following) ? currentData.following : [];

      let newFollowing;
      if (isFollowing) {
        newFollowing = following.filter((f) => f.uid !== profileUser.uid);
      } else {
        newFollowing = [...following, { uid: profileUser.uid, username: profileUser.username, pfp: profileUser.pfp || "" }];
      }

      await updateDoc(currentRef, { following: newFollowing });

      // Update profileUser followers
      const profileSnap = await getDoc(profileRef);
      const profileData = profileSnap.data();
      const followers = Array.isArray(profileData.followers) ? profileData.followers : [];

      let newFollowers;
      if (isFollowing) {
        newFollowers = followers.filter((f) => f.uid !== currentUser.uid);
      } else {
        newFollowers = [...followers, { uid: currentUser.uid, username: currentUser.username, pfp: currentUser.pfp || "" }];
      }

      await updateDoc(profileRef, { followers: newFollowers });

      setIsFollowing(!isFollowing);
    } catch (err) {
      console.error("Error toggling follow:", err);
    }
  };

  if (loading)
    return (
      <div className="text-white mt-10 flex items-center justify-center h-screen">
        Loading...
      </div>
    );

  if (!profileUser)
    return (
      <div className="text-white mt-10 flex items-center justify-center h-screen">
        User not found
      </div>
    );

  return (
    <div className="min-h-screen flex flex-col items-center justify-start bg-gradient-to-br from-black to-purple-900 text-white p-6">
      <div className="max-w-xl w-full bg-white/10 backdrop-blur-xl rounded-2xl p-8 text-center mt-20  shadow-lg">
        <div className="flex flex-col items-center gap-3  mb-4">
          {profileUser.pfp ? (
            <img
              src={profileUser.pfp}
              alt="profile"
              className="w-24 h-24 rounded-full object-cover border-2 border-purple-500"
            />
          ) : (
            <div className="w-24 h-24 rounded-full bg-purple-700 flex items-center justify-center text-white text-3xl font-bold uppercase">
              {profileUser.username?.[0] || "?"}
            </div>
          )}
          <h1 className="text-3xl font-bold text-purple-400">{profileUser.username}</h1>
        </div>

        {currentUser?.uid !== profileUser.uid && (
          <button
            onClick={toggleFollow}
            className={`px-6 py-2 rounded-full font-semibold transition-all duration-300 ${
              isFollowing
                ? "bg-purple-500 hover:bg-purple-600"
                : "bg-white text-purple-700 hover:bg-purple-100"
            }`}
          >
            {isFollowing ? "Unfollow" : "Follow"}
          </button>
        )}

        <div className="mt-6 bg-white/10 p-6 rounded-2xl shadow-md w-full max-w-xl text-left">
          <h2 className="text-xl font-semibold mb-3">Followers:</h2>
          <ul className="space-y-2">
            {profileUser.followers?.length > 0 ? (
              profileUser.followers.map((f) => (
                <li key={f.uid}>
                  <Link to={`/profile/${f.uid}`} className="hover:underline flex items-center gap-2">
                    {f.pfp ? (
                      <img src={f.pfp} className="w-6 h-6 rounded-full" alt={f.username} />
                    ) : (
                      <div className="w-6 h-6 rounded-full bg-purple-700 flex items-center justify-center text-white text-xs">
                        {f.username[0]?.toUpperCase()}
                      </div>
                    )}
                    {f.username}
                  </Link>
                </li>
              ))
            ) : (
              <p className="opacity-50">No followers yet.</p>
            )}
          </ul>

          <h2 className="text-xl font-semibold mt-6 mb-3">Following:</h2>
          <ul className="space-y-2">
            {profileUser.following?.length > 0 ? (
              profileUser.following.map((f) => (
                <li key={f.uid}>
                  <Link to={`/profile/${f.uid}`} className="hover:underline flex items-center gap-2">
                    {f.pfp ? (
                      <img src={f.pfp} className="w-6 h-6 rounded-full" alt={f.username} />
                    ) : (
                      <div className="w-6 h-6 rounded-full bg-purple-700 flex items-center justify-center text-white text-xs">
                        {f.username[0]?.toUpperCase()}
                      </div>
                    )}
                    {f.username}
                  </Link>
                </li>
              ))
            ) : (
              <p className="opacity-50">Not following anyone.</p>
            )}
          </ul>
        </div>
      </div>
    </div>
  );
}
