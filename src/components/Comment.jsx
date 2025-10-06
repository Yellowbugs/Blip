import React from 'react';
import Reply from './Reply';
export default function Comment({ c, onLike, onDislike, onReplyClick }) {
  return (
    <div className="py-3 border-b border-white/6">
      <div className="flex gap-3">
        <div className="w-10 h-10 rounded-full bg-purple-900 flex items-center justify-center text-white">{c.author[0]}</div>
        <div className="flex-1">
          <div className="flex justify-between items-center">
            <div>
              <div className="text-sm font-semibold text-slate-100">{c.author}</div>
              <div className="text-sm text-slate-300">{c.text}</div>
            </div>
            <div className="flex gap-2 items-center text-xs text-slate-300">
              <button onClick={()=>onLike(c.id)}>👍 {c.likes}</button>
              <button onClick={()=>onDislike(c.id)}>👎 {c.dislikes}</button>
            </div>
          </div>
          {c.replies && c.replies.map(r => <Reply key={r.id} reply={r} />)}
          <div className="mt-2 text-sm">
            <button onClick={()=>onReplyClick(c.id)} className="text-primary hover:underline">Reply</button>
          </div>
        </div>
      </div>
    </div>
  );
}