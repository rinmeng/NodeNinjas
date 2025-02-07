import React, { useState, useEffect } from "react";
import { FaTimes } from "react-icons/fa";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Navbar from "./components/Navbar";
import Home from "./pages/Home";
import About from "./pages/About";
import Admin from "./pages/Admin";
import Login from "./pages/Login";
import TestUser from "./pages/testing/TestUser";
import Test from "./pages/Test";
import NotFound from "./pages/NotFound";
import "./css/output.css";

const proxy = "http://localhost:15000/";

function App() {
  const [devMode, setDevMode] = useState(true);

  const [showNavbar, setShowNavbar] = useState(true);
  const [sessionUser, setSessionUser] = useState(null);

  const [isLoading, setIsLoading] = useState(true);
  const [notifications, setNotifications] = useState([]);
  const [showNotifications, setShowNotifications] = useState(false);

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
        onShowNotifications={() => setShowNotifications(!showNotifications)}
      />

      {/* Add notifications dropdown here */}
      {showNotifications && (
        <div className="notification-dropdown">
          {notifications.length === 0 ? (
            <div className="p-3 text-gray-500">No notifications</div>
          ) : (
            notifications.map(notification => (
              <div 
                key={notification.id} 
                className="notification-item p-3 border-b border-black-200"
              >
                <div className="flex justify-between items-center">
                  <span>{notification.message}</span>
                  <button 
                    onClick={() => setNotifications(prev => prev.filter(n => n.id !== notification.id))}
                    className="text-black hover:text-gray-600"
                  >
                    <FaTimes className="text-sm" />
                  </button>
                </div>
                <div className="text-xs text-gray-500 mt-1">
                  {new Date(notification.timestamp).toLocaleString()}
                </div>
              </div>
            ))
          )}
        </div>
      )}

      <div>
        <Routes>
          <Route
            path="/"
            element={<Home sessionUser={sessionUser} devMode={devMode} notifications={notifications} setNotifications={setNotifications}/>}
          />
          <Route
            path="/admin"
            element={<Admin sessionUser={sessionUser} devMode={devMode} />}
          />
          <Route path="/about" element={<About />} />
          <Route
            path="/login"
            element={
              <Login
                setShowNavbar={setShowNavbar}
                sessionUser={sessionUser}
                setSessionUser={setSessionUser}
              />
            }
          />
          <Route
            path="/test"
            element={<Test sessionUser={sessionUser} devMode={devMode} />}
          />
          <Route path="/test/user" element={<TestUser />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;
