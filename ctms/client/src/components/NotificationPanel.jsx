import React, { useEffect, useRef } from "react";

import { X, MailWarning, MailCheck } from "lucide-react";

import proxy from "../utils/proxy";

import IconButton from "./subcomponents/IconButton";

const NotificationPanel = ({
  notifications,
  onClose,
  setNotificationsNeedRefetch,
}) => {
  const panelRef = useRef(null);

  const isNotificationRead = (notification) => {
    return notification.status === "read";
  };

  const handleReadNotification = (id, status) => async () => {
    if (status === "unread") {
      try {
        await fetch(`${proxy}/notification/read/${id}`, {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
        });
      } catch (error) {
        console.error("Failed to mark notification as read:", error);
      }
    }
    if (status === "read") {
      try {
        await fetch(`${proxy}/notification/unread/${id}`, {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
        });
      } catch (error) {
        console.error("Failed to mark notification as unread:", error);
      }
    }
    setNotificationsNeedRefetch(true);
  };

  const getNotificationText = (type) => {
    switch (type) {
      case "task_assignment":
        return `You have been assigned to a task`;
      case "task_unassignment":
        return `You have been unassigned from a task`;
      case "alert":
        return `Alert`;
      case "message":
        return `You have a new message`;
      default:
        return `New notification`;
    }
  };

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
      className="absolute right-6 top-20 bg-white shadow-lg rounded-lg py-2 w-80 z-20"
    >
      <div className="px-3 py-2 border-b border-slate-400 flex justify-between items-center">
        <div>
          <div>
            <h1 className="font-semibold text-slate-800">Notifications</h1>
            <p className="text-xs text-slate-500">
              Mark as read/unread by clicking on them
            </p>
          </div>
        </div>
        <IconButton
          icon={<X size={20} />}
          onClick={onClose}
          color="text-slate-600 hover:text-slate-800 hover:bg-slate-200"
        />
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
                className={`p-4 hover:bg-slate-100 t200e border-b border-slate-400
                ${
                  !isNotificationRead(notification)
                    ? "bg-blue-50" // Changed: Highlight unread with light blue
                    : "bg-white" // Changed: Read notifications use white
                }`}
              >
                <div
                  className="flex items-start gap-3"
                  onClick={handleReadNotification(
                    notification.id,
                    notification.status
                  )}
                >
                  {isNotificationRead(notification) ? (
                    <MailCheck
                      size={18}
                      className="mt-1 transition-transform duration-200 ease-in-out text-slate-400" // Changed: More subtle for read
                    />
                  ) : (
                    <MailWarning
                      size={18}
                      className="mt-1 transition-transform duration-200 ease-in-out text-blue-600" // Changed: Highlight unread with blue
                    />
                  )}

                  {/* Main content */}
                  <div className="flex-1 cursor-pointer">
                    <p
                      className={`text-sm ${
                        !isNotificationRead(notification)
                          ? "font-bold text-slate-900"
                          : "text-slate-700"
                      }`}
                    >
                      {getNotificationText(notification.type)}
                    </p>
                    <div>
                      <p
                        className={`text-sm ${
                          !isNotificationRead(notification)
                            ? "font-bold text-slate-800"
                            : "text-slate-700"
                        }`}
                      >
                        "{notification.message}"
                      </p>
                    </div>

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
      {/* make a line of 2px */}
      <div className="border-t border-slate-400 p-2 text-center"></div>
    </div>
  );
};

export default NotificationPanel;
