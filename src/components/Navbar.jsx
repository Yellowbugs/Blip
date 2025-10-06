// src/components/Navbar.jsx (with loading state)
import { useState, useEffect } from "react";
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function Navbar() {
      const { user, logout } = useAuth();
      const navigate = useNavigate();
      const [isScrolled, setIsScrolled] = useState(false);

      useEffect(() => {
        const handleScroll = () => {
          if (window.scrollY > 0) {
            setIsScrolled(true);
          } else {
            setIsScrolled(false);
          }
        };
    
        window.addEventListener("scroll", handleScroll);
        return () => window.removeEventListener("scroll", handleScroll);
      }, []);


      async function handleLogout() {
        await new Promise(res => setTimeout(res, 500));
        logout();
        navigate('/login');
      }
  return (
    <nav
      className={`fixed top-0 w-full z-50 transition-all duration-300 ${
          isScrolled
            ? "bg-transparent backdrop-blur-none"
            : "bg-white/20 backdrop-blur-md"
        }`}
      >
      <div className="max-w-6xl mx-auto flex justify-between items-center">
        <Link to="/" className="text-xl font-bold text-primary flex items-center">
        <img alt="logo" src="./assests/logo.png" className="h-20 w-20"></img>
       Blip 
        </Link>
        <div className="flex gap-3 items-center">
          <Link to="/" className="text-base text-slate-300">Home</Link>
          <Link to="/following" className="text-base text-slate-300">Following</Link>
          {user ? (
          <div className="flex items-center gap-3">
            <Link to="/profile" className="flex items-center gap-3">
            {user.pfp ? (
              <img
                src={user.pfp}
                alt="profile"
                className="w-9 h-9 rounded-full object-cover border border-purple-500"
              />
            ) : (
              <div className="w-9 h-9 rounded-full bg-purple-700 flex items-center justify-center text-white font-semibold uppercase">
                {user.username?.[0] || "?"}
              </div>
            )}
            <span className="text-lg font-bold text-purple-400">{user.username}</span>
            </Link>
            <button
              onClick={handleLogout}
              className="text-sm text-white bg-purple-600 px-3 py-1 rounded-lg hover:bg-purple-700 transition"
            >
              Logout
            </button>
          </div>
        ) : (
          <div>
            <Link
              to="/login"
              className="text-sm text-white bg-purple-600 px-3 py-1 rounded-lg hover:bg-purple-700 transition"
            >
              Login/Register
            </Link>
          </div>
        )}

        </div>
      </div>
    </nav>
  );
}