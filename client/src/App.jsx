import { Routes, Route } from 'react-router-dom';

import Register from "./pages/Register";
import Login from "./pages/Login";
import Me from "./pages/Me";
import Chat from "./pages/Chat";
import Conversations from "./pages/Conversations";
import './App.css';
import Home from "./pages/Home";
import UserBar from "./components/UserBar";

export default function App() {
  return (
    <div className="app-layout">
      <UserBar />

      <main className="app-main">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/register" element={<Register />} />
          <Route path="/login" element={<Login />} />
          <Route path="/me" element={<Me />} />
          <Route path="/chat" element={<Chat />} />
          <Route path="/chat/:conversationId" element={<Chat />} />
          <Route path="/conversations" element={<Conversations />} />
        </Routes>
      </main>
    </div>
  );
}

