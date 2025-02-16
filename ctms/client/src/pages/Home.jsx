import React, { useState } from "react";
import { Navigate } from "react-router-dom";
import {
  Search,
  Filter,
  RefreshCw,
  CircleGauge,
  ClockAlert,
  Pickaxe,
  AlarmClockCheck,
  CalendarClock,
  ClockArrowDown,
  ClockArrowUp,
  Clock,
  CircleDashed,
  CircleDotDashed,
  CircleDot,
  CircleEllipsis,
  SquarePen,
  Trash,
  ArrowDownAZ,
  ArrowUpAZ,
  CalendarArrowDown,
  CalendarArrowUp,
  FilterX,
  ChevronsUpDown,
  Cross,
  X,
} from "lucide-react";
import TaskItem from "../components/subcomponents/TaskItem";

const Home = ({ sessionUser, devMode, notifications, setNotifications }) => {
  // Create dummy tasks
  const [tasks, setTasks] = useState([
    {
      id: 1,
      title: "ABC",
      description: "This is a description for Task 1 blah blah blah",
      priority: "High",
      date: "2025-03-01",
      status: "Pending",
    },
    {
      id: 2,
      title: "CBCD",
      description: "This is Task 2 ",
      priority: "Medium",
      date: "2025-03-18",
      status: "In Progress",
    },
    {
      id: 3,
      title: "BCD",
      description: "This is for Task 3",
      priority: "Low",
      date: "2025-03-02",
      status: "Completed",
    },
    {
      id: 4,
      title: "BCD",
      description: "This is for Task 3",
      priority: "Low",
      date: "2025-02-13",
      status: "Completed",
    },
    {
      id: 5,
      title: "BCD",
      description: "This is for Task 3",
      priority: "Low",
      date: "2025-02-16",
      status: "Completed",
    },
  ]);
  const [searchQuery, setSearchQuery] = useState("");
  const [searchCriteria, setSearchCriteria] = useState("priority"); // Default search by priority
  const [taskTitle, setTaskTitle] = useState("");
  const [taskDescription, setTaskDescription] = useState("");
  const [taskPriority, setTaskPirioty] = useState("");
  const [taskDate, setTaskDate] = useState("");
  const [updateTaskId, setUpdateTaskId] = useState(null); // Track if a task is being updated
  const [errorMessage, setErrorMessage] = useState(" "); //check if the field is empty
  const [checkStatus, setCheckStatus] = useState("");

  const [sortTitleAsc, setSortTitleAsc] = useState(null);
  const [sortDateAsc, setSortDateAsc] = useState(null);
  const [sortPriorityAsc, setSortPriorityAsc] = useState("");
  const [sortStatusAsc, setSortStatusAsc] = useState("");

  const handleStatusChange = (id, newStatus) => {
    switch (newStatus) {
      case "pending":
        newStatus = "Pending";
        break;
      case "inprogress":
        newStatus = "In Progress";
        break;
      case "completed":
        newStatus = "Completed";
        break;
      default:
        newStatus = "pending";
        break;
    }

    setTasks((prevTasks) =>
      prevTasks.map((task) =>
        task.id === id ? { ...task, status: newStatus } : task
      )
    );
  };

  // Add or Update Task
  const handleAddOrUpdateTask = (e) => {
    e.preventDefault();
    if (!taskDate || !taskTitle || !taskDescription || !taskPriority) {
      setErrorMessage("Please of your field is empy");
      return;
    }

    if (updateTaskId) {
      // Update an existing task
      setTasks((prevTasks) =>
        prevTasks.map((task) =>
          task.id === updateTaskId
            ? {
                ...task,
                title: taskTitle,
                description: taskDescription,
                priority: taskPriority,
                date: taskDate,
                status: checkStatus,
              }
            : task
        )
      );
      console.log(`Task Updated: ${updateTaskId}`);
    } else {
      // Add a new task
      const newTask = {
        id: Date.now(), // Unique ID
        title: taskTitle,
        description: taskDescription,
        priority: taskPriority,
        date: taskDate,
        status: "Pending",
      };
      setTasks((prevTasks) => [...prevTasks, newTask]);
      console.log("Task Added:", newTask);
    }

    const action = updateTaskId ? "updated" : "added";
    // Create a new notification
    const newNotification = {
      id: Date.now(),
      message: `Task "${taskTitle}" ${action} successfully`,
      description: taskDescription,
      timestamp: new Date().toISOString(),
      read: false, // Add read status
    };

    // This should trigger a state update
    setNotifications((prev) => [newNotification, ...prev]);

    // Reset the form
    setTaskTitle("");
    setTaskDescription("");
    setTaskPirioty("");
    setTaskDate("");
    setUpdateTaskId(null);
    setErrorMessage("");
    setCheckStatus("Pending");
  };

  // Populate task data for updating
  const handleEditTask = (id) => {
    const taskToEdit = tasks.find((task) => task.id === id);
    if (taskToEdit) {
      setTaskTitle(taskToEdit.title);
      setTaskDescription(taskToEdit.description);
      setTaskPirioty(taskToEdit.priority);
      setTaskDate(taskToEdit.date);
      setUpdateTaskId(taskToEdit.id);
    }
  };

  // Delete a specific task
  const handleDeleteTask = (id) => {
    setTasks((prevTasks) => prevTasks.filter((task) => task.id !== id));
  };

  // Filter tasks based on search criteria
  const filteredTasks = tasks.filter((task) => {
    const query = searchQuery.toLowerCase();

    if (!searchQuery) return true; // If search query is empty, show all tasks

    return (
      task.title.toLowerCase().includes(query) || // Match Title
      task.priority.toLowerCase().includes(query) || // Match Priority
      task.date.includes(query) || // Match Date (Exact)
      task.status.toLowerCase().includes(query) // Match Status
    );
  });

  const filterTaskByTitle = () => {
    if (sortTitleAsc === null) {
      setSortTitleAsc(true);
    } else if (sortTitleAsc === true) {
      setSortTitleAsc(false);
    } else {
      setSortTitleAsc(null);
    }
  };

  const filterTaskByDate = () => {
    if (sortDateAsc === null) {
      setSortDateAsc(true);
    } else if (sortDateAsc === true) {
      setSortDateAsc(false);
    } else {
      setSortDateAsc(null);
    }
  };

  const filterTaskByPriority = () => {
    let sortedTasks = [...filteredTasks];

    if (sortPriorityAsc === "") {
      setSortPriorityAsc("high");
      // only show high priority tasks
      sortedTasks.filter((task) => task.priority === "high");
    } else if (sortPriorityAsc === "high") {
      setSortPriorityAsc("medium");
      // only show medium priority tasks
      sortedTasks.filter((task) => task.priority === "Medium");
    } else if (sortPriorityAsc === "medium") {
      setSortPriorityAsc("low");
      // only show low priority tasks
      sortedTasks.filter((task) => task.priority === "Low");
    } else {
      setSortPriorityAsc("");
      // show all tasks
      sortedTasks = filteredTasks;
    }
    setTasks(sortedTasks);
  };

  const removeAllFilters = () => {
    setSortTitleAsc(null);
    setSortDateAsc(null);
    setSortPriorityAsc("");
    setSortStatusAsc("");
  };

  const filterTaskByStatus = () => {
    if (sortStatusAsc === "") {
      setSortStatusAsc("pending");
    } else if (sortStatusAsc === "pending") {
      setSortStatusAsc("inprogress");
    } else if (sortStatusAsc === "inprogress") {
      setSortStatusAsc("completed");
    } else {
      setSortStatusAsc("");
    }
  };

  const getDateWithRelativeTime = (date) => {
    const now = new Date();
    const taskDate = new Date(date);
    const diff = taskDate.getTime() - now.getTime();
    const diffDays = Math.ceil(diff / (1000 * 60 * 60 * 24));

    if (diffDays < 0) {
      return date + ` (Due ${Math.abs(diffDays)} days ago)`;
    } else if (diffDays === 0) {
      return date + " (Due Today)";
    } else if (diffDays === 1) {
      return date + " (Due Tomorrow)";
    } else {
      return date + ` (Due in ${diffDays} days)`;
    }
  };

  const getStatusColor = (status) => {
    // Remove all spaces and convert to lowercase
    const formattedStatus = status.replace(/\s+/g, "").toLowerCase();

    switch (formattedStatus) {
      case "pending":
        return "bg-yellow-500 text-white";
      case "inprogress":
        return "bg-blue-500 text-white";
      case "completed":
        return "bg-green-500 text-white";
      default:
        return "bg-gray-500 text-white";
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
        return "bg-red-500 text-white";
      case "medium":
        return "bg-yellow-500 text-white";
      case "low":
        return "bg-gray-500 text-white";
      default:
        return "bg-gray-500 text-white";
    }
  };

  if (!sessionUser && !devMode) {
    return (
      <div className="mp5 my-16 animate-fadein">
        <h1 className="title text-center">Welcome to your Dashboard!</h1>
        <p className="text-center text-xl">
          Please log in to view this page, or enable <code>devMode</code> to
          bypass authentication in <code>App.jsx</code>
        </p>
        {/* redirect to /login */}
        <Navigate to="/login" />
      </div>
    );
  }
  return (
    <div className="text-center py-14 animate-fadein bg-slate-900">
      {/* Search Task Section */}
      <div className="my-8 p-4">
        <div className="task-bg rounded-full">
          <div className="flex flex-col md:flex-row m-auto justify-center items-center space-x-4">
            <div className="w-1/2 relative">
              <Search
                size={20}
                className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500"
              />
              <input
                type="text"
                placeholder="Search for tasks..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="forms w-full pl-10 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <button onClick={() => setSearchQuery("")}>
                <X
                  size={25}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-white t200e"
                />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* View Task Section */}
      <div className="mp5">
        <div className="task-bg">
          <h2 className="title mb-4">Task Dashboard</h2>
          <div className="my-2">
            {/* Filter options */}
            <div
              className="flex justify-center items-center space-x-4 border-4 
            border-gray-700 px-14 py-4 rounded-full w-fit m-auto"
            >
              <button onClick={removeAllFilters} className="pill-red">
                <FilterX size={20} />
              </button>
              {/* Title Filter */}
              <button
                onClick={filterTaskByTitle}
                className={`flex items-center space-x-2 ${
                  sortTitleAsc === null
                    ? "pill-grey border-slate-700 border-2"
                    : "pill-green border-white border-2"
                }`}
              >
                {sortTitleAsc ? <ArrowDownAZ size={20} /> : ""}
                {sortTitleAsc === false ? <ArrowUpAZ size={20} /> : ""}
                {sortTitleAsc === null ? <ChevronsUpDown size={20} /> : ""}
                <div>Title</div>
              </button>
              {/* Date Filter */}
              <button
                onClick={filterTaskByDate}
                className={`flex items-center space-x-2  ${
                  sortDateAsc === null
                    ? "pill-grey border-slate-700 border-2"
                    : "pill-green border-white border-2"
                }`}
              >
                {sortDateAsc ? <CalendarArrowUp size={20} /> : ""}
                {sortDateAsc === false ? <CalendarArrowDown size={20} /> : ""}
                {sortDateAsc === null ? <ChevronsUpDown size={20} /> : ""}

                <div>Date</div>
              </button>
              {/* Priority Filter */}
              <button
                onClick={filterTaskByPriority}
                className={`flex items-center space-x-2  ${
                  sortPriorityAsc === ""
                    ? "pill-grey border-slate-700 border-2"
                    : "pill-green border-white border-2"
                }`}
              >
                {sortPriorityAsc === "high" ? <ClockAlert size={20} /> : ""}
                {sortPriorityAsc === "medium" ? <ClockArrowUp size={20} /> : ""}
                {sortPriorityAsc === "low" ? <ClockArrowDown size={20} /> : ""}
                {sortPriorityAsc === "" ? <ChevronsUpDown size={20} /> : ""}
                <div>Priority</div>
              </button>
              {/* Status Filter */}
              <button
                onClick={filterTaskByStatus}
                className={`flex items-center space-x-2 ${
                  sortStatusAsc === ""
                    ? "pill-grey border-slate-700 border-2"
                    : "pill-green border-white border-2"
                }`}
              >
                {sortStatusAsc === "pending" ? <CircleDashed size={20} /> : ""}
                {sortStatusAsc === "inprogress" ? (
                  <CircleDotDashed size={20} />
                ) : (
                  ""
                )}
                {sortStatusAsc === "completed" ? <CircleDot size={20} /> : ""}
                {sortStatusAsc === "" ? <ChevronsUpDown size={20} /> : ""}
                <div>Status</div>
              </button>
            </div>
          </div>
          <div className="border-b-2 border-gray-700 mb-4 pb-4"></div>

          {filteredTasks.length > 0 ? (
            filteredTasks.map((task) => (
              <TaskItem
                key={task.id}
                task={task}
                handleDeleteTask={handleDeleteTask}
                handleStatusChange={handleStatusChange}
                handleEditTask={handleEditTask}
                getDateWithRelativeTime={getDateWithRelativeTime}
                getPriorityColor={getPriorityColor}
                getPriorityIcon={getPriorityIcon}
                getStatusColor={getStatusColor}
                getStatusIcon={getStatusIcon}
              />
            ))
          ) : (
            <p>No tasks found matching the criteria.</p>
          )}
        </div>
      </div>

      {/* Add/Update Task Section */}
      <div className="my-8 p-4">
        <div className="bg-slate-800 p-6 rounded-2xl shadow-lg">
          <h2 className="text-2xl font-bold mb-6 text-white">
            {updateTaskId ? "Update Task" : "Add Task"}
          </h2>
          <form onSubmit={handleAddOrUpdateTask} className="space-y-6">
            <div className="flex gap-4">
              <input
                type="text"
                placeholder="Task Title"
                value={taskTitle}
                onChange={(e) => setTaskTitle(e.target.value)}
                className="bg-slate-700 text-white placeholder-gray-400 p-4 rounded-xl w-full border border-slate-600 focus:border-blue-500 focus:ring-2 focus:ring-blue-500 transition-all"
              />
              <input
                type="text"
                placeholder="Task Description"
                value={taskDescription}
                onChange={(e) => setTaskDescription(e.target.value)}
                className="bg-slate-700 text-white placeholder-gray-400 p-4 rounded-xl w-full border border-slate-600 focus:border-blue-500 focus:ring-2 focus:ring-blue-500 transition-all"
              />
            </div>

            <div className="flex gap-4">
              <div className="flex flex-col w-full">
                <label className="text-gray-300 mb-2 font-medium">
                  Priority
                </label>
                <select
                  value={taskPriority}
                  onChange={(e) => setTaskPirioty(e.target.value)}
                  className="bg-slate-700 text-white p-4 rounded-xl w-full border border-slate-600 focus:border-blue-500 focus:ring-2 focus:ring-blue-500 transition-all"
                >
                  <option value="">Select Priority</option>
                  <option value="High">High</option>
                  <option value="Medium">Medium</option>
                  <option value="Low">Low</option>
                </select>
              </div>

              <div className="flex flex-col w-full">
                <label className="text-gray-300 mb-2 font-medium">
                  Due Date
                </label>
                <input
                  type="date"
                  value={taskDate}
                  onChange={(e) => setTaskDate(e.target.value)}
                  className="bg-slate-700 text-white p-4 rounded-xl w-full border border-slate-600 focus:border-blue-500 focus:ring-2 focus:ring-blue-500 transition-all"
                />
              </div>
            </div>

            <div className="flex justify-between items-center pt-4">
              <button
                type="submit"
                className={`${
                  updateTaskId
                    ? "bg-yellow-500 hover:bg-yellow-600"
                    : "bg-blue-500 hover:bg-blue-600"
                } text-white px-6 py-3 rounded-xl font-medium transition-all`}
              >
                {updateTaskId ? "Update Task" : "Add Task"}
              </button>

              <select
                value={checkStatus}
                onChange={(e) => setCheckStatus(e.target.value)}
                className="bg-slate-700 text-white p-3 rounded-xl border border-slate-600 focus:border-blue-500 focus:ring-2 focus:ring-blue-500 transition-all w-48"
              >
                <option value="pending">Pending</option>
                <option value="inprogress">In Progress</option>
                <option value="completed">Completed</option>
              </select>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Home;
