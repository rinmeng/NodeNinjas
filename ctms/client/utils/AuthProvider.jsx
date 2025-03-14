import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  useRef,
} from "react";
import proxy from "@/utils/proxy";
import { io } from "socket.io-client";

const AuthContext = createContext({});

export function useAuth() {
  return useContext(AuthContext);
}

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const socketRef = useRef(null);

  // Check active session
  useEffect(() => {
    checkUser();
  }, []);

  // Handle socket connection based on user state
  useEffect(() => {
    // If user exists and no socket connection yet, connect
    if (user?.id && !socketRef.current) {
      socketRef.current = io(proxy, { withCredentials: true });
      socketRef.current.emit("join", user.id);
      console.log("Socket connection established in AuthProvider");
    }

    // If user exists and socket already exists, ensure we emit join
    if (user?.id && socketRef.current) {
      socketRef.current.emit("join", user.id);
      console.log("Re-emitted join event for existing socket");
    }

    // If user is null but socket exists, disconnect
    if (!user && socketRef.current) {
      socketRef.current.disconnect();
      socketRef.current = null;
      console.log("Socket disconnected in AuthProvider");
    }

    // Cleanup function
    return () => {
      if (socketRef.current) {
        socketRef.current.disconnect();
        socketRef.current = null;
        console.log("Socket disconnected on AuthProvider unmount");
      }
    };
  }, [user]);

  const checkUser = async () => {
    try {
      const response = await fetch(`${proxy}/user/session`, {
        credentials: "include",
      });

      if (response.status === 404) {
        setUser(null);
        setLoading(false);
        console.log("No active session found");
        return;
      }

      const data = await response.json();

      if (data.isValid && data.user) {
        setUser(data.user);
      } else {
        setUser(null);
      }
    } catch (error) {
      console.error("Session check failed:", error);
      setUser(null);
    } finally {
      setLoading(false);
    }
  };

  const login = async (username, password, isRemembered) => {
    try {
      const response = await fetch(`${proxy}/user/login`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify({
          username,
          password_hash: password,
          isRemembered,
        }),
      });

      const data = await response.json();

      if (response.ok) {
        setUser(data.session.user);
        // Socket connection will be established in useEffect
        return { success: true };
      }

      return {
        success: false,
        error: data.message || "Login failed",
      };
    } catch (error) {
      return {
        success: false,
        error: "An error occurred during login",
      };
    }
  };

  const logout = async () => {
    try {
      const response = await fetch(`${proxy}/user/logout`, {
        method: "POST",
        credentials: "include",
      });

      if (response.ok) {
        // Socket disconnection will happen in useEffect when user is set to null
        setUser(null);
        return { success: true };
      }

      const data = await response.json();
      return {
        success: false,
        error: data.message || "Logout failed",
      };
    } catch (error) {
      return {
        success: false,
        error: "An error occurred during logout",
      };
    }
  };

  const value = {
    user,
    loading,
    login,
    logout,
    socket: socketRef.current, // Export socket for components to use
  };

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
}
