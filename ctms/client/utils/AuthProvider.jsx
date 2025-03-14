import React, { createContext, useContext, useState, useEffect } from "react";
import proxy from "@/utils/proxy";
import { io } from "socket.io-client";

const AuthContext = createContext({});

export function useAuth() {
  return useContext(AuthContext);
}

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // Check active session
  useEffect(() => {
    checkUser();
  }, []);

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

        // connect to socket.io and emit the user id so that we can set their is_online attribute

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
  };

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
}
