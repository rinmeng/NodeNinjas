import React, { useState, useEffect, useRef } from "react";
import { Link, useLocation } from "react-router-dom";
import { Mail, X, Bell } from "lucide-react";
import IconButton from "./subcomponents/IconButton";

// Defines the Notification Panel component
const NotificationPanel = ({ notifications, onClose, onToggleRead ,setNotificationToAdd}) => {
  const [expandedIds, setExpandedIds] = useState(new Set());
  const panelRef = useRef(null);
  

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

  const toggleDescription = (id) => {
    setExpandedIds((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(id)) {
        newSet.delete(id);
      } else {
        newSet.add(id);
      }
      return newSet;
    });
  };

  return (
    <div
      ref={panelRef}
      className="absolute right-4 top-16 bg-white shadow-lg rounded-lg w-80 z-20"
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
        {notifications.length  === 0 ? (
          <div className="p-4 text-center text-slate-500">
            No new notifications
          </div>
        ) : (
          notifications.map((notification) => {
            const isExpanded = expandedIds.has(notification.id);

            return (
              <div
                key={notification.id}
                className="p-4 hover:bg-slate-50 border-b border-slate-100 last:border-0"
              >
                <div className="flex items-start gap-3">
                  {/* Mail icon and read toggle */}
                  <button
                    onClick={() => onToggleRead(notification.id)}
                    className="flex-shrink-0"
                  >
                    <Mail
                      size={18}
                      className={`mt-1 transition-transform duration-200 ease-in-out ${
                        !notification.read ? "text-blue-600" : "text-slate-600"
                      }`}
                    />
                  </button>

                  {/* Main content */}
                  <div
                    className="flex-1 cursor-pointer"
                    onClick={() => toggleDescription(notification.id)}
                  >
                    <p className="text-sm text-slate-800">
                      {notification.message}
                    </p>
                    <time className="text-xs text-slate-500 mt-1 block">
                      {new Date(notification.timestamp).toLocaleString()}
                    </time>

                    {/* Collapisable description */}
                    {isExpanded && (
                      <div className="mt-2 text-sm text-slate-600 transition-all duration-300 ease-in-out">
                        {notification.description}
                      </div>
                    )}
                  </div>

                  {/*Mark read/unread button*/}
                  <button
                    onClick={(e) => {
                      e.stopPropagation(); // Prevent the notification from being toggled
                      onToggleRead(notification.id);
                    }}
                    className="text-sm text-slate-500 hover:text-blue-600 ml-2"
                  >
                    {notification.read ? "Mark unread" : "Mark read"}
                  </button>
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
  setNotificatiotoAdd,
  onMarkAsRead,
  onToggleRead,
}) => {
  const [isNotificationsVisible, setIsNotificationsVisible] = useState(false);
  const unreadCount = notifications.filter((n) => !n.read).length;

  
  

  const location = useLocation();


  const handleBellClick = (e) => {
    e.stopPropagation();
    const wasVisible = isNotificationsVisible;
    setIsNotificationsVisible(!wasVisible);

    if (!wasVisible && unreadCount > 0) {
      onMarkAsRead();
    }
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
              onToggleRead={onToggleRead}
            />
          )}
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
