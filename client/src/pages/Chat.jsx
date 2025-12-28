import { useEffect, useState } from "react";
import { authFetch } from "../services/api";
import { io } from "socket.io-client";
import { useParams, useNavigate } from "react-router-dom";
import "../styles/Chat.css"
import { useAuth } from "../context/AuthContext";


// Backend port
const socket = io("http://localhost:3000");

export default function Chat() {
  const { conversationId } = useParams();
  const navigate = useNavigate();

  const [text, setText] = useState("");
  const [messages, setMessages] = useState([]);
  const [curUsername, setCurUsername] = useState("");
  const { user } = useAuth();

  // redirect if no conversationId
  useEffect(() => {
    if (!conversationId) {
      navigate("/conversations");
    }
  }, [conversationId, navigate]);

  useEffect(() => {
    if (user) {
      setCurUsername(user.username);
    }
  }, [user]);

  // load message history (REST)
  useEffect(() => {
    if (!conversationId) return;
    loadMessages();
  }, [conversationId]);

  // real-time message updates (Socket.io)
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

      <div className="chat-messages">
        {messages.map((m) => {
          const isMe = m.senderId.username === curUsername;

          return (
            <div
              key={m._id}
              className={`message-row ${isMe ? "me" : "them"}`}
            >
              <div className="message-content">
                <div className="message-meta">
                  <span className="message-sender">
                    {isMe ? "You" : m.senderId.username}
                  </span>
                  <span className="message-time">
                    {new Date(m.createdAt).toLocaleTimeString()}
                  </span>
                </div>

                <div className="message-bubble">
                  <div className="message-text">{m.text}</div>
                </div>
              </div>
            </div>
          );
        })}
      </div>


      <input
        placeholder="Message"
        value={text}
        onChange={(e) => setText(e.target.value)}
      />
      <button onClick={sendMessage}>Send</button>
    </div>
  );
}
