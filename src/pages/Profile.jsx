// src/pages/Profile.jsx
import React from 'react';
import { useAuth } from '../context/AuthContext';
import GlassCard from '../components/GlassCard';

export default function Profile() {
  const { user, logout } = useAuth();

  return (
    <div className="min-h-screen p-4 flex justify-center">
      <GlassCard className="w-full max-w-md mt-20 p-6">
        <h2 className="text-2xl font-bold text-purple-400 mb-2">Profile</h2>
        <p className="text-slate-300 mb-2"><strong>Name:</strong> {user?.displayName}</p>
        <p className="text-slate-300 mb-2"><strong>Email:</strong> {user?.email}</p>
        <p className="text-slate-300 mb-2"><strong>Posts:</strong> N/A</p>
        <button onClick={logout} className="mt-4 bg-gradient-to-r from-purple-600 to-indigo-600 px-4 py-2 rounded-xl w-full">Logout</button>
      </GlassCard>
    </div>
  );
}