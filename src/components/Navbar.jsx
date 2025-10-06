// src/components/Navbar.jsx (with loading state)
import { useState, useEffect } from "react";
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import LoadingOverlay from '../components/LoadingOverlay';


export default function Navbar() {
      const { user, logout } = useAuth();
      const navigate = useNavigate();
      const [loading, setLoading] = useState(false);
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
        setLoading(true);
        await new Promise(res => setTimeout(res, 500));
        logout();
        setLoading(false);
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
        <img alt="logo" src="./assests/logo.png" class="h-20 w-20"></img>
       Blip 
        </Link>
        <div className="flex gap-3 items-center">
          <Link to="/" className="text-base text-slate-300">Home</Link>
          <Link to="/friends" className="text-base text-slate-300">Friends</Link>
          <Link to="/profile" className="text-base text-slate-300">Profile</Link>
              {loading && <LoadingOverlay />}
              {user ? (
              <>
              <span className="text-slate-300 text-lg">{user.displayName}</span>
              <button onClick={handleLogout} disabled={loading} className="text-sm text-white bg-purple-600 px-3 py-1 rounded-lg hover:bg-purple-700 transition">Logout</button>          </>
              ) : (
              <>
              <Link to="/login" className="text-sm text-white bg-purple-600 px-3 py-1 rounded-lg hover:bg-purple-700 transition">Login/Register</Link>
              </>
              )}
        </div>
      </div>
    </nav>
  );
}