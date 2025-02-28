import React, { useState, useEffect } from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Navbar from "./components/Navbar";
import About from "./pages/About";
import Admin from "./pages/Admin";
import Login from "./pages/Login";
import TestUser from "./pages/testing/TestUser";
import Test from "./pages/Test";
import NotFound from "./pages/NotFound";
import "./css/output.css";
import Dashboard from "./pages/Dashboard";
import Chat from "./pages/Chat";
import Feedback2 from "./components/subcomponents/Feedback2";
import { CircleAlert, CircleCheck } from "lucide-react";

const proxy = "http://localhost:15000/";

function App() {
  const [devMode, setDevMode] = useState(false);

  const [showNavbar, setShowNavbar] = useState(true);
  const [sessionUser, setSessionUser] = useState(null);

  const [isLoading, setIsLoading] = useState(true);
  const [notifications, setNotifications] = useState([]);

  const [feedbackMessage, setFeedbackMessage] = useState("");

  const timer = 2000;

  useEffect(() => {
    fetch(proxy + "user/session", {
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

  useEffect(() => {
    if (feedbackMessage !== "") {
      setTimeout(() => {
        setFeedbackMessage("");
      }, timer);
    }
  }, [feedbackMessage]);

  if (isLoading) {
    return <div>Loading...</div>;
  }

  // Mark notifications as read
  const markNotificationsAsRead = () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
  };

  // Toggle notification read status
  const toggleNotificationReadStatus = (id) => {
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, read: !n.read } : n))
    );
  };

  return (
    <Router>
      <Navbar
        showNavbar={showNavbar}
        sessionUser={sessionUser}
        devMode={devMode}
        notifications={notifications}
        setNotifications={setNotifications}
        onMarkAsRead={markNotificationsAsRead}
        onToggleRead={toggleNotificationReadStatus}
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
                setNotifications={setNotifications}
                setFeedbackMessage={setFeedbackMessage}
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
          <Route
            path="/test"
            element={<Test sessionUser={sessionUser} devMode={devMode} />}
          />
          {/* <Route path="/message" element={<Chat />} /> */}
          <Route path="/test/user" element={<TestUser />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </div>

      <div>
        {feedbackMessage && (
          <Feedback2
            icon={
              feedbackMessage.toLowerCase().includes("success") ? (
                <CircleCheck size={24} />
              ) : (
                <CircleAlert size={24} />
              )
            }
            message={feedbackMessage}
            isSuccess={feedbackMessage.toLowerCase().includes("success")}
          />
        )}
      </div>
    </Router>
  );
}

export default App;
