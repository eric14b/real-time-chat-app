import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { authFetch } from "../services/api";
import UserBar from "../components/UserBar"

export default function Conversations() {
  const [conversations, setConversations] = useState([]);
  const [curUsername, setCurUsername] = useState("");
  const [newUsername, setNewUsername] = useState("");
  const navigate = useNavigate();

  // Authenticate and set current username
  useEffect(() => {
    authFetch("/me")
      .then(res => res.json())
      .then(data => setCurUsername(data.username));
  }, []);

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
      <UserBar />
      <h2>Message history</h2>

      {/* existing conversations */}
      {conversations.map((c) => {
        const otherUser = c.participants.find(
          (p) => p.username !== curUsername
        );

        return (
          <div key={c._id}>
            <button onClick={() => navigate(`/chat/${c._id}`)}>
              {otherUser?.username}
            </button>
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
