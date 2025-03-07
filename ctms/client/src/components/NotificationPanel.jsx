import React, { useEffect } from "react";
import { X, MailWarning, MailCheck } from "lucide-react";
import proxy from "../utils/proxy";
import IconButton from "./subcomponents/IconButton";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
  SheetClose,
} from "@/components/ui/sheet";
import { ScrollArea } from "@/components/ui/scroll-area";

const NotificationPanel = ({
  notifications,
  open,
  onOpenChange,
  setNotificationsNeedRefetch,
}) => {
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

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent
        className="w-[360px] sm:w-[400px] p-0 flex flex-col gap-0 "
        side="right"
      >
        <SheetHeader className="px-4 border-b border-slate-200 pb-3">
          <SheetTitle className="font-semibold  text-right">
            Notifications
          </SheetTitle>
          <SheetDescription className="text-xs text-right">
            Mark as read/unread by clicking on them
          </SheetDescription>
        </SheetHeader>

        <ScrollArea className="flex-1 h-full">
          {notifications.length === 0 ? (
            <div className="p-6 text-center text-slate-500">
              No new notifications
            </div>
          ) : (
            <div>
              {notifications.map((notification) => (
                <div
                  key={notification.id}
                  className={`p-4 hover:bg-slate-100 transition-colors duration-200 ease-in-out border-b border-slate-200
                  ${
                    !isNotificationRead(notification)
                      ? "bg-blue-50"
                      : "bg-white"
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
                      <MailCheck size={18} className="mt-1 text-slate-400" />
                    ) : (
                      <MailWarning size={18} className="mt-1 text-blue-600" />
                    )}

                    {/* Main content */}
                    <div className="flex-1">
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
                              ? "font-semibold text-slate-800"
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
              ))}
            </div>
          )}
        </ScrollArea>
      </SheetContent>
    </Sheet>
  );
};

export default NotificationPanel;
