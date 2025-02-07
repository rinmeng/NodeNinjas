import React from "react";
import { Link } from "react-router-dom";
import { FaBell } from "react-icons/fa";

const Navbar = ({ showNavbar, sessionUser, devMode, notifications = [], onShowNotifications }) => {
  return (
    <nav
      className={`${showNavbar ? "animate-fadein" : "animate-fadeout"}
    fixed left-0 top-0 w-screen bg-slate-800 p-4 z-10`}
    >
      <div className="container mx-auto flex justify-between items-center">
        <div className="text-white text-xl">
          <h1>
            <Link to="/">CTMS.</Link>
          </h1>
        </div>
        <div className="space-x-4">
          {(sessionUser?.role === "admin" || devMode) && (
            <Link
              to="/test"
              className="text-white hover:bg-blue-700 px-3 py-2 rounded-md"
            >
              Test Database Connection
            </Link>
          )}

          {(sessionUser || devMode) && (
            <Link
              to="/"
              className="text-white hover:bg-blue-700 px-3 py-2 rounded-md"
            >
              Your Dashboard
            </Link>
          )}

          {(sessionUser?.role === "admin" || devMode) && (
            <Link
              to="/admin"
              className="text-white hover:bg-blue-700 px-3 py-2 rounded-md"
            >
              Admin Page
            </Link>
          )}

          <Link
            to="/about"
            className="text-white hover:bg-blue-700 px-3 py-2 rounded-md"
          >
            About
          </Link>

          <Link
            to="/login"
            className="text-white hover:bg-blue-700 px-3 py-2 rounded-md"
          >
            {sessionUser ? "Profile" : "Login"}
          </Link>

          <button 
        onClick={onShowNotifications}
        className="notification-bell"
      >
        <FaBell className="text-xl" />
        {notifications.length > 0 && (
          <span className="notification-badge">
            {notifications.length}
          </span>
        )}
          </button>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
