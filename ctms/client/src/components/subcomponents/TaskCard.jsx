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
  CalendarClock,
  SquarePen,
  Trash,
} from "lucide-react";
import EditTaskPanel from "../EditTaskPanel";
import proxy from "../../utils/proxy";

const TaskCard = ({ task, sessionUser, setNeedsRefetch }) => {
  const [isDescriptionVisible, setIsDescriptionVisible] = useState(false);

  const [showUpdateTaskPanel, setShowUpdateTaskPanel] = useState(false);

  const handleEditTask = () => {
    setShowUpdateTaskPanel(!showUpdateTaskPanel);
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
      case "in_progress":
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

  const handleDeleteTask = () => {
    // Implement delete task functionality here
    fetch(`${proxy}/task/delete/:id`, {
      method: "DELETE",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ id: task.id }),
    })
      .then((res) => res.json())
      .then((data) => {
        console.log(data);
        setNeedsRefetch(true);
      })
      .catch((err) => console.log(err));
  };

  return (
    <div
      key={task.id}
      className="border-2 border-gray-600 m-auto w-1/2 flex flex-col
      bg-gradient-to-r from-slate-700 via-slate-800 to-slate-900 p-6 
      rounded-xl shadow-lg hover:shadow-2xl t200e"
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
          <p
            className={`text-md text-center flex justify-center ${getDateColor(
              task.date
            )}`}
          >
            <CalendarClock size={20} className="mr-2" />
            {getDateWithRelativeTime(task.date)}
          </p>
        </div>
      </div>

      <div className="border-b border-slate-600 my-4"></div>
      <div>
        <div className="flex justify-between items-center">
          <div className="flex items-center justify-between cursor-pointer group flex-grow">
            <h1
              className="text-2xl font-semibold text-white mb-2 flex-grow"
              onClick={() => setIsDescriptionVisible(!isDescriptionVisible)}
            >
              {task.name}
            </h1>
            <div className="flex items-center space-x-2">
              <button
                className="p-2 rounded-full group-hover:bg-slate-700 t200e text-slate-400 group-hover:text-white"
                onClick={() => setIsDescriptionVisible(!isDescriptionVisible)}
              >
                {isDescriptionVisible ? (
                  <ChevronUp size={20} />
                ) : (
                  <ChevronDown size={20} />
                )}
              </button>
            </div>
          </div>
          <div className="p-2 rounded-full hover:bg-slate-700 t200e text-slate-500 hover:text-white cursor-pointer">
            <SquarePen onClick={handleEditTask} size={20} />
          </div>
          <div
            onClick={handleDeleteTask}
            className="p-2 rounded-full hover:bg-slate-700 t200e text-slate-500 hover:text-white cursor-pointer"
          >
            <Trash size={20} />
          </div>
        </div>
        {isDescriptionVisible && (
          <p className="text-md text-slate-300 mb-4 transition-all">
            {task.description}
          </p>
        )}
      </div>
      <EditTaskPanel
        sessionUser={sessionUser}
        taskToEdit={task}
        isOpen={showUpdateTaskPanel}
        onClose={handleEditTask}
        setNeedsRefetch={setNeedsRefetch}
      />
    </div>
  );
};

export default TaskCard;
