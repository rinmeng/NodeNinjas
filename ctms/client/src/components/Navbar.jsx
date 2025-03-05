import React, { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import IconButton from "./subcomponents/IconButton";
import NotificationPanel from "./NotificationPanel";
import { Bell } from "lucide-react";
import { Sheet, SheetTrigger } from "@/components/ui/sheet";

const Navbar = ({
  showNavbar,
  sessionUser,
  devMode,
  notifications = [],
  setNotificationsNeedRefetch,
}) => {
  const [notificationOpen, setNotificationOpen] = useState(false);
  const unreadCount = notifications.filter((n) => n.status === "unread").length;

  const location = useLocation();

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
              Admin
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

          {/* Notification Bell with Sheet */}
          {(sessionUser || devMode) && (
            <Sheet open={notificationOpen} onOpenChange={setNotificationOpen}>
              <SheetTrigger asChild>
                <div className="relative cursor-pointer">
                  <IconButton
                    icon={<Bell size={24} />}
                    color="hover:bg-blue-600 text-white"
                  />
                  {unreadCount > 0 && (
                    <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                      {unreadCount}
                    </span>
                  )}
                </div>
              </SheetTrigger>
              <NotificationPanel
                notifications={notifications}
                open={notificationOpen}
                onOpenChange={setNotificationOpen}
                setNotificationsNeedRefetch={setNotificationsNeedRefetch}
              />
            </Sheet>
          )}
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
