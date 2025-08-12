import { createContext, useContext, useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";

// Use VITE_API_BASE_URL from environment variables
const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL || "http://localhost:8081/api";

export const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null); // { email, role }
  const [loading, setLoading] = useState(true);
  const tokenCheckInterval = useRef(null);
  const lastActivityTime = useRef(Date.now());
  const activityListener = useRef(null);

  // Update last activity time on user interactions
  useEffect(() => {
    const updateActivity = () => {
      lastActivityTime.current = Date.now();
    };

    const events = [
      "mousedown",
      "mousemove",
      "keypress",
      "scroll",
      "touchstart",
      "click",
    ];
    events.forEach((event) => {
      document.addEventListener(event, updateActivity, true);
    });

    activityListener.current = updateActivity;

    return () => {
      events.forEach((event) => {
        document.removeEventListener(event, updateActivity, true);
      });
    };
  }, []);

  // Check session on mount
  useEffect(() => {
    async function checkSession() {
      try {
        const res = await fetch(`${API_BASE_URL}/auth/me`, {
          method: "GET",
          credentials: "include",
        });
        if (res.ok) {
          const data = await res.json();
          setUser({ email: data.email, role: data.role });
          // Start token validation interval when user is authenticated
          startTokenValidation();
        } else {
          setUser(null);
          stopTokenValidation();
        }
      } catch {
        setUser(null);
        stopTokenValidation();
      } finally {
        setLoading(false);
      }
    }
    checkSession();
  }, []);

  // Cleanup interval on unmount
  useEffect(() => {
    return () => {
      stopTokenValidation();
    };
  }, []);

  // Start token validation interval
  const startTokenValidation = () => {
    stopTokenValidation(); // Clear any existing interval

    // Check token validity every 30 seconds
    tokenCheckInterval.current = setInterval(async () => {
      try {
        // Only check if user has been active in the last 10 minutes
        const timeSinceLastActivity = Date.now() - lastActivityTime.current;
        const tenMinutes = 10 * 60 * 1000;

        if (timeSinceLastActivity > tenMinutes) {
          // User has been inactive for more than 10 minutes, logout for security
          console.log(
            "User inactive for 10+ minutes, logging out for security"
          );
          handleTokenExpired(true); // true indicates inactivity timeout
          return;
        }

        const res = await fetch(`${API_BASE_URL}/auth/me`, {
          method: "GET",
          credentials: "include",
        });

        if (!res.ok) {
          // Token is invalid or expired - logout automatically
          handleTokenExpired();
        }
      } catch (error) {
        console.error("Token validation error:", error);
        // On network errors or other issues, also logout for security
        handleTokenExpired();
      }
    }, 30000); // 30 seconds
  };

  // Stop token validation interval
  const stopTokenValidation = () => {
    if (tokenCheckInterval.current) {
      clearInterval(tokenCheckInterval.current);
      tokenCheckInterval.current = null;
    }
  };

  // Handle token expiration
  const handleTokenExpired = (isInactivityTimeout = false) => {
    stopTokenValidation();
    setUser(null);

    // Show a notification to the user
    const message = isInactivityTimeout
      ? "You have been logged out due to inactivity for security reasons."
      : "Your session has expired. Please log in again.";

    const event = new CustomEvent("tokenExpired", {
      detail: {
        message,
        isInactivityTimeout,
      },
    });
    window.dispatchEvent(event);
  };

  const login = ({ email, role }, cb) => {
    setUser({ email, role });
    // Start token validation when user logs in
    startTokenValidation();
    if (cb) cb();
  };

  const logout = async (cb) => {
    // Stop token validation
    stopTokenValidation();

    try {
      // Call backend logout
      await fetch(`${API_BASE_URL}/auth/logout`, {
        method: "POST",
        credentials: "include",
      });
    } catch (error) {
      console.error("Logout error:", error);
    }

    setUser(null);
    if (typeof cb === "function") cb();
  };

  // Create a custom fetch function that handles token expiration
  const authenticatedFetch = async (url, options = {}) => {
    const response = await fetch(url, {
      ...options,
      credentials: "include",
    });

    // If we get a 401, the token has expired
    if (response.status === 401) {
      handleTokenExpired();
      throw new Error("Session expired");
    }

    return response;
  };

  if (loading) return null; // Optionally show a loader

  return (
    <AuthContext.Provider
      value={{
        user,
        login,
        logout,
        authenticatedFetch,
        startTokenValidation,
        stopTokenValidation,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
