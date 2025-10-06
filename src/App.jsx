import React, { useState } from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { AuthProvider, useAuth } from "./context/AuthContext";

import Login from "./pages/Login";
import Home from "./pages/Home";
import UserProfile from "./pages/UserProfile";
import Profile from "./pages/Profile";
import Following from "./pages/Following";
import Navbar from './components/Navbar';

export default function App() {
  return (
    <AuthProvider>
      <AppRoutes />
    </AuthProvider>
  );
}

function AppRoutes() {
  const { user: currentUser, logout } = useAuth();
  const [users, setUsers] = useState([]);

  return (
    <Router>
      <Navbar></Navbar>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route
          path="/profile"
          element={
            <UserProfile
              currentUser={currentUser}
              users={users}
              setUsers={setUsers}
              logout={logout}
            />
          }
        />
        <Route
          path="/profile/:uid"
          element={
            <Profile
              currentUser={currentUser}
              users={users}
              setUsers={setUsers}
            />
          }
        />
        <Route
          path="/Following"
          element={
            <Following
              currentUser={currentUser}
              users={users}
              setUsers={setUsers}
            />
          }
        />
        <Route path="/" element={<Home users={users} />} />
      </Routes>
    </Router>
  );
}
