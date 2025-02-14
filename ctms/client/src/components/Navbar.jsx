import React, { useState } from "react";
import { Link } from "react-router-dom";
import { Mail, X, Bell } from "lucide-react";

const NotificationPanel = ({ notifications, onClose }) => {
  return (
    <div className="absolute right-4 top-16 bg-white shadow-lg rounded-lg w-80 z-20">
      <div className="p-4 border-b border-slate-200 flex justify-between items-center">
        <h3 className="font-semibold text-slate-800">Notifications</h3>
        <button onClick={onClose} className="text-slate-600 hover:text-slate-800">
          <X size={20} />
        </button>
      </div>
      
      <div className="max-h-96 overflow-y-auto">
        {notifications.length === 0 ? (
          <div className="p-4 text-center text-slate-500">
            No new notifications
          </div>
        ) : (
          notifications.map((notification, index) => (
            <div
              key={index}
              className="p-4 hover:bg-slate-50 border-b border-slate-100 last:border-0 flex items-start gap-3"
            >
              <Mail size={18} className="flex-shrink-0 text-slate-600 mt-1" />
              <div>
                <p className="text-sm text-slate-800">{notification.message}</p>
                <time className="text-xs text-slate-500 mt-1 block">
                  {notification.timestamp}
                </time>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

const Navbar = ({ showNavbar, sessionUser, devMode, notifications = [], onShowNotifications }) => {
  const [isNotificationsVisible, setIsNotificationsVisible] = useState(false);

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

          {/* Notification Bell */}
          
            <button 
              onClick={() => setIsNotificationsVisible(!isNotificationsVisible)}
              className="text-white hover:text-slate-300 relative p-2"
            >
              <Bell size={24} />
              {notifications.length > 0 && (
                <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                  {notifications.length}
                </span>
              )}
            </button>

            {isNotificationsVisible && (
              <NotificationPanel
                notifications={notifications}
                onClose={() => setIsNotificationsVisible(false)}
              />
            )}
        </div>
      </div>
    </nav>
  );
};

export default Navbar;