import { useState } from "react";
import "../styles/Register.css";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export default function Login() {
  const [identifier, setIdentifier] = useState("");
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState("");
  const navigate = useNavigate();

  const { login } = useAuth();

  const handleSubmit = async (e) => {
    e.preventDefault();

    const res = await fetch("http://localhost:3000/auth/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ identifier, password })
    });

    const data = await res.json();

    if (res.ok) {
      console.log("JWT:", data.token);
      sessionStorage.setItem("token", data.token);

      // update user context upon login
      login(data.user);

      navigate("/conversations");
    } else {
      setMessage(data.error);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="register-form">
      <h2>Login to account</h2>

      <input
        type="text"
        placeholder="Username or email"
        value={identifier}
        onChange={(e) => setIdentifier(e.target.value)}
      />

      <input
        type="password"
        placeholder="Password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
      />

      <button type="submit">Login</button>

      {message && <p>{message}</p>}
    </form>
  );
}
