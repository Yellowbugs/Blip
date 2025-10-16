import React, { useEffect, useState } from "react";
import {
  collection,
  query,
  getDocs,
  updateDoc,
  where,
  doc,
  arrayUnion,
} from "firebase/firestore";
import { db } from "../firebase";
import GlassCard from "../components/GlassCard";
import { useNavigate } from "react-router-dom";

// Helper — recursively insert a nested reply
function addNestedReply(comments, parentId, newReply) {
  return comments.map((c) => {
    if (c.id === parentId) {
      return { ...c, replies: [...(c.replies || []), newReply] };
    } else if (c.replies?.length) {
      return { ...c, replies: addNestedReply(c.replies, parentId, newReply) };
    } else {
      return c;
    }
  });
}

export default function Home({ currentUser }) {
  const [photo, setPhoto] = useState(null);
  const [commentText, setCommentText] = useState("");
  const [replyText, setReplyText] = useState("");
  const [activeReply, setActiveReply] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  // Fetch the daily photo
  useEffect(() => {
    const fetchPhoto = async () => {
      setLoading(true);
      try {
        const q = query(collection(db, "photos"), where("day", "==", 0));
        const snap = await getDocs(q);
        if (!snap.empty) {
          setPhoto({ id: snap.docs[0].id, ...snap.docs[0].data() });
        }
      } catch (err) {
        console.error("Error fetching photo:", err);
      }
      setLoading(false);
    };
    fetchPhoto();
  }, []);

  // Add new comment
  const handleAddComment = async () => {
    if (!photo || !commentText.trim() || !currentUser) return;

    const comment = {
      id: Date.now().toString(),
      text: commentText.trim(),
      userId: currentUser.uid,
      username: currentUser.username,
      pfp: currentUser.pfp || "",
      likes: [],
      dislikes: [],
      replies: [],
      createdAt: Date.now(),
    };

    try {
      await updateDoc(doc(db, "photos", photo.id), {
        comments: arrayUnion(comment),
      });
      setPhoto((prev) => ({
        ...prev,
        comments: [...(prev.comments || []), comment],
      }));
      setCommentText("");
    } catch (err) {
      console.error("Error adding comment:", err);
    }
  };

  // Add reply (supports nested)
  const handleAddReply = async (parentId) => {
    if (!photo || !replyText.trim() || !currentUser) return;

    const reply = {
      id: Date.now().toString(),
      text: replyText.trim(),
      userId: currentUser.uid,
      username: currentUser.username,
      pfp: currentUser.pfp || "",
      likes: [],
      dislikes: [],
      replies: [],
      createdAt: Date.now(),
    };

    const updatedComments = addNestedReply(photo.comments, parentId, reply);

    try {
      await updateDoc(doc(db, "photos", photo.id), { comments: updatedComments });
      setPhoto((prev) => ({ ...prev, comments: updatedComments }));
      setReplyText("");
      setActiveReply(null);
    } catch (err) {
      console.error("Error adding reply:", err);
    }
  };

  // Like / dislike toggle
  const handleReaction = async (commentId, type) => {
    const updateReactions = (comments) =>
      comments.map((c) => {
        if (c.id === commentId) {
          let likes = c.likes || [];
          let dislikes = c.dislikes || [];
          if (type === "like") {
            if (likes.includes(currentUser.uid)) {
              likes = likes.filter((id) => id !== currentUser.uid);
            } else {
              likes.push(currentUser.uid);
              dislikes = dislikes.filter((id) => id !== currentUser.uid);
            }
          } else {
            if (dislikes.includes(currentUser.uid)) {
              dislikes = dislikes.filter((id) => id !== currentUser.uid);
            } else {
              dislikes.push(currentUser.uid);
              likes = likes.filter((id) => id !== currentUser.uid);
            }
          }
          return { ...c, likes, dislikes };
        } else if (c.replies?.length) {
          return { ...c, replies: updateReactions(c.replies) };
        }
        return c;
      });

    const updatedComments = updateReactions(photo.comments);
    await updateDoc(doc(db, "photos", photo.id), { comments: updatedComments });
    setPhoto((prev) => ({ ...prev, comments: updatedComments }));
  };

  if (loading) return <div className="text-center mt-20">Loading...</div>;
  if (!photo) return <div className="text-center mt-20">No photo found.</div>;

  // Recursive renderer for nested comments
  const renderComments = (comments, depth = 0) =>
    comments.map((c) => (
      <div key={c.id} className={`mt-3 ml-${depth * 3} bg-white/5 rounded-xl p-3`}>
        <div className="flex items-start gap-2">
          {c.pfp ? (
            <img src={c.pfp} alt={c.username} className="w-8 h-8 rounded-full" />
          ) : (
            <div className="w-8 h-8 bg-purple-700 rounded-full flex items-center justify-center text-white font-bold">
              {c.username?.[0]?.toUpperCase()}
            </div>
          )}
          <div className="flex-1">
            <span className="font-semibold text-purple-300" onClick={() => navigate(`/profile/${c.id}`)}  >{c.username}</span>
            <p className="text-white text-sm">{c.text}</p>

            <div className="flex gap-3 mt-1 text-sm text-gray-400">
              <button
                onClick={() => handleReaction(c.id, "like")}
                className={`hover:text-purple-400 ${
                  c.likes?.includes(currentUser?.uid) ? "text-purple-400" : ""
                }`}
              >
                👍 {c.likes?.length || 0}
              </button>
              <button
                onClick={() => handleReaction(c.id, "dislike")}
                className={`hover:text-red-400 ${
                  c.dislikes?.includes(currentUser?.uid) ? "text-red-400" : ""
                }`}
              >
                👎 {c.dislikes?.length || 0}
              </button>
              <button
                onClick={() =>
                  setActiveReply(activeReply === c.id ? null : c.id)
                }
                className="hover:text-purple-300"
              >
                💬 Reply
              </button>
            </div>

            {activeReply === c.id && (
              <div className="flex gap-2 mt-2 ml-8">
                <input
                  type="text"
                  placeholder="Write a reply..."
                  value={replyText}
                  onChange={(e) => setReplyText(e.target.value)}
                  className="flex-1 p-1 rounded bg-white/10 text-white text-sm"
                />
                <button
                  onClick={() => handleAddReply(c.id)}
                  className="bg-purple-600 px-3 py-1 rounded-lg text-sm"
                >
                  Send
                </button>
              </div>
            )}

            {c.replies?.length > 0 && (
              <div className="ml-8 mt-2 border-l border-white/10 pl-3">
                {renderComments(c.replies, depth + 1)}
              </div>
            )}
          </div>
        </div>
      </div>
    ));

  return (
    <div className="flex flex-col items-center p-4 mt-20">
      <GlassCard className="max-w-lg w-full p-4">
        <img src={photo.url} alt="Daily" className="w-full rounded-2xl mb-4" />

        <h2 className="text-purple-400 font-semibold text-lg mb-3">Comments</h2>

        <div className="max-h-[500px] overflow-y-auto space-y-3">
          {photo.comments?.length ? (
            renderComments(photo.comments)
          ) : (
            <p className="text-gray-400 text-sm">No comments yet — be first!</p>
          )}
        </div>

        {currentUser && (
          <div className="flex gap-2 mt-4">
            <input
              type="text"
              placeholder="Add a comment..."
              value={commentText}
              onChange={(e) => setCommentText(e.target.value)}
              className="flex-1 p-2 rounded bg-white/10 text-white"
            />
            <button
              onClick={handleAddComment}
              className="bg-purple-600 px-4 py-2 rounded-xl hover:bg-purple-700"
            >
              Post
            </button>
          </div>
        )}
      </GlassCard>
    </div>
  );
}
