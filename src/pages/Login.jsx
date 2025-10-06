import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import GlassCard from '../components/GlassCard';
import LoadingOverlay from '../components/LoadingOverlay';
import { load } from 'three/examples/jsm/libs/opentype.module.js';

export default function Login() {
  const { user, login, register } = useAuth();
  const [mode, setMode] = useState('login');
  const [email, setEmail] = useState('');
  const [username, setUsername] = useState('');
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [password, setPassword] = useState('');
  const [pfp, setPfp] = useState('');
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);

  if(user) navigate('/');
  async function submit(e) {
    e.preventDefault();
    setLoading(true);
    try {
      if(mode==='register'){
        await register({ email, password, username, firstName, lastName, pfp});
        login(email, password);
      }
      else if(!login(email, password)) alert('Invalid credentials');
    } finally {
      setLoading(false);
    }
  }
  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <div className="w-full max-w-md">
      {loading && <LoadingOverlay />}
        <GlassCard>
          <h1 className="text-2xl text-primary font-bold mb-2 text-center">Blip</h1>
          <p className="text-slate-300 mb-4 text-center">One daily photo. Everyone captions.</p>
          <form onSubmit={submit} className="space-y-3">
            {mode==='register' && <input value={username} onChange={e=>setUsername(e.target.value)} placeholder="Username" className="w-full p-2 rounded-md bg-transparent border border-white/10" />}
            {mode==='register' && <input value={firstName} onChange={e=>setFirstName(e.target.value)} placeholder="First Name" className="w-full p-2 rounded-md bg-transparent border border-white/10" />}
            {mode==='register' && <input value={lastName} onChange={e=>setLastName(e.target.value)} placeholder="Last Name" className="w-full p-2 rounded-md bg-transparent border border-white/10" />}
            <input value={email} onChange={e=>setEmail(e.target.value)} placeholder="Email" className="w-full p-2 rounded-md bg-transparent border border-white/10" />
            <input value={password} onChange={e=>setPassword(e.target.value)} type="password" placeholder="Password" className="w-full p-2 rounded-md bg-transparent border border-white/10" />
            <div className="flex gap-2">
              <button className="flex-1 bg-gradient-to-r from-purple-600 to-indigo-600 px-4 py-2 rounded-xl">{mode==='register' ? 'Create Account' : 'Login'}</button>
              <button type="button" onClick={()=>setMode(mode==='login'?'register':'login')} className="px-3 py-2 border rounded-xl">{mode==='login' ? 'Register' : 'Login'}</button>
            </div>
          </form>
        </GlassCard>
      </div>
    </div>
  );
}

