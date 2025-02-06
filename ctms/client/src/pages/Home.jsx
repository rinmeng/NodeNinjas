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
  };
  const [tasks, setTasks] = useState([]); // State to manage tasks
  const [taskPriority, setTaskPirioty] = useState("");
  const [updateTaskId, setUpdateTaskId] = useState(null); // Track if a task is being updated
  const [errorMessage, setErrorMessage] = useState(" "); //check if the field is emptçy
  const formattedDate = taskDate ? taskDate.toISOString().split("T")[0] : "";

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
      };
      setTasks((prevTasks) => [...prevTasks, newTask]);
      console.log("Task Added:", newTask);
    }

    // Reset the form
    setTaskTitle("");
    setTaskDescription("");
    setTaskPirioty("");
    setTaskDate("");
    setUpdateTaskId(null);
    setErrorMessage("");
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
  const filteredTasks = tasks.filter((task) =>
    task[searchCriteria]
      ?.toString()
      .toLowerCase()
      .includes(searchQuery.toLowerCase())
  );

  const newTask = {
    title: taskTitle,
    description: taskDescription,
    date: formattedDate,
  };
  console.log("Task Added:", newTask);
  // we will function for sending task to back end

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

      {/* Search Task Section */}
      <section className="my-8 p-4">
        <div className="task-bg">
          <h2 className="text-2xl font-bold mb-4 text-white">Search Tasks</h2>
          <div className="flex flex-col md:flex-row gap-4">
            <input
              type="text"
              placeholder="Search tasks..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="bg-sky-600 p-2 rounded w-full"
            />
            <select
              value={searchCriteria}
              onChange={(e) => setSearchCriteria(e.target.value)}
              className="bg-sky-600 p-2 rounded w-full"
            >
              <option value="title">Title</option>
              <option value="priority">Priority</option>
              <option value="date">Date</option>
              <option value="description">Description</option>
            </select>
          </div>
        </div>
      </section>

      {/* View Task Section */}
      <section className="my-8 p-4">
        <h2 className="text-2xl font-bold mb-4">Task View Dashboard</h2>
        <div className="task-bg">
          {filteredTasks.length > 0 ? (
            filteredTasks.map((task) => (
              <div
                key={task.id}
                className="flex justify-between items-center bg-sky-600 p-4 mb-2 rounded"
              >
                <div>
                  <p>
                    <strong>Title:</strong> {task.title}
                  </p>
                  <p>
                    <strong>Priority:</strong> {task.priority}
                  </p>
                  <p>
                    <strong>Date:</strong> {task.date}
                  </p>
                  <p>
                    <strong>Description:</strong> {task.description}
                  </p>
                </div>
                <div>
                  <button
                    onClick={() => handleEditTask(task.id)}
                    className="bg-yellow-500 text-white p-2 rounded mr-2"
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => handleDeleteTask(task.id)}
                    className="bg-red-500 text-white p-2 rounded"
                  >
                    Delete
                  </button>
                </div>
              </div>
            ))
          ) : (
            <p>No tasks found matching the criteria.</p>
          )}
        </div>
      </section>

      {/* Add/Update Task Section */}
      <section className="my-8 p-4">
        <h2 className="text-2xl font-bold mb-4">
          {updateTaskId ? "Update Task" : "Add Task"}
        </h2>
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
              className={`${
                updateTaskId ? "bg-yellow-500" : "bg-blue-800"
              } text-white p-2 rounded mt-5`}
            >
              {updateTaskId ? "Update Task" : "Add Task"}
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
