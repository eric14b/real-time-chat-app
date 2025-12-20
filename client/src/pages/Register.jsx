import { useState } from 'react';
import "../styles/Register.css";
import { useNavigate } from 'react-router-dom';



export default function Register() {
    const [username, setUsername] = useState("");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [message, setMessage] = useState("");
  const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();

        const res = await fetch("http://localhost:3000/auth/register", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ username, email, password })
        });

        const data = await res.json();
        if (res.ok) {
          sessionsStorage.setItem("token", data.token);
          navigate("/conversations");
        } else {
          setMessage(data.error);
        }
    };

    return (
        <form onSubmit={handleSubmit} className='register-form'>
            <h2>Register account</h2>

            <input
                type="text"
                placeholder="Username"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
            />

            <input
                type="email"
                placeholder="Email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
            />

            <input
                type="password"
                placeholder="Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
            />

            <button type="submit">Register</button>

            {message && <p>{message}</p>}
        </form>
    )
}