import { ListPlus, X } from "lucide-react";
import React, { useState } from "react";
import IconizedButton from "./subcomponents/IconizedButton";

import proxy from "../utils/proxy";

const AddTaskPanel = ({
  showAddTaskPanel,
  setShowAddTaskPanel,
  setFeedbackMessage,
  sessionUser,
  setNeedsRefetch,
  notifications,
  setNotifications,
}) => {
  const today = new Date().toISOString().split("T")[0];
  const [task, setTask] = useState({
    title: "",
    date: today,
    description: "",
    status: "pending",
    priority: "low",
  });

  const handleAddTask = async (e) => {
    e.preventDefault();
    try {
      await addTaskToDatabase();
    } catch (error) {
      console.error("Failed to add task:", error);
      setFeedbackMessage(error.message || "Failed to add task.");
    }
  };

  const addTaskToDatabase = async () => {
    if (!task.title || !task.date || !task.priority || !task.status) {
      throw new Error("Please fill in all required fields.");
    }
    const assignedUserIDs = [];
    // check if user is signed in
    if (sessionUser) {
      assignedUserIDs.push(sessionUser.id);
    }
    // make post request to add task to database
    fetch(`${proxy}/task/add`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        name: task.title,
        date: task.date,
        description: task.description,
        priority: task.priority,
        status: task.status,
        assigned_users: assignedUserIDs,
      }),
      credentials: "include",
    })
      .then((addResponse) => {
        if (!addResponse.ok) {
          return addResponse.json().then((err) => {
            throw new Error(err.message || "Failed to add task.");
          });
        }
        return addResponse.json();
      })
      .then(() => {
        setTask({
          title: "",
          description: "",
          date: today,
          priority: "low",
          status: "pending",
        });
        if (!sessionUser) {
          setFeedbackMessage(
            "Task will be added with no asignees, please sign in to assign users to the task."
          );
        } else {
          setFeedbackMessage("Task added successfully!");
        }

        // Send a notification to the user
        const newNotification = {
          id: notifications.length + 1,
          message: `Task "${task.title}" added successfully!`,
          description: task.description,
          timestamp: new Date().toISOString(),
          read: false,
        };

        setNotifications([...notifications, newNotification]);
        setNeedsRefetch(true);

        setShowAddTaskPanel(false);
      })
      .catch((err) => {
        setFeedbackMessage(err.message);
        // dont close the add task panel
      });
  };
  return (
    <div
      className={`${
        showAddTaskPanel ? "block" : "hidden"
      } fixed top-0 left-0 w-full h-full bg-black bg-opacity-50 z-50`}
    >
      <div
        className="fixed top-1/2 left-1/2 transform -translate-x-1/2 
        -translate-y-1/2 bg-slate-900 
      rounded-xl p-8 w-1/2 h-auto flex flex-col space-y-4 border-2 border-slate-600"
      >
        <div className="flex flex-row justify-between items-center">
          <div className="title-sm">Add Task</div>
          <button
            onClick={() => setShowAddTaskPanel(false)}
            className="p-1 hover:bg-gray-100 hover:text-black rounded-full t200e"
          >
            <X size={30} />
          </button>
        </div>
        <div className="border-b border-slate-600 my-4"></div>

        <form className="flex flex-col space-y-4">
          <h1 className="text-md">Title</h1>
          <input
            type="text"
            placeholder="Task Title"
            className="forms text-left"
            value={task.title}
            onChange={(e) => setTask({ ...task, title: e.target.value })}
            maxLength="255"
          />

          <h1 className="text-md">Description</h1>
          <textarea
            placeholder="Task Description"
            className="forms text-left"
            value={task.description}
            onChange={(e) => setTask({ ...task, description: e.target.value })}
          />

          <div className="flex flex-row justify-between space-x-4">
            <div className="flex flex-col space-y-2 w-full">
              <h1 className="text-md">Due Date</h1>
              <input
                type="date"
                className="forms"
                value={task.date}
                onChange={(e) => setTask({ ...task, date: e.target.value })}
              />
            </div>

            <div className="flex flex-col space-y-2 w-full">
              <h1 className="text-md">Priority</h1>
              <select
                className="forms"
                value={task.priority}
                onChange={(e) => setTask({ ...task, priority: e.target.value })}
              >
                <option value="low">Low</option>
                <option value="medium">Medium</option>
                <option value="high">High</option>
              </select>
            </div>

            <div className="flex flex-col space-y-2 w-full">
              <h1 className="text-md">Status</h1>
              <select
                className="forms"
                value={task.status}
                onChange={(e) => setTask({ ...task, status: e.target.value })}
              >
                <option value="pending">Pending</option>
                <option value="in_progress">In Progress</option>
                <option value="completed">Completed</option>
              </select>
            </div>
          </div>

          <div className="border-b border-slate-600"></div>
          <div className="flex justify-center items-center">
            <IconizedButton
              icon={<ListPlus size={24} className="ml-2" />}
              text="Add Task"
              onClick={handleAddTask}
              btnStyle="btn-blue"
            />
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddTaskPanel;
