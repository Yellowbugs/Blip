import React from 'react';
export default function Reply({ reply }) {
  return (
    <div className="pl-4 mt-2">
      <div className="flex items-start gap-3 text-sm">
        <div className="w-8 h-8 rounded-full bg-purple-800 flex items-center justify-center text-white">{reply.author[0]}</div>
        <div>
          <div className="text-slate-200 font-medium">{reply.author}</div>
          <div className="text-slate-300">{reply.text}</div>
        </div>
      </div>
    </div>
  );
}