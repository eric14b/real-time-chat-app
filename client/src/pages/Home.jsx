import { Link } from "react-router-dom";

export default function Home() {
  return (
    <div>
      <h1>Real-Time Chat App</h1>
      <p>Simple chat with real-time messaging.</p>

      <Link to="/register">Register</Link>{" | "}
      <Link to="/login">Login</Link>
    </div>
  );
}
