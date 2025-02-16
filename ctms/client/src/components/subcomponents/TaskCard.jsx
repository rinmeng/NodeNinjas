import React, { useState } from "react";
import {
  CircleDashed,
  CircleDot,
  CircleDotDashed,
  CircleEllipsis,
  Clock,
  ClockAlert,
  ClockArrowDown,
  ClockArrowUp,
  ChevronDown,
  ChevronUp,
} from "lucide-react";

const TaskCard = ({ task }) => {
  const [isDescriptionVisible, setIsDescriptionVisible] = useState(false);

  const getDateWithRelativeTime = (dateString) => {
    if (!dateString) return "Invalid Date"; // Handle empty values safely

    // Ensure date is parsed correctly
    const taskDate = new Date(dateString);
    if (isNaN(taskDate.getTime())) return "Invalid Date"; // Handle parsing errors

    const now = new Date();
    const diffInMs = taskDate.getTime() - now.getTime();
    const diffInDays = Math.ceil(diffInMs / (1000 * 60 * 60 * 24));

    // Format the date properly
    const formattedDate = taskDate.toLocaleDateString("en-US", {
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
      case "inprogress":
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
      case "inprogress":
        return <CircleDotDashed size={20} />;
      case "completed":
        return <CircleDot size={20} />;
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

  return (
    <div
      key={task.id}
      className="border-2 border-gray-600 m-auto w-1/2 flex flex-col bg-gradient-to-r from-slate-700 via-slate-800 to-slate-900 p-6 rounded-xl shadow-lg hover:shadow-2xl t200e"
    >
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
          <p className={`text-md text-center ${getDateColor(task.date)}`}>
            {getDateWithRelativeTime(task.date)}
          </p>
        </div>
      </div>

      <div className="border-b border-slate-600 my-4"></div>
      <div>
        <div
          className="flex items-center justify-between cursor-pointer group"
          onClick={() => setIsDescriptionVisible(!isDescriptionVisible)}
        >
          <h1 className="text-2xl font-semibold text-white mb-2">
            {task.name}
          </h1>
          <button className="p-1 rounded-full hover:bg-slate-700 transition-colors">
            {isDescriptionVisible ? (
              <ChevronUp
                className="text-slate-400 group-hover:text-white transition-colors"
                size={20}
              />
            ) : (
              <ChevronDown
                className="text-slate-400 group-hover:text-white transition-colors"
                size={20}
              />
            )}
          </button>
        </div>
        {isDescriptionVisible && (
          <p className="text-md text-slate-300 mb-4 transition-all">
            {task.description}
          </p>
        )}
      </div>
    </div>
  );
};

export default TaskCard;
