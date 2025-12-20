import { useEffect, useState } from "react";
import { authFetch } from "../services/api";
import { io } from "socket.io-client";
import { useParams, useNavigate } from "react-router-dom";

// Backend port
const socket = io("http://localhost:3000");

export default function Chat() {
  const { conversationId } = useParams();
  const navigate = useNavigate();
  const [participantId, setParticipantId] = useState("");
  const [text, setText] = useState("");
  const [messages, setMessages] = useState([]);
  const [curUsername, setCurUsername] = useState("");

  // Fetch and update currentUsername state
  useEffect(() => {
    authFetch("/me")
      .then(res => res.json())
      .then(data => setCurUsername(data.username));
  }, []);

  // Load message history (REST)
  useEffect(() => {
    if (!conversationId) return;
    loadMessages();
  }, [conversationId]);

  // Real-time message updates (Socket.io)
  useEffect(() => {
    if (!conversationId) return;

    loadMessages();
    socket.emit("joinConversation", conversationId);

    socket.on("newMessage", (message) => {
      setMessages((prev) => [...prev, message]);
    });

    return () => {
      socket.off("newMessage");
    };
  }, [conversationId]);

  // create or get conversation
  const createConversation = async () => {
    const res = await authFetch("/conversations", {
      method: "POST",
      body: JSON.stringify({ participantId })
    });

    const convo = await res.json();
    navigate(`/chat/${convo._id}`);
  };

  // send message
  const sendMessage = async () => {
    if (!text) return;

    await authFetch("/messages", {
      method: "POST",
      body: JSON.stringify({ conversationId, text })
    });

    setText("");
    loadMessages();
  };

  // load messages
  const loadMessages = async () => {
    const res = await authFetch(`/messages/${conversationId}`);
    const data = await res.json();
    setMessages(data);
  };

  return (
    <div>
      <h2>Chat</h2>

      {!conversationId && (
        <>
          <input
            placeholder="Other user's username"
            value={participantId}
            onChange={(e) => setParticipantId(e.target.value)}
          />
          <button onClick={createConversation}>Start Chat</button>
        </>
      )}

      {conversationId && (
        <>
          <div>
            {messages.map((m) => (
              <div key={m._id}>
                <span style={{ marginLeft: "8px", color: "gray", fontSize: "0.8em" }}>
                  {new Date(m.createdAt).toLocaleTimeString()}
                </span>
                <b>
                  {m.senderId.username === curUsername
                    ? "You"
                    : m.senderId.username}
                </b>
                : {m.text}
              </div>
            ))}
          </div>

          <input
            placeholder="Message"
            value={text}
            onChange={(e) => setText(e.target.value)}
          />
          <button onClick={sendMessage}>Send</button>
        </>
      )}
    </div>
  );
}
