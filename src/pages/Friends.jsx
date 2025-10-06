import React, { useState } from 'react';
import GlassCard from '../components/GlassCard';
import { useAuth } from '../context/AuthContext';


export default function Friends() {
const { user } = useAuth();
const [friends, setFriends] = useState([{name:'Alice'}, {name:'Bob'}]);
const [newFriend, setNewFriend] = useState('');


function addFriend(){
if(!newFriend) return;
setFriends(prev => [...prev, {name:newFriend}]);
setNewFriend('');
}


return (
<div className="min-h-screen p-4 flex flex-col items-center relative">
<GlassCard className="w-full max-w-md p-6 mt-20 relative">
<h2 className="text-2xl font-bold text-purple-400 mb-4">Friends</h2>
{user ? (
<>
<div className="space-y-2">
{friends.map((f,i) => <div key={i} className="text-slate-200">{f.name}</div>)}
</div>
<div className="mt-4 flex gap-2">
<input value={newFriend} onChange={e => setNewFriend(e.target.value)} placeholder="Add friend" className="flex-1 p-2 rounded-md bg-transparent border border-white/10" />
<button onClick={addFriend} className="bg-gradient-to-r from-purple-600 to-indigo-600 px-4 py-2 rounded-xl">Add</button>
</div>
</>
) : (
<div className="absolute inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center rounded-xl">
<p className="text-white text-center p-4">Sign up or log in to see friends.</p>
</div>
)}
</GlassCard>
</div>
);
}