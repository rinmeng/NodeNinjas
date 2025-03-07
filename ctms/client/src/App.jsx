import React, { useState, useEffect, use } from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Navbar from "./components/Navbar";
import About from "./pages/About";
import Admin from "./pages/Admin";
import Login from "./pages/Login";
import NotFound from "./pages/NotFound";
import Dashboard from "./pages/Dashboard";

import ChatWidget from "./components/ChatWidget";

import Chat from "./pages/Chat";
import { CircleAlert, CircleCheck } from "lucide-react";

import proxy from "@/src/utils/proxy";

import { Toaster } from "sonner";
import { toast } from "sonner";

function App() {
  const [devMode, setDevMode] = useState(false);

  const [showNavbar, setShowNavbar] = useState(true);
  const [sessionUser, setSessionUser] = useState(null);

  const [isLoading, setIsLoading] = useState(true);
  const [notifications, setNotifications] = useState([]);
  const [notificationToAdd, setNotificationToAdd] = useState("");
  const [feedbackMessage, setFeedbackMessage] = useState({
    title: "",
    description: "",
  });
  const [notificationsNeedRefetch, setNotificationsNeedRefetch] =
    useState(false);

  const timer = 3000;

  useEffect(() => {
    // Apply dark theme
    document.documentElement.classList.add("dark");
  }, []);

  useEffect(() => {
    fetch(`${proxy}/user/session`, {
      credentials: "include", // Important for cross-origin cookies
    })
      .then((res) => res.json())
      .then((data) => {
        if (data.isValid && data.user) {
          setSessionUser(data.user);
        } else {
          setSessionUser(null);
        }
      })
      .catch((error) => {
        console.error("Session check failed:", error);
      })
      .finally(() => {
        setIsLoading(false);
      });
  }, []);

  // Adding the notification
  useEffect(() => {
    async function addNotification() {
      if (
        notificationToAdd &&
        notificationToAdd.user_ids &&
        notificationToAdd.user_ids.length > 0
      ) {
        try {
          // In App.jsx
          const response = await fetch(
            `${proxy}/notification/add/${notificationToAdd.user_ids}`,
            {
              method: "POST",
              headers: {
                "Content-Type": "application/json",
              },
              credentials: "include", // Add this if you need cookies/auth
              body: JSON.stringify({
                user_ids: notificationToAdd.user_ids,
                message: notificationToAdd.message,
                type: notificationToAdd.type,
              }),
            }
          );

          if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.message || "Failed to add notification");
          }
          setNotificationToAdd(null);
          setNotificationsNeedRefetch(true); // Trigger a refetch after adding
        } catch (error) {
          console.error("Failed to add notification:", error);
          setFeedbackMessage(`Failed to add notification: ${error.message}`);
        }
      }
    }

    addNotification();
  }, [notificationToAdd, setFeedbackMessage, setNotificationToAdd]);

  // Fetching notifications function
  const fetchNotifications = React.useCallback(async () => {
    // Check if sessionUser exists before trying to access its properties
    if (!sessionUser) {
      return; // Exit the function early if sessionUser doesn't exist
    }

    try {
      const response = await fetch(
        `${proxy}/notification/get/all/${sessionUser.id}`,
        {
          credentials: "include",
        }
      );

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Failed to fetch notifications");
      }

      const data = await response.json();
      setNotifications(data);
      setNotificationsNeedRefetch(false); // Reset the refetch flag
    } catch (error) {
      console.error("Failed to fetch notifications:", error);
      setFeedbackMessage(`Failed to fetch notifications: ${error.message}`);
    }
  }, [
    sessionUser,
    setNotifications,
    setNotificationsNeedRefetch,
    setFeedbackMessage,
  ]);

  // Fetching notifications on component mount and when sessionUser changes
  useEffect(() => {
    fetchNotifications();
  }, [sessionUser, fetchNotifications]);

  // Refetch notifications when needed
  useEffect(() => {
    if (notificationsNeedRefetch) {
      fetchNotifications();
    }
  }, [notificationsNeedRefetch, fetchNotifications]);

  useEffect(() => {
    if (feedbackMessage) {
      // Only show toast if there's actually a message
      const isFeedbackSuccess = feedbackMessage.title
        .toLowerCase()
        .includes("success");
      toast(feedbackMessage.title, {
        description: feedbackMessage.description,
        duration: timer,
        icon: isFeedbackSuccess ? (
          <CircleCheck className="text-green-500" />
        ) : (
          <CircleAlert className="text-black" />
        ),
        position: "bottom-right",
        classNames: {
          title: "ml-2 text-base font-bold",
          description: "ml-2",
        },
      });
      setFeedbackMessage(""); // Clear the message after showing the toast
    }
  }, [feedbackMessage]);

  if (isLoading) {
    return <div>Loading...</div>;
  }

  return (
    <Router>
      <Navbar
        showNavbar={showNavbar}
        sessionUser={sessionUser}
        devMode={devMode}
        notifications={notifications}
        setNotificationToAdd={setNotificationToAdd}
        setNotificationsNeedRefetch={setNotificationsNeedRefetch}
      />

      <div>
        <Routes>
          <Route
            path="/"
            element={
              <Dashboard
                sessionUser={sessionUser}
                devMode={devMode}
                notifications={notifications}
                setFeedbackMessage={setFeedbackMessage}
                setNotificationToAdd={setNotificationToAdd}
                setNotificationsNeedRefetch={setNotificationsNeedRefetch}
              />
            }
          />

          <Route
            path="/admin"
            element={
              <Admin
                sessionUser={sessionUser}
                devMode={devMode}
                setFeedbackMessage={setFeedbackMessage}
              />
            }
          />
          <Route path="/about" element={<About />} />
          <Route
            path="/login"
            element={
              <Login
                setShowNavbar={setShowNavbar}
                sessionUser={sessionUser}
                setSessionUser={setSessionUser}
                setFeedbackMessage={setFeedbackMessage}
              />
            }
          />
          <Route path="*" element={<NotFound />} />
        </Routes>
        <ChatWidget />
      </div>
      <Toaster />
    </Router>
  );
}

export default App;
