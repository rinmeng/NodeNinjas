import React, { useState } from "react";
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

function App() {
  const [showNavbar, setShowNavbar] = useState(true);
  const [sessionUser, setSessionUser] = useState(null);

  return (
    <Router>
      <Navbar showNavbar={showNavbar} sessionUser={sessionUser} />
      {/* Pass showNavbar as prop */}
      <div>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/admin" element={<Admin />} />
          <Route path="/about" element={<About />} />
          <Route
            path="/login"
            element={
              <Login
                setShowNavbar={setShowNavbar}
                setSessionUser={setSessionUser}
              />
            }
          />

          {/*
            Nested routes for the testing pages
          */}
          <Route path="/test" element={<Test />} />
          <Route path="/test/user" element={<TestUser />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;
