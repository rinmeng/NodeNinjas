import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Navbar from "./components/Navbar"; // Import the Navbar component
import Home from "./pages/Home"; // Import the pages
import About from "./pages/About";
import Contact from "./pages/Contact";
import TestUser from "./pages/testing/TestUser";
import Test from "./pages/Test";
import NotFound from "./pages/NotFound";
import "./css/output.css";


function App() {
  return (
    <Router>
      <Navbar /> {/* Display the Navbar on every page */}
      <div>
        {/* Define your routes */}
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/about" element={<About />} />
          <Route path="/contact" element={<Contact />} />
         

          {/*
            Nested routes for the testing pages
          */}
          <Route path="/test" element={<Test />} />
          <Route path="/test/user" element={<TestUser />} />

          {/* 
            If the user navigates to a route that does not exist,
          */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;
