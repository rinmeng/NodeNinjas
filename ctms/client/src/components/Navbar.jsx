import React, { useState, useEffect, useRef } from "react";
import { Link, useLocation } from "react-router-dom";
import { Mail, X, Bell, MailWarning, MailCheck } from "lucide-react";
import IconButton from "./subcomponents/IconButton";

const dateToTimeAgo = (date) => {
  const now = new Date();
  const diff = now - date;

  const seconds = Math.floor(diff / 1000);
  const minutes = Math.floor(seconds / 60);
  const hours = Math.floor(minutes / 60);
  const days = Math.floor(hours / 24);

  if (days > 0) {
    return `${days} day${days > 1 ? "s" : ""} ago`;
  } else if (hours > 0) {
    return `${hours} hour${hours > 1 ? "s" : ""} ago`;
  } else if (minutes > 0) {
    return `${minutes} minute${minutes > 1 ? "s" : ""} ago`;
  } else {
    return `${seconds} second${seconds > 1 ? "s" : ""} ago`;
  }
};

// Defines the Notification Panel component
const NotificationPanel = ({ notifications, onClose }) => {
  const panelRef = useRef(null);

  const isNotificationRead = (notification) => {
    return notification.status === "read";
  };

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (panelRef.current && !panelRef.current.contains(event.target)) {
        onClose();
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [onClose]);

  return (
    <div
      ref={panelRef}
      className="absolute right-4 top-16 bg-white shadow-lg rounded-lg py-2 w-80 z-20"
    >
      <div className="p-4 border-b border-slate-200 flex justify-between items-center">
        <h3 className="font-semibold text-slate-800">Notifications</h3>
        <button
          onClick={onClose}
          className="text-slate-600 hover:text-slate-800"
        >
          <X size={20} />
        </button>
      </div>

      <div className="max-h-96 overflow-y-auto">
        {notifications.length === 0 ? (
          <div className="p-4 text-center text-slate-500">
            No new notifications
          </div>
        ) : (
          notifications.map((notification) => {
            return (
              <div
                key={notification.id}
                className={`p-4 hover:bg-slate-200 t200e border-b border-slate-400
                ${
                  !isNotificationRead(notification)
                    ? "bg-slate-300"
                    : "bg-slate-200"
                }`}
              >
                <div className="flex items-start gap-3">
                  {/* Mail icon*/}

                  {isNotificationRead(notification) ? (
                    <MailCheck
                      size={18}
                      className={
                        "mt-1 transition-transform duration-200 ease-in-out text-blue-600"
                      }
                    />
                  ) : (
                    <MailWarning
                      size={18}
                      className={
                        "mt-1 transition-transform duration-200 ease-in-out  text-slate-600"
                      }
                    />
                  )}

                  {/* Main content */}
                  <div className="flex-1 cursor-pointer">
                    <p className="text-sm text-slate-800">
                      {notification.message}
                    </p>
                    <div className="text-xs text-slate-500 mt-1 block">
                      {dateToTimeAgo(new Date(notification.created_at))}
                    </div>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};

const Navbar = ({
  showNavbar,
  sessionUser,
  devMode,
  notifications = [],
  onMarkSingleAsRead,
}) => {
  const [isNotificationsVisible, setIsNotificationsVisible] = useState(false);
  const unreadCount = notifications.filter((n) => n.status === "unread").length;

  const location = useLocation();

  const handleBellClick = (e) => {
    e.stopPropagation();
    setIsNotificationsVisible(!isNotificationsVisible);
    // Removed the automatic marking as read when opening panel
  };

  // Check if the current path matches the link path
  const isActive = (path) => {
    return location.pathname === path;
  };

  // Get the appropriate class for a nav link based on its active state
  const getLinkClass = (path) => {
    return `navbar-links ${isActive(path) ? "bg-blue-600" : ""}`;
  };

  return (
    <nav
      className={`${showNavbar ? "animate-fadein" : "animate-fadeout"}
    fixed left-0 top-0 w-screen bg-slate-950 p-4 z-10 h-auto`}
    >
      <div className="container mx-auto flex justify-between items-center">
        <div className="text-white text-xl">
          <h1>
            <Link to="/">CTMS.</Link>
          </h1>
        </div>
        <div className="space-x-4 flex justify-center items-center">
          {(sessionUser || devMode) && (
            <Link to="/" className={getLinkClass("/")}>
              Dashboard
            </Link>
          )}

          {(sessionUser?.role === "admin" || devMode) && (
            <Link to="/admin" className={getLinkClass("/admin")}>
              Admin Page
            </Link>
          )}

          <Link to="/about" className={getLinkClass("/about")}>
            About
          </Link>

          <Link to="/login" className={getLinkClass("/login")}>
            {sessionUser ? "Profile" : "Login"}
          </Link>

          {(sessionUser || devMode) && (
            <Link to="/message" className={getLinkClass("/message")}>
              Message
            </Link>
          )}

          {/* Notification Bell */}
          <IconButton
            icon={
              <div>
                <Bell size={24} />
                {unreadCount > 0 && (
                  <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                    {unreadCount}
                  </span>
                )}
              </div>
            }
            color="hover:bg-blue-600 text-white"
            onClick={handleBellClick}
          />

          {isNotificationsVisible && (
            <NotificationPanel
              notifications={notifications}
              onClose={() => setIsNotificationsVisible(false)}
              onMarkSingleAsRead={onMarkSingleAsRead}
            />
          )}
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
