import { createContext, useContext, useState, useEffect } from "react";

/* Single source of user context truth
*/
const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check if a JWT exists from a previous login.
    // Token presence means "possibly authenticated".
    const token = sessionStorage.getItem("token");

    // If no token exists, the user is definitely logged out.
    // We can safely stop loading.
    if (!token) {
      setLoading(false);
      return;
    }

    // If a token exists, we must verify it with the backend
    // and retrieve the current user's identity.
    async function hydrateUser() {
      try {
        // Ask the backend: "Who is this token for?"
        const res = await authFetch("/me");

        if (res.ok) {
          // Backend confirmed the token is valid
          // and returned safe user information.
          const data = await res.json();

          // Store the user in React state.
          // This triggers a re-render of the entire app.
          setUser({
            id: data.userId,
            username: data.username,
            email: data.email
          });
        } else {
          // Token is invalid or expired.
          // Remove it and treat the user as logged out.
          sessionStorage.removeItem("token");
          setUser(null);
        }
      } catch {
        setUser(null);
      } finally {
        setLoading(false);
      }
    }

    // Run the hydration process once when the app loads.
    hydrateUser();
  }, []);


  const login = (userData) => {
    setUser(userData);
  };

  const logout = () => {
    sessionStorage.removeItem("token")
    setUser(null);
  };

  return (
    <AuthContext.Provider
      value={{ user, isAuthenticated: !!user, login, logout, loading }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
