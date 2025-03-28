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
import Chat from "./pages/Chat";
import Login from "@/src/pages/Login";
import NotFound from "@/src/pages/NotFound";
import Dashboard from "@/src/pages/Dashboard";
import { ThemeProvider } from "@/contexts/ThemeProvider";

import { ToastProvider } from "@/utils/ToastProvider";
import Docs from "@/src/pages/Docs";

function AppContent() {
  const [devMode] = useState(false);

  return (
    <Router>
      <Navbar devMode={devMode} />

      <Routes>
        <Route path="/" element={<Dashboard devMode={devMode} />} />
        <Route path="/admin" element={<Admin devMode={devMode} />} />
        <Route path="/about" element={<About />} />
        <Route path="/login" element={<Login />} />
        <Route path="/chat" element={<Chat />} />
        <Route path="/docs" element={<Docs />} />
        <Route path="*" element={<NotFound />} />
      </Routes>
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
