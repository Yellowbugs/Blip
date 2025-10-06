import React, { createContext, useContext, useState } from 'react';
import bcrypt from 'bcryptjs';

const AuthContext = createContext();
export function useAuth(){ return useContext(AuthContext); }

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => {
    try { return JSON.parse(localStorage.getItem('dc_user')); } catch { return null; }
  });

  function register(email, password, displayName){
    const hashed = bcrypt.hashSync(password, 10);
    const u = { email, hashed, displayName: displayName || email.split('@')[0], id: Date.now() };
    localStorage.setItem('dc_user', JSON.stringify(u));
    setUser(u);
  }

  function login(email, password){
    const stored = JSON.parse(localStorage.getItem('dc_user'));
    if(stored && bcrypt.compareSync(password, stored.hashed)) { setUser(stored); return true; }
    return false;
  }

  function logout(){ localStorage.removeItem('dc_user'); setUser(null); }

  return (
    <AuthContext.Provider value={{ user, register, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}
