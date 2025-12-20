import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { authFetch } from "../services/api";

export default function Conversations() {
  const [conversations, setConversations] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    authFetch("/conversations")
      .then(res => res.json())
      .then(setConversations);
  }, []);

  return (
    <div>
      <h2>Your Conversations</h2>

      {conversations.map((c) => (
        <div key={c._id}>
          <button onClick={() => navigate(`/chat/${c._id}`)}>
            Open Chat
          </button>
        </div>
      ))}
    </div>
  );
}
