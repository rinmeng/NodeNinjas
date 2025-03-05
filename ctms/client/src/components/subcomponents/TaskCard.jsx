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
} from "lucide-react";
import EditTaskPanel from "../EditTaskPanel";
import proxy from "../../utils/proxy";
import IconButton from "./IconButton";
import AssignTaskPanel from "../AssignTaskPanel";
import { Dialog, DialogTrigger } from "@/components/ui/dialog";

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
  const [isExpanded, setIsExpanded] = useState(false); // Add this state to track expanded state
  const [showAssignTaskPanel, setShowAssignTaskPanel] = useState(false);

  const isTaskOwner = task.owner_id === sessionUser.id;

  useEffect(() => {
    // Update the local state when the task prop changes
    setIsTaskLocked(task.is_locked || false);
  }, [task.is_locked]);

  const handleEditTask = () => {
    if (isTaskLocked) {
      if (sessionUser.role === "admin") {
        setFeedbackMessage("Task is locked. Unlock it first to edit.");
      } else {
        setFeedbackMessage(
          "Task is locked. Contact your admin to make changes."
        );
      }
      return;
    }
    setShowUpdateTaskPanel(!showUpdateTaskPanel);
  };

  const toggleExpanded = () => {
    setIsExpanded(!isExpanded);
  };

  const getDateWithRelativeTime = (dateString) => {
    if (!dateString) return "Invalid Date"; // Handle empty values safely

    // Ensure date is parsed correctly
    const taskDate = new Date(dateString);
    if (isNaN(taskDate.getTime())) return "Invalid Date"; // Handle parsing errors

    const now = new Date();
    const diffInMs = taskDate.getTime() - now.getTime();
    const diffInDays = Math.ceil(diffInMs / (1000 * 60 * 60 * 24));

    // Format the date properly
    const formattedDate = taskDate.toLocaleDateString("en-CA", {
      weekday: "short",
      month: "numeric",
      day: "numeric",
      year: "numeric",
    });

    if (diffInDays === 0) return `${formattedDate} (Today)`;
    if (diffInDays === 1) return `${formattedDate} (Tomorrow)`;
    if (diffInDays > 1) return `${formattedDate} (In ${diffInDays} days)`;
    if (diffInDays < 0)
      return `${formattedDate} (${Math.abs(diffInDays)} days ago)`;

    return formattedDate;
  };

  const getStatusColor = (status) => {
    const formattedStatus = status.replace(/\s+/g, "").toLowerCase();
    switch (formattedStatus) {
      case "pending":
        return "pill-grey";
      case "in_progress":
        return "pill-blue";
      case "completed":
        return "pill-green";
      default:
        return "pill-grey";
    }
  };

  const getStatusIcon = (status) => {
    const formattedStatus = status.replace(/\s+/g, "").toLowerCase();
    switch (formattedStatus) {
      case "pending":
        return <CircleDashed size={20} />;
      case "in_progress":
        return <CircleDotDashed size={20} />;
      case "completed":
        return <CircleCheck size={20} />;
      default:
        return <CircleEllipsis size={20} />;
    }
  };

  const getPriorityIcon = (priority) => {
    const formattedPriority = priority.replace(/\s+/g, "").toLowerCase();
    switch (formattedPriority) {
      case "high":
        return <ClockAlert size={20} />;
      case "medium":
        return <ClockArrowUp size={20} />;
      case "low":
        return <ClockArrowDown size={20} />;
      default:
        return <Clock size={20} />;
    }
  };

  const getPriorityColor = (priority) => {
    const formattedPriority = priority.replace(/\s+/g, "").toLowerCase();
    switch (formattedPriority) {
      case "high":
        return "pill-red";
      case "medium":
        return "pill-yellow";
      case "low":
        return "pill-grey";
      default:
        return "pill-grey";
    }
  };

  const getDateColor = (date) => {
    const now = new Date();
    const taskDate = new Date(date);
    const diff = taskDate.getTime() - now.getTime();
    const diffDays = Math.ceil(diff / (1000 * 60 * 60 * 24));

    if (diffDays < 0) {
      return "pill-grey";
    } else if (diffDays === 0) {
      return "pill-red";
    } else if (diffDays === 1) {
      return "pill-yellow";
    } else {
      return "pill-green";
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
        setFeedbackMessage("Task is locked. Unlock it first to delete.");
      } else {
        setFeedbackMessage(
          "Task is locked. Contact your admin to make changes."
        );
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
        setFeedbackMessage("Task deleted successfully!");
      })
      .catch((err) => {
        console.log(err);
        setFeedbackMessage(err.message || "Failed to delete task.");
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
        setFeedbackMessage(
          `Task ${isTaskLocked ? "unlocked" : "locked"} successfully!`
        );
      })
      .catch((err) => {
        console.log(err);
        setFeedbackMessage(err.message || "Failed to lock/unlock task.");
      });
  };

  const handleAssignTask = () => {
    setShowAssignTaskPanel(!showAssignTaskPanel);
  };

  return (
    <div
      key={task.id}
      className={`border-2 mb-10 ${
        isTaskLocked ? "border-red-500" : "border-gray-600"
      } m-auto w-full md:w-3/5 flex flex-col
      bg-gradient-to-r from-slate-700 via-slate-800 to-slate-900 p-4 md:p-6 
      rounded-xl shadow-lg hover:shadow-2xl ${
        isTaskLocked ? "opacity-70" : "opacity-100"
      }}
      }`}
    >
      <div className="flex flex-col space-y-4">
        <div className="flex justify-between items-center">
          {/* Lock/Unlock button */}
          {isTaskLocked && (
            <div className="flex items-center">
              <IconButton
                icon={<Lock size={20} className="text-red-500" />}
                tooltip="This task is locked. Contact your admin to make changes."
              />
              {!isTaskOwner && (
                <div className="border-r-2 border-slate-500 h-6"></div>
              )}
            </div>
          )}
          {!isTaskOwner && (
            <IconButton
              icon={<ShieldCheck size={20} className="text-white" />}
              tooltip="You were assigned to this task by your admin."
            />
          )}

          {/* Title and toggle */}
          <div className="group flex-grow">
            <div
              onClick={toggleExpanded}
              className="flex items-center justify-between cursor-pointer w-full"
            >
              <h1
                className={`text-2xl font-semibold flex-grow ${
                  isTaskLocked ? "text-slate-300" : "text-white"
                } break-all overflow-hidden text-left`}
              >
                {task.name}
              </h1>
              <div className="flex items-center space-x-2">
                <div className="">
                  {isExpanded ? (
                    <IconButton
                      onClick={toggleExpanded}
                      icon={<ChevronUp size={20} />}
                      color="text-white hover:bg-slate-600"
                      tooltip="Collapse task details"
                    />
                  ) : (
                    <IconButton
                      icon={<ChevronDown size={20} />}
                      color="text-white hover:bg-slate-600"
                      tooltip="Expand task details"
                    />
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Action buttons */}
          <div className="flex items-center">
            <Dialog>
              <DialogTrigger asChild>
                <IconButton
                  icon={<SquarePen size={20} />}
                  tooltip="Edit this task"
                  isDisabled={isTaskLocked}
                  disabled={isTaskLocked}
                  color={"hover:bg-blue-500 hover:text-white"}
                />
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

            <div>
              <Dialog>
                <DialogTrigger asChild>
                  <IconButton
                    icon={
                      sessionUser.role === "admin" ? (
                        <UserRoundCog size={20} />
                      ) : (
                        <Users size={20} />
                      )
                    }
                    tooltip={
                      sessionUser.role === "admin"
                        ? "Manage assigned users"
                        : "View assigned users"
                    }
                    isDisabled={isTaskLocked}
                    color={"hover:bg-blue-500 hover:text-white"}
                  />
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
                <IconButton
                  onClick={handleToggleLock}
                  // Show the OPPOSITE icon on hover to indicate the action that will happen
                  icon={
                    isTaskLocked ? <Lock size={20} /> : <LockOpen size={20} />
                  }
                  hoverIcon={
                    isTaskLocked ? <LockOpen size={20} /> : <Lock size={20} />
                  }
                  tooltip={isTaskLocked ? "Unlock this task" : "Lock this task"}
                  color={`${
                    isTaskLocked
                      ? "hover:bg-green-500 hover:text-white"
                      : "hover:bg-red-500 hover:text-white"
                  }`}
                />
              )}
            </div>
            {isTaskOwner && (
              <IconButton
                onClick={handleDeleteTask}
                icon={<Trash size={20} />}
                tooltip="Delete this task"
                isDisabled={isTaskLocked}
                disabled={isTaskLocked}
                color="hover:bg-red-500 hover:text-white"
              />
            )}
          </div>
        </div>

        <div className="border-b border-slate-600 my-2"></div>

        <div className="grid grid-cols-3 gap-4 ">
          {/* Status */}
          <div className="flex flex-col space-y-1">
            <h1 className="text-sm text-slate-400">Status</h1>
            <div
              className={`flex justify-center items-center text-md space-x-2 ${getStatusColor(
                task.status
              )}`}
            >
              {getStatusIcon(task.status)}
              <p> {getStatusString(task.status)}</p>
            </div>
          </div>

          {/* Priority */}
          <div className="flex flex-col space-y-1">
            <h1 className="text-sm text-slate-400">Priority</h1>
            <div
              className={`flex justify-center items-center text-md space-x-2 ${getPriorityColor(
                task.priority
              )}`}
            >
              {getPriorityIcon(task.priority)}
              <p> {getPriorityString(task.priority)}</p>
            </div>
          </div>

          {/* Due Date */}
          <div className="flex flex-col space-y-1">
            <h1 className="text-sm text-slate-400">Due Date</h1>
            <p
              className={`text-md text-center flex flex-wrap justify-center items-center ${getDateColor(
                task.date
              )}`}
            >
              <CalendarClock size={20} className="mr-2 flex-shrink-0" />
              <span className="break-words">
                {getDateWithRelativeTime(task.date)}
              </span>
            </p>
          </div>
        </div>

        {/* Description */}
        {isExpanded && (
          <div>
            <div className="border-b border-slate-600 my-2"></div>
            <p
              className={`text-md text-slate-300 mb-4 transition-all break-words whitespace-normal ${
                isTaskLocked ? "select-none" : ""
              }`}
            >
              {task.description}
            </p>
            <p>
              <span className="text-slate-400">Created by:</span> @
              {task.owner_username} ({task.owner_display_name})
            </p>
            <p>
              <span className="text-slate-400">Created on:</span>{" "}
              {getDateWithRelativeTime(task.created_at)}
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default TaskCard;
