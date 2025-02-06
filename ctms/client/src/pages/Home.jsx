import React, { useState } from "react";
import { Navigate } from "react-router-dom";

const Home = ({ sessionUser, devMode }) => {
  const [searchQuery, setSearchQuery] = useState("");
  const [searchCriteria, setSearchCriteria] = useState("name"); // Default search by name
  const [taskTitle, setTaskTitle] = useState("");
  const [taskDescription, setTaskDescription] = useState("");
  const [taskDate, setTaskDate] = useState(null); // Stores selected date
  const handleAddTask = (e) => {
    e.preventDefault();

    // Format date to YYYY-MM-DD for consistency
    const formattedDate = taskDate ? taskDate.toISOString().split("T")[0] : "";

    const newTask = {
      title: taskTitle,
      description: taskDescription,
      date: formattedDate,
    };
    console.log("Task Added:", newTask);
    // we will function for sending task to back end
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
    <div className="text-center mp5 my-16 animate-fadein">
      <h1 className="title">User Task Management</h1>
      <p>Welcome to your Dashboard</p>
      {/* Serach Task Section */}
      <section className="my-8 p-4">
        <div className="task-bg">
          <h2 className="text-2xl font-bold mb-4 text-white">Search Tasks</h2>
          <div className="flex flex-col md:flex-row gap-4">
            {/* Search Input */}
            <input
              type="text"
              placeholder="Search tasks..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="task"
            />
            {/* Dropdown for Search Criteria */}
            <select
              value={searchCriteria}
              onChange={(e) => setSearchCriteria(e.target.value)}
              className="task"
            >
              <option value="name">Name</option>
              <option value="date">Date</option>
              <option value="status">Status</option>
              <option value="priority">Priority</option>
            </select>
          </div>
        </div>
      </section>

      {/* View Task Section */}
      <section className="my-8 p-4">
        <h2 className="text-2xl font-bold mb-4ti">View Task</h2>
        <div className="task-bg">
          <p>Here you can view all your tasks.</p>
          {/* Add your task list or other components here */}
        </div>
      </section>

      {/* Add Task Section */}
      <section className="my-8 p-4">
        <h2 className="text-2xl font-bold mb-4">Add Task</h2>
        <div className="task-bg">
          <formo nSubmit={handleAddTask}>
            <input
              type="text"
              placeholder="Task Title"
              value={taskTitle}
              onChange={(e) => setTaskTitle(e.target.value)}
              className="task"
            />
            <textarea
              placeholder="Task Description"
              value={taskDescription}
              onChange={(e) => setTaskDescription(e.target.value)}
              className="task"
            ></textarea>
            <button
              type="submit"
              className="bg-blue-800 text-white p-2 rounded"
            >
              Add Task
            </button>
          </formo>
        </div>
      </section>

      {/* Update Task Section */}
      <section className="my-8 p-4">
        <h2 className="text-2xl font-bold mb-4">Update Task</h2>
        <div className="task-bg">
          <form>
            <input type="text" placeholder="Task ID" className="task" />
            <input type="text" placeholder="New Task Title" className="task" />
            <textarea
              placeholder="New Task Description"
              className="task"
            ></textarea>
            <button
              type="submit"
              className="bg-green-500 text-white p-2 rounded"
            >
              Update Task
            </button>
          </form>
        </div>
      </section>
    </div>
  );
};

export default Home;
