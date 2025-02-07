import React, { useState, useEffect } from "react";
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

  useEffect(() => {
    fetch(proxy + "user/checkSession", {
      credentials: "include",
    })
      .then((res) => res.json())
      .then((data) => {
        if (data.session && data.session.user) {
          setSessionUser(data.session.user);
        }
      })
      .catch((error) => {
        console.error("Session check failed:", error);
      })
      .finally(() => {
        setIsLoading(false); // Set loading to false after the session check is complete
      });
  }, []);

  if (isLoading) {
    return <div>Loading...</div>; // Show a loading indicator while checking the session
  }

  return (
    <Router>
      <Navbar
        showNavbar={showNavbar}
        sessionUser={sessionUser}
        devMode={devMode}
      />
      <div>
        <Routes>
          <Route
            path="/"
            element={<Home sessionUser={sessionUser} devMode={devMode} />}
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
