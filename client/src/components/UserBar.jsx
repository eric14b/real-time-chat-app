import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import "../styles/UserBar.css"

export default function UserBar() {
  const navigate = useNavigate();
  const { user, isAuthenticated, logout } = useAuth();

  const handleLogout = () => {
    logout();
    navigate("/")
  }
  
  return (
  <div className="userbar">
    <div className="userbar-left">
      <span className="app-name">YapAway</span>
    </div>

    <div className="userbar-right">
      {isAuthenticated ? (
        <>
          <img
            src={user.avatarUrl || "/default_profile.jpg"}
            alt={user.usename}
            className="avatar"
          />
          <span className="username">{user.username}</span>
          <button onClick={handleLogout}>Logout</button>
        </>
      ) : (
        <>
          <button onClick={() => navigate("/login")}>Login</button>
          <button onClick={() => navigate("/register")}>Register</button>
        </>
      )}
    </div>
  </div>
);

}

