import { useEffect, useState } from "react";
import { authFetch } from "../services/api";
import { useNavigate } from "react-router-dom";

export default function UserBar() {
  const [username, setUsername] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    authFetch("/me")
      .then(res => res.json())
      .then(data => setUsername(data.username));
  }, []);

  const logout = () => {
    sessionStorage.removeItem("token");
    navigate("/login");
  };

  return (
    <div style={{
      display: "flex",
      justifyContent: "space-between",
      padding: "8px",
      borderBottom: "1px solid #ccc"
    }}>
      <div><b>Chat App</b></div>
      <div>
        Logged in as <b>{username}</b>{" "}
        <button onClick={logout}>Logout</button>
      </div>
    </div>
  );
}
