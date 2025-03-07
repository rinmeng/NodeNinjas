import React, { useState, useEffect } from "react";
import {
  CircleDashed,
  CircleDotDashed,
  CircleEllipsis,
  Clock,
  ClockAlert,
  ClockArrowUp,
  ClockArrowDown,
  ChevronDown,
  ChevronUp,
  CalendarClock,
  SquarePen,
  Trash,
  Lock,
  LockOpen,
  Users,
  UserRoundCog,
  CircleCheck,
  ShieldCheck,
  ExternalLink,
} from "lucide-react";
import EditTaskPanel from "../EditTaskPanel";
import proxy from "../../utils/proxy";
import AssignTaskPanel from "../AssignTaskPanel";
import {
  Dialog,
  DialogTrigger,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardHeader,
  CardContent,
  CardFooter,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { Separator } from "@/components/ui/separator";

import getDateWithRelativeTime from "@/src/utils/getDateWithRelativeTime";

const TaskCard = ({
  task,
  sessionUser,
  setNeedsRefetch,
  setFeedbackMessage,
  setNotificationToAdd,
  devMode,
}) => {
  const [showUpdateTaskPanel, setShowUpdateTaskPanel] = useState(false);
  const [isTaskLocked, setIsTaskLocked] = useState(task.is_locked || false);
  const [showTaskDetails, setShowTaskDetails] = useState(false);
  const [showAssignTaskPanel, setShowAssignTaskPanel] = useState(false);

  const isTaskOwner = task.owner_id === sessionUser.id;

  useEffect(() => {
    // Update the local state when the task prop changes
    setIsTaskLocked(task.is_locked || false);
  }, [task.is_locked]);

  const handleEditTask = () => {
    if (isTaskLocked) {
      if (sessionUser.role === "admin") {
        setFeedbackMessage({
          title: "Task Locked",
          description: "This task is locked. Unlock it first to edit.",
        });
      } else {
        setFeedbackMessage({
          title: "Task Locked",
          description: "Contact your admin to make changes.",
        });
      }
      return;
    }
    setShowUpdateTaskPanel(!showUpdateTaskPanel);
  };

  const toggleTaskDetails = () => {
    setShowTaskDetails(!showTaskDetails);
  };

  const getStatusVariant = (status) => {
    const formattedStatus = status.replace(/\s+/g, "").toLowerCase();
    switch (formattedStatus) {
      case "pending":
        return "secondary";
      case "in_progress":
        return "default";
      case "completed":
        return "success";
      default:
        return "outline";
    }
  };

  const getStatusIcon = (status) => {
    const formattedStatus = status.replace(/\s+/g, "").toLowerCase();
    switch (formattedStatus) {
      case "pending":
        return <CircleDashed className="h-4 w-4 mr-1" />;
      case "in_progress":
        return <CircleDotDashed className="h-4 w-4 mr-1" />;
      case "completed":
        return <CircleCheck className="h-4 w-4 mr-1" />;
      default:
        return <CircleEllipsis className="h-4 w-4 mr-1" />;
    }
  };

  const getPriorityIcon = (priority) => {
    const formattedPriority = priority.replace(/\s+/g, "").toLowerCase();
    switch (formattedPriority) {
      case "high":
        return <ClockAlert className="h-4 w-4 mr-1" />;
      case "medium":
        return <ClockArrowUp className="h-4 w-4 mr-1" />;
      case "low":
        return <ClockArrowDown className="h-4 w-4 mr-1" />;
      default:
        return <Clock className="h-4 w-4 mr-1" />;
    }
  };

  const getPriorityVariant = (priority) => {
    const formattedPriority = priority.replace(/\s+/g, "").toLowerCase();
    switch (formattedPriority) {
      case "high":
        return "destructive";
      case "medium":
        return "warning";
      case "low":
        return "secondary";
      default:
        return "outline";
    }
  };

  const getDateVariant = (date) => {
    const now = new Date();
    const taskDate = new Date(date);
    const diff = taskDate.getTime() - now.getTime();
    const diffDays = Math.ceil(diff / (1000 * 60 * 60 * 24));

    if (diffDays < 0) {
      return "outline";
    } else if (diffDays === 0) {
      return "destructive";
    } else if (diffDays === 1) {
      return "warning";
    } else {
      return "success";
    }
  };

  const getPriorityString = (priority) => {
    switch (priority) {
      case "high":
        return "High";
      case "medium":
        return "Medium";
      case "low":
        return "Low";
      default:
        return "Low";
    }
  };

  const getStatusString = (status) => {
    switch (status) {
      case "pending":
        return "Pending";
      case "in_progress":
        return "In Progress";
      case "completed":
        return "Completed";
      default:
        return "Pending";
    }
  };

  const handleDeleteTask = () => {
    if (isTaskLocked) {
      if (sessionUser.role === "admin") {
        setFeedbackMessage({
          title: "Task Locked",
          description: "This task is locked. Unlock it first to delete.",
        });
      } else {
        setFeedbackMessage({
          title: "Task Locked",
          description: "Contact your admin to make changes.",
        });
      }
      return;
    }

    fetch(`${proxy}/task/delete/:id`, {
      method: "DELETE",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ id: task.id }),
    })
      .then((res) => res.json())
      .then((data) => {
        console.log("Task deleted successfully:", data);
        setNeedsRefetch(true);
        setFeedbackMessage({
          title: "Success",
          description: "Task deleted successfully!",
        });
      })
      .catch((err) => {
        console.log(err);
        setFeedbackMessage({
          title: "Error",
          description: "Failed to delete task.",
        });
      });
  };

  const handleToggleLock = () => {
    const lockEndpoint = isTaskLocked ? "unlock" : "lock";

    fetch(`${proxy}/task/${lockEndpoint}/:id`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ id: task.id }),
    })
      .then((res) => res.json())
      .then((data) => {
        console.log(
          `Task ${isTaskLocked ? "unlocked" : "locked"} successfully:`,
          data
        );
        setIsTaskLocked(!isTaskLocked);
        setNeedsRefetch(true);
        setFeedbackMessage({
          title: "Success",
          description: `Task ${
            isTaskLocked ? "unlocked" : "locked"
          } successfully!`,
        });
      })
      .catch((err) => {
        console.log(err);
        setFeedbackMessage({
          title: "Error",
          description: `Failed to ${isTaskLocked ? "unlock" : "lock"} task.`,
        });
      });
  };

  const handleAssignTask = () => {
    setShowAssignTaskPanel(!showAssignTaskPanel);
  };

  return (
    <Card
      className={`w-full ${isTaskLocked ? "border border-destructive" : ""}`}
    >
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            {isTaskLocked && (
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Lock className="h-4 w-4 text-destructive" />
                  </TooltipTrigger>
                  <TooltipContent>
                    {isTaskOwner
                      ? "This task is locked. Unlock it to make changes."
                      : "This task is locked. Contact your admin to make changes."}
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            )}

            {!isTaskOwner && (
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <ShieldCheck className="h-4 w-4" />
                  </TooltipTrigger>
                  <TooltipContent>
                    You were assigned to this task by your admin.
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            )}
          </div>

          <Dialog open={showTaskDetails} onOpenChange={setShowTaskDetails}>
            <DialogTrigger asChild>
              <div className="flex-grow px-2 cursor-pointer">
                <h3
                  className={`text-xl font-semibold ${
                    isTaskLocked ? "text-muted-foreground" : ""
                  }`}
                >
                  {task.name}
                </h3>
              </div>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[500px]">
              <DialogHeader>
                <DialogTitle className="flex items-center text-primary">
                  {task.name}
                  {isTaskLocked && (
                    <Lock className="h-4 w-4 text-destructive ml-2" />
                  )}
                </DialogTitle>
              </DialogHeader>

              <Separator />
              <div className="pb-1 text-primary">
                <h4 className="text-sm font-semibold mb-2">Description</h4>
                <p className="mb-4 text-sm ">{task.description}</p>

                <div className="text-xs text-muted-foreground">
                  <p>
                    <span className="font-semibold">Created by:</span> @
                    {task.owner_username} ({task.owner_display_name})
                  </p>
                  <p>
                    <span className="font-semibold">Created on:</span>{" "}
                    {getDateWithRelativeTime(task.created_at)}
                  </p>
                </div>
              </div>
            </DialogContent>
          </Dialog>

          <div className="flex items-center space-x-1">
            <Dialog>
              <DialogTrigger asChild>
                <Button
                  variant="ghost"
                  size="sm"
                  disabled={isTaskLocked}
                  className="h-8 w-8 p-0"
                >
                  <SquarePen className="h-4 w-4" />
                  <span className="sr-only">Edit task</span>
                </Button>
              </DialogTrigger>

              {!isTaskLocked && (
                <EditTaskPanel
                  sessionUser={sessionUser}
                  taskToEdit={task}
                  setNeedsRefetch={setNeedsRefetch}
                  setNotificationToAdd={setNotificationToAdd}
                  setFeedbackMessage={setFeedbackMessage}
                />
              )}
            </Dialog>

            <Dialog>
              <DialogTrigger asChild>
                <Button
                  variant="ghost"
                  size="sm"
                  disabled={isTaskLocked}
                  className="h-8 w-8 p-0"
                >
                  {sessionUser.role === "admin" ? (
                    <UserRoundCog className="h-4 w-4" />
                  ) : (
                    <Users className="h-4 w-4" />
                  )}
                  <span className="sr-only">Manage users</span>
                </Button>
              </DialogTrigger>

              {!isTaskLocked && (
                <AssignTaskPanel
                  task={task}
                  setNeedsRefetch={setNeedsRefetch}
                  setFeedbackMessage={setFeedbackMessage}
                  setNotificationToAdd={setNotificationToAdd}
                  sessionUser={sessionUser}
                />
              )}
            </Dialog>

            {sessionUser.role === "admin" && (
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={handleToggleLock}
                      className="h-8 w-8 p-0"
                    >
                      {isTaskLocked ? (
                        <LockOpen className="h-4 w-4" />
                      ) : (
                        <Lock className="h-4 w-4" />
                      )}
                      <span className="sr-only">
                        {isTaskLocked ? "Unlock task" : "Lock task"}
                      </span>
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>
                    {isTaskLocked ? "Unlock this task" : "Lock this task"}
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            )}

            {isTaskOwner && (
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={handleDeleteTask}
                      disabled={isTaskLocked}
                      className="h-8 w-8 p-0"
                    >
                      <Trash className="h-4 w-4" />
                      <span className="sr-only">Delete task</span>
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>Delete this task</TooltipContent>
                </Tooltip>
              </TooltipProvider>
            )}

            <Button
              variant="ghost"
              size="sm"
              onClick={() => setShowTaskDetails(true)}
              className="h-8 w-8 p-0"
            >
              <ExternalLink className="h-4 w-4" />
              <span className="sr-only">View details</span>
            </Button>
          </div>
        </div>
      </CardHeader>

      <CardContent>
        <Separator className="my-2" />
        <CardHeader>
          <CardTitle>
            <div className="grid grid-cols-3 gap-4">
              <div className="flex flex-col items-center space-y-1">
                <span className="text-xs text-muted-foreground">Status</span>
                <Badge
                  variant={getStatusVariant(task.status)}
                  className="flex items-center"
                >
                  {getStatusIcon(task.status)}
                  {getStatusString(task.status)}
                </Badge>
              </div>

              <div className="flex flex-col items-center space-y-1">
                <span className="text-xs text-muted-foreground">Priority</span>
                <Badge
                  variant={getPriorityVariant(task.priority)}
                  className="flex items-center"
                >
                  {getPriorityIcon(task.priority)}
                  {getPriorityString(task.priority)}
                </Badge>
              </div>

              <div className="flex flex-col items-center space-y-1">
                <span className="text-xs text-muted-foreground">Due Date</span>
                <Badge
                  variant={getDateVariant(task.date)}
                  className="flex items-center"
                >
                  <CalendarClock className="h-4 w-4 mr-1" />
                  <span className="whitespace-nowrap text-xs">
                    {getDateWithRelativeTime(task.date, "short")}
                  </span>
                </Badge>
              </div>
            </div>
          </CardTitle>
        </CardHeader>
      </CardContent>
    </Card>
  );
};

export default TaskCard;
