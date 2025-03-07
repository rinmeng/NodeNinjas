import React, { useState } from "react";
import { MailWarning, MailCheck, BellOff, Filter, Trash2 } from "lucide-react";
import proxy from "../utils/proxy";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
} from "@/components/ui/sheet";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Card, CardContent } from "@/components/ui/card";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { Badge } from "@/components/ui/badge";

const NotificationPanel = ({
  notifications,
  open,
  onOpenChange,
  setNotificationsNeedRefetch,
  user,
}) => {
  const [showHistory, setShowHistory] = useState(false);
  const [notificationHistory, setNotificationHistory] = useState([]);
  const [loadingHistory, setLoadingHistory] = useState(false);
  const [historyFilter, setHistoryFilter] = useState("all"); // "all" or "unread"

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

  const getNotificationTypeVariant = (type) => {
    switch (type) {
      case "task_assignment":
        return "default";
      case "task_unassignment":
        return "secondary";
      case "alert":
        return "destructive";
      case "message":
        return "outline";
      default:
        return "default";
    }
  };

  const isNotificationRead = (notification) => notification.status === "read";

  const handleReadNotification = (id, status) => async () => {
    const endpoint = status === "unread" ? "read" : "unread";

    try {
      await fetch(`${proxy}/notification/${endpoint}/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
      });
      setNotificationsNeedRefetch(true);
    } catch (error) {
      console.error(`Failed to mark notification as ${endpoint}:`, error);
    }
  };

  const fetchNotificationHistory = async () => {
    setLoadingHistory(true);
    try {
      const response = await fetch(
        `${proxy}/notification/history/${user.id}?offset=${notificationHistory.length}&limit=10&status=${historyFilter}`
      );
      const data = await response.json();
      setNotificationHistory((prevHistory) => [...prevHistory, ...data]);
    } catch (error) {
      console.error("Error fetching notification history:", error);
    }
    setLoadingHistory(false);
  };

  const toggleHistoryView = () => {
    if (!showHistory) fetchNotificationHistory();
    setShowHistory(!showHistory);
  };

  const toggleHistoryFilter = () => {
    const newFilter = historyFilter === "all" ? "unread" : "all";
    setHistoryFilter(newFilter);
    setNotificationHistory([]);
    fetchNotificationHistory();
  };

  const deleteNotification = async (id) => {
    try {
      await fetch(`${proxy}/notification/delete/${id}`, {
        method: "DELETE",
      });
      setNotificationsNeedRefetch(true);
      setNotificationHistory(notificationHistory.filter((n) => n.id !== id));
    } catch (error) {
      console.error("Error deleting notification:", error);
    }
  };

  const clearAllNotifications = async () => {
    try {
      await fetch(`${proxy}/notification/delete/all/${user.id}`, {
        method: "DELETE",
      });
      setNotificationsNeedRefetch(true);
      setNotificationHistory([]);
    } catch (error) {
      console.error("Error clearing notifications:", error);
    }
  };

  const dateToTimeAgo = (date) => {
    const now = new Date();
    const diff = now - date;
    const seconds = Math.floor(diff / 1000);
    const minutes = Math.floor(seconds / 60);
    const hours = Math.floor(minutes / 60);
    const days = Math.floor(hours / 24);

    if (days > 0) return `${days} day${days > 1 ? "s" : ""} ago`;
    if (hours > 0) return `${hours} hour${hours > 1 ? "s" : ""} ago`;
    if (minutes > 0) return `${minutes} minute${minutes > 1 ? "s" : ""} ago`;
    return `${seconds} second${seconds > 1 ? "s" : ""} ago`;
  };

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent
        className="w-[360px] sm:w-[400px] p-0 flex flex-col gap-0"
        side="right"
      >
        <SheetHeader>
          <div className="flex items-center gap-1">
            <SheetTitle>Notifications</SheetTitle>
            {notifications.length > 0 && (
              <Badge variant="default" className="ml-2">
                {notifications.filter((n) => n.status === "unread").length}{" "}
                unread
              </Badge>
            )}
          </div>
          <SheetDescription className="text-xs">
            Click on notifications to toggle read/unread status
          </SheetDescription>
        </SheetHeader>

        <Separator />

        <ScrollArea className="flex-1 h-full">
          {notifications.length === 0 ? (
            <div className="flex flex-col items-center justify-center p-8 text-center text-muted-foreground gap-2 h-[200px]">
              <BellOff className="h-10 w-10 opacity-20" />
              <p>No notifications</p>
            </div>
          ) : (
            <div className="py-1">
              {notifications.map((notification) => (
                <Card
                  key={notification.id}
                  className={`rounded-none border-l-0 border-r-0 border-t-0 border-b ${
                    !isNotificationRead(notification)
                      ? "bg-blue-50/50 dark:bg-blue-900/20"
                      : ""
                  } hover:bg-accent/10 transition-colors`}
                  onClick={handleReadNotification(
                    notification.id,
                    notification.status
                  )}
                >
                  <CardContent className="p-0">
                    <TooltipProvider>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <div className="flex items-start gap-3 px-4">
                            {isNotificationRead(notification) ? (
                              <MailCheck
                                size={18}
                                className="mt-1 text-muted-foreground"
                              />
                            ) : (
                              <MailWarning
                                size={18}
                                className="mt-1 text-primary"
                              />
                            )}

                            <div className="flex-1 text-left">
                              <div className="flex items-center justify-between mb-1">
                                <p
                                  className={`text-sm ${
                                    !isNotificationRead(notification)
                                      ? "font-semibold"
                                      : ""
                                  }`}
                                >
                                  {getNotificationText(notification.type)}
                                </p>
                              </div>

                              <p
                                className={`text-sm ${
                                  !isNotificationRead(notification)
                                    ? "font-medium"
                                    : "text-muted-foreground"
                                }`}
                              >
                                "{notification.message}"
                              </p>

                              <div className="text-xs text-muted-foreground mt-1.5">
                                {dateToTimeAgo(
                                  new Date(notification.created_at)
                                )}
                              </div>
                            </div>

                            <Button size="icon" variant="destructive">
                              <Trash2 />
                            </Button>
                          </div>
                        </TooltipTrigger>
                        <TooltipContent>
                          {isNotificationRead(notification)
                            ? "Mark as unread"
                            : "Mark as read"}
                        </TooltipContent>
                      </Tooltip>
                    </TooltipProvider>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </ScrollArea>

        <div className="px-4 py-2 border-t flex justify-between items-center">
          <Button variant="ghost" onClick={toggleHistoryView}>
            {showHistory ? "Back to Recent" : "View Notification History"}
          </Button>
          <Button variant="destructive" onClick={clearAllNotifications}>
            Clear All
          </Button>
        </div>
      </SheetContent>
    </Sheet>
  );
};

export default NotificationPanel;
