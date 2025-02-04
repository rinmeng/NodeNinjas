import React, { useState } from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Navbar from "./components/Navbar";
import Home from "./pages/Home";
import About from "./pages/About";
import AdminPage from "./pages/AdminPage";
import Login from "./pages/Login";
import TestUser from "./pages/testing/TestUser";
import Test from "./pages/Test";
import NotFound from "./pages/NotFound";
import "./css/output.css";

function App() {
  const [showNavbar, setShowNavbar] = useState(true); // Add state for navbar visibility

  return (
    <Router>
      <Navbar showNavbar={showNavbar} /> {/* Pass showNavbar as prop */}
      <div>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/AdminPage" element={<AdminPage />} />
          <Route path="/about" element={<About />} />
          <Route
            path="/login"
            element={<Login setShowNavbar={setShowNavbar} />} // Pass setShowNavbar to Login
          />
          <Route path="/login" element={<Login />} />

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
