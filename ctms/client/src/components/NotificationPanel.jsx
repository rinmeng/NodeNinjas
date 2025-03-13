import React, { useState } from "react";
import { MailWarning, MailCheck, BellOff, RefreshCw } from "lucide-react";
import proxy from "../../utils/proxy";
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
import { useToast } from "@/utils/ToastProvider";

const NotificationPanel = ({
  notifications,
  open,
  onOpenChange,
  setNotificationsNeedRefetch,
  notificationsNeedRefetch,
}) => {
  const { setFeedbackMessage } = useToast();
  const [isRefreshing, setIsRefreshing] = useState(false);
  const isNotificationRead = (notification) => {
    return notification.status === "read";
  };

  const handleReadNotification = (id, status) => async () => {
    const endpoint = status === "unread" ? "read" : "unread";

    try {
      await fetch(`${proxy}/notification/${endpoint}/${id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
      });
      setNotificationsNeedRefetch(true);
    } catch (error) {
      console.error(`Failed to mark notification as ${endpoint}:`, error);
    }
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
    <>
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
            <Button
              variant="default"
              size="sm"
              className="w-full mt-2"
              onClick={() => {
                setIsRefreshing(true);
                setNotificationsNeedRefetch(true);
                setTimeout(() => {
                  setIsRefreshing(false);
                  setFeedbackMessage({
                    title: "Notifications Synced Successfully",
                    description: "Notifications have been refreshed",
                  });
                }, 750);
              }}
            >
              {isRefreshing && <RefreshCw className="animate-spin" />}
              Sync Notifications
            </Button>
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
        </SheetContent>
      </Sheet>
    </>
  );
};

export default NotificationPanel;
