import React, { createContext, useContext, useState, useEffect } from "react";
import { useAuth } from "./AuthProvider";
import proxy from "@/utils/proxy";

const NotificationContext = createContext({});

export function useNotification() {
  return useContext(NotificationContext);
}

export function NotificationProvider({ children }) {
  const { user } = useAuth();
  const [notifications, setNotifications] = useState([]);
  const [notificationsNeedRefetch, setNotificationsNeedRefetch] =
    useState(false);
  const [notificationToAdd, setNotificationToAdd] = useState("");

  // Fetch notifications when user changes
  useEffect(() => {
    if (user) {
      fetchNotifications();
    } else {
      setNotifications([]);
    }
  }, [user]);

  // Refetch notifications when needed
  useEffect(() => {
    if (notificationsNeedRefetch) {
      fetchNotifications();
    }
  }, [notificationsNeedRefetch]);

  // Send notification when notificationToAdd changes
  useEffect(() => {
    const sendNotification = async () => {
      if (
        notificationToAdd &&
        notificationToAdd.user_ids &&
        notificationToAdd.user_ids.length > 0
      ) {
        try {
          const response = await fetch(`${proxy}/notification/add/:ids`, {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            credentials: "include",
            body: JSON.stringify(notificationToAdd),
          });

          if (response.ok) {
            // Reset the notification state after successful send
            setNotificationToAdd("");
            // Trigger a refresh of notifications for the current user
            setNotificationsNeedRefetch(true);
          } else {
            console.error("Failed to add notification");
          }
        } catch (error) {
          console.error("Error sending notification:", error);
        }
      }
    };

    sendNotification();
  }, [notificationToAdd]);

  const fetchNotifications = async () => {
    if (!user) return;

    try {
      const response = await fetch(`${proxy}/notification/get/all/${user.id}`, {
        credentials: "include",
      });

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
    notifications,
    setNotifications,
    notificationsNeedRefetch,
    setNotificationsNeedRefetch,
    fetchNotifications,
    notificationToAdd,
    setNotificationToAdd,
  };

  return (
    <NotificationContext.Provider value={value}>
      {children}
    </NotificationContext.Provider>
  );
}
