import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { authFetch } from "../services/api";
import { useAuth } from "../context/AuthContext";
import "../styles/Conversations.css"

export default function Conversations() {
  const [conversations, setConversations] = useState([]);
  const [newUsername, setNewUsername] = useState("");

  // get current user from authContext
  const { user, loading} = useAuth();
  if (loading) return null;
  const curUsername = user?.username;

  const navigate = useNavigate();

  // my conversations (message history)
  useEffect(() => {
    authFetch("/conversations")
      .then(res => res.json())
      .then(setConversations);
  }, []);

  const createConversation = async () => {
    if (!newUsername) return;

    const res = await authFetch("/conversations", {
      method: "POST",
      body: JSON.stringify({ otherUsername: newUsername })
    });

    const convo = await res.json();
    if (!res.ok) {
      alert(convo.error);
      return;
    }

    navigate(`/chat/${convo._id}`);
  };

  return (
    <div>
      <h2>Message history</h2>

      {/* existing conversations */}
      {conversations.map((c) => {
        const otherUser = c.participants.find(
          (p) => p.username !== curUsername
        );

        return (
          <div 
            key={c._id}
            className="convo-row"
            onClick={() => navigate(`/chat/${c._id}`)}
          >
            <img
              src={otherUser?.avatarUrl || "/default_profile.jpg"}
              alt={otherUser?.username}
              className="avatar"
            />
            <span className="convo-username">
              {otherUser?.username}
            </span>
          </div>
        );
      })}

      <hr/>

      {/* create new conversation */}
      <h3>Start new conversation</h3>
      <input
        placeholder="Invite username"
        value={newUsername}
        onChange={(e) => setNewUsername(e.target.value)}
        />
      <button onClick={createConversation}>Start Conversation</button>
    </div>
  );
}
