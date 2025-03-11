import React, { useState, useEffect } from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/utils/AuthProvider";
import {
  NotificationProvider,
  useNotification,
} from "@/utils/NotificationProvider";
import Navbar from "@/src/components/Navbar";
import About from "@/src/pages/About";
import Admin from "@/src/pages/Admin";
import Login from "@/src/pages/Login";
import NotFound from "@/src/pages/NotFound";
import Dashboard from "@/src/pages/Dashboard";
import ChatWidget from "@/src/components/ChatWidget";
import { ThemeProvider } from "@/contexts/ThemeProvider";
import Message from "@/src/pages/Message";
import { ToastProvider, useToast } from "@/utils/ToastProvider";

function AppContent() {
  const { notifications, setNotificationToAdd, setNotificationsNeedRefetch } =
    useNotification();
  const { setFeedbackMessage } = useToast();
  const [devMode] = useState(false);

  // Apply theme
  useEffect(() => {
    document.documentElement.classList.add("light");
  }, []);

  return (
    <Router>
      <Navbar devMode={devMode} />

      <Routes>
        <Route path="/" element={<Dashboard devMode={devMode} />} />
        <Route path="/admin" element={<Admin devMode={devMode} />} />
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
    </Router>
  );
}

function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <NotificationProvider>
          <ToastProvider>
            <AppContent />
          </ToastProvider>
        </NotificationProvider>
      </AuthProvider>
    </ThemeProvider>
  );
}

export default App;
