import UserBar from "../components/UserBar";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export default function Home() {
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();

  return (
    <div className="page">
      <div className="home-content">
        <h1>Real-Time Chat</h1>

        <p>
          Secure one-to-one messaging with real-time updates.
        </p>

        {isAuthenticated ? (
          <button
            className="primary-btn"
            onClick={() => navigate("/conversations")}
          >
            Go to Conversations
          </button>
        ) : (
          <div className="home-actions">
            <button
              className="primary-btn"
              onClick={() => navigate("/login")}
            >
              Login
            </button>

            <button
              className="secondary-btn"
              onClick={() => navigate("/register")}
            >
              Create Account
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
