const API_URL = "http://localhost:3000";

// Sends JWT in the HTTP Authorization header.
export const authFetch = (url, options = {}) => {
  const token = localStorage.getItem("token");

  return fetch(API_URL + url, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
      ...options.headers
    }
  });
};
