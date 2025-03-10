import React, { useState, useEffect } from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { AuthProvider, useAuth } from "@/utils/AuthProvider";
import Navbar from "@/src/components/Navbar";
import About from "@/src/pages/About";
import Admin from "@/src/pages/Admin";
import Login from "@/src/pages/Login";
import NotFound from "@/src/pages/NotFound";
import Dashboard from "@/src/pages/Dashboard";
import ChatWidget from "@/src/components/ChatWidget";
import { CircleAlert, CircleCheck } from "lucide-react";
import { Toaster } from "sonner";
import { toast } from "sonner";
import { ThemeProvider } from "@/contexts/ThemeProvider";

function AppContent() {
  const { user, notifications, setNotificationsNeedRefetch } = useAuth();
  const [devMode] = useState(false);
  const [showNavbar, setShowNavbar] = useState(true);
  const [feedbackMessage, setFeedbackMessage] = useState({
    title: "",
    description: "",
  });
  const [notificationToAdd, setNotificationToAdd] = useState("");

  // Apply dark theme
  useEffect(() => {
    document.documentElement.classList.add("light");
  }, []);

  // Handle feedback messages
  useEffect(() => {
    if (feedbackMessage.title) {
      const isFeedbackSuccess = feedbackMessage.title
        .toLowerCase()
        .includes("success");
      toast(feedbackMessage.title, {
        description: feedbackMessage.description,
        duration: 3000,
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
      setFeedbackMessage("");
    }
  }, [feedbackMessage]);

  return (
    <Router>
      <Navbar
        showNavbar={showNavbar}
        devMode={devMode}
        notifications={notifications}
        setNotificationToAdd={setNotificationToAdd}
        setNotificationsNeedRefetch={setNotificationsNeedRefetch}
      />

      <Routes>
        <Route
          path="/"
          element={
            <Dashboard
              devMode={devMode}
              setFeedbackMessage={setFeedbackMessage}
              setNotificationToAdd={setNotificationToAdd}
            />
          }
        />
        <Route
          path="/admin"
          element={
            <Admin devMode={devMode} setFeedbackMessage={setFeedbackMessage} />
          }
        />
        <Route path="/about" element={<About />} />
        <Route
          path="/login"
          element={
            <Login
              setShowNavbar={setShowNavbar}
              setFeedbackMessage={setFeedbackMessage}
            />
          }
        />
        <Route path="*" element={<NotFound />} />
      </Routes>
      <ChatWidget />
      <Toaster />
    </Router>
  );
}

function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <AppContent />
      </AuthProvider>
    </ThemeProvider>
  );
}

export default App;
