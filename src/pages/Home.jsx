import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import GlassCard from '../components/GlassCard';
import Comment from '../components/Comment';


export default function Home() {
const { user } = useAuth();
const mockPhoto = { id:1, url:'https://picsum.photos/800/600?random=1', title:'Photo of the Day' };
const [comments, setComments] = useState([]);
const [text, setText] = useState('');
const [replyTo, setReplyTo] = useState(null);


function postComment(){
if(!text) return;
if(replyTo){
setComments(prev => prev.map(c => c.id===replyTo ? {...c, replies:[...(c.replies||[]), {id:Date.now().toString(), author:user?.displayName||'You', text}]} : c));
setReplyTo(null);
} else {
setComments(prev => [{id:Date.now().toString(), author:user?.displayName||'You', text, likes:0, dislikes:0, replies:[]}, ...prev]);
}
setText('');
}


function like(id){ setComments(prev=>prev.map(c=>c.id===id ? {...c, likes:c.likes+1} : c)); }
function dislike(id){ setComments(prev=>prev.map(c=>c.id===id ? {...c, dislikes:c.dislikes+1} : c)); }
function replyClick(id){ setReplyTo(id); }


return (
<div className="min-h-screen p-4 flex flex-col items-center relative">
<GlassCard className="max-w-3xl w-full mt-20 mb-4">
<img src={mockPhoto.url} alt={mockPhoto.title} className="w-full rounded-xl mb-2" />
<h2 className="text-xl font-semibold text-purple-400">{mockPhoto.title}</h2>
</GlassCard>


<div className="relative w-full max-w-3xl">
<GlassCard className="w-full p-4">
<h3 className="text-lg font-bold text-purple-400 mb-2">Comments</h3>
{user ? (
<>
<div className="space-y-2">
{comments.map(c => <Comment key={c.id} c={c} onLike={like} onDislike={dislike} onReplyClick={replyClick} />)}
</div>
<div className="mt-3 flex gap-2">
<input value={text} onChange={e=>setText(e.target.value)} placeholder={replyTo ? 'Reply...' : 'Write a comment...'} className="flex-1 p-2 rounded-md bg-transparent border border-white/10" />
<button onClick={postComment} className="bg-gradient-to-r from-purple-600 to-indigo-600 px-4 py-2 rounded-xl">Post</button>
</div>
</>
) : (
<div className="absolute inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center rounded-xl">
<p className="text-white text-center p-4">Sign up or log in to view and post comments.</p>
</div>
)}
</GlassCard>
</div>
</div>
);
}