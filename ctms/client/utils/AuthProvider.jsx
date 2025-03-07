import React, { createContext, useContext, useState, useEffect } from 'react';
import proxy from "@/src/utils/proxy";

const AuthContext = createContext({});

export function useAuth() {
    return useContext(AuthContext);
}

export function AuthProvider({ children }) {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);
    const [notifications, setNotifications] = useState([]);
    const [notificationsNeedRefetch, setNotificationsNeedRefetch] = useState(false);

    // Check active session
    useEffect(() => {
        checkUser();
    }, []);

    // Fetch notifications when user changes
    useEffect(() => {
        if (user) {
            fetchNotifications();
        }
    }, [user]);

    // Refetch notifications when needed
    useEffect(() => {
        if (notificationsNeedRefetch) {
            fetchNotifications();
        }
    }, [notificationsNeedRefetch]);

    const checkUser = async () => {
        try {
            const response = await fetch(`${proxy}/user/session`, {
                credentials: 'include',
            });
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
                return { success: true };
            }

            return {
                success: false,
                error: data.message || "Login failed"
            };
        } catch (error) {
            return {
                success: false,
                error: "An error occurred during login"
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
                error: data.message || "Logout failed"
            };
        } catch (error) {
            return {
                success: false,
                error: "An error occurred during logout"
            };
        }
    };

    const fetchNotifications = async () => {
        if (!user) return;

        try {
            const response = await fetch(
                `${proxy}/notification/get/all/${user.id}`,
                {
                    credentials: "include",
                }
            );

            if (!response.ok) {
                throw new Error("Failed to fetch notifications");
            }

            const data = await response.json();
            setNotifications(data);
            setNotificationsNeedRefetch(false);
        } catch (error) {
            console.error("Failed to fetch notifications:", error);
        }
    };

    const value = {
        user,
        loading,
        login,
        logout,
        notifications,
        setNotifications,
        notificationsNeedRefetch,
        setNotificationsNeedRefetch,
        fetchNotifications
    };

    return (
        <AuthContext.Provider value={value}>
            {!loading && children}
        </AuthContext.Provider>
    );
}