import { useEffect, useState } from "react";
import { authFetch } from "../services/api";

export default function Me() {
  const [data, setData] = useState(null);

  useEffect(() => {
    authFetch("/me")
      .then(res => res.json())
      .then(setData);
  }, []);

  return (
    <div>
      <h2>/me</h2>
      <pre>{JSON.stringify(data, null, 2)}</pre>
    </div>
  );
}
