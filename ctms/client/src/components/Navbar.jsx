import React from "react";
import { Link } from "react-router-dom";

const Navbar = () => {
  return (
    <nav className="bg-blue-500 p-4">
      <div className="container mx-auto flex justify-between items-center">
        <div className="text-white text-xl">
          <h1>
            <Link to="/">LOGO</Link>
          </h1>
        </div>
        <div className="space-x-4">
          <Link
            to="/"
            className="text-white hover:bg-blue-700 px-3 py-2 rounded-md"
          >
            Home
          </Link>
          <Link
            to="/about"
            className="text-white hover:bg-blue-700 px-3 py-2 rounded-md"
          >
            About
          </Link>
          <Link
            to="/contact"
            className="text-white hover:bg-blue-700 px-3 py-2 rounded-md"
          >
            Contact
          </Link>
          <Link
            to="/test"
            className="text-white hover:bg-blue-700 px-3 py-2 rounded-md"
          >
            Test Database Connection
          </Link>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
