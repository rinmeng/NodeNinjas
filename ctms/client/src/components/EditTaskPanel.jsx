import React, { useState } from "react";
import { ClipboardX, Save, X } from "lucide-react";
import IconizedButton from "./subcomponents/IconizedButton";
import proxy from "../utils/proxy";
import IconButton from "./subcomponents/IconButton";

const EditTaskPanel = ({
  sessionUser,
  taskToEdit,
  isOpen,
  onClose,
  setNeedsRefetch,
  notifications,
  setNotifications,
  setFeedbackMessage,
}) => {
  const [taskAfterEdit, setTaskAfterEdit] = useState(taskToEdit);

  const handleOnChange = (e) => {
    const { name, value } = e.target;
    setTaskAfterEdit((prevState) => ({
      ...prevState,
      [name]: value,
    }));
  };

  const handleUpdateTask = () => {
    updateTaskToDatabase();
    onClose();
  };

  const updateTaskToDatabase = async () => {
    // Make a PUT request to update the task in the database
    // using the taskAfterEdit state.
    const assignedUserIDs = [];
    if (sessionUser) {
      assignedUserIDs.push(sessionUser.id);
      console.log("Assigned user IDs:", assignedUserIDs);
    }
    fetch(`${proxy}/task/update/:id`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        id: taskToEdit.id,
        name: taskAfterEdit.name,
        description: taskAfterEdit.description,
        date: taskAfterEdit.date,
        priority: taskAfterEdit.priority,
        status: taskAfterEdit.status,
        assigned_users: assignedUserIDs,
      }),
    })
      .then((response) => response.json())
      .then((data) => {
        console.log("Updated task:", data);
        setNeedsRefetch(true);
        // Add a notification to the notifications state
        const newNotification = {
          id: data.id,
          message: `Task "${data.name}" updated successfully!`,
          description: data.description,
          timestamp: new Date().toISOString(),
        };
        setNotifications([...notifications, newNotification]);
        setFeedbackMessage("Task updated successfully!");
      })
      .catch((error) => {
        console.error("Failed to update task:", error);
        setFeedbackMessage(error.message || "Failed to update task.");
      });
  };

  const getDateFromDateString = (dateString) => {
    if (!dateString) return ""; // Handle empty values safely

    // Ensure date is parsed correctly
    const taskDate = new Date(dateString);
    if (isNaN(taskDate.getTime())) return ""; // Handle parsing errors

    // Format the date as YYYY-MM-DD for input[type="date"]
    const year = taskDate.getFullYear();
    const month = String(taskDate.getMonth() + 1).padStart(2, "0"); // Months are 0-based, so add 1
    const day = String(taskDate.getDate()).padStart(2, "0"); // Pad day with leading zero if needed

    return `${year}-${month}-${day}`;
  };

  if (!isOpen) return null;
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 bg-slate-900 rounded-xl p-8 w-1/2 h-auto flex flex-col space-y-4 border-2 border-slate-600">
        <div className="flex flex-row justify-between items-center">
          <div className="title-sm">Edit Task</div>
          <IconButton
            icon={<X size={30} />}
            onClick={onClose}
            color="hover:bg-white hover:text-slate-950"
          />
        </div>
        <div className="border-b border-slate-600 my-4"></div>

        <form className="flex flex-col space-y-4">
          <h1 className="text-md">Title</h1>
          <input
            type="text"
            placeholder="Task Title"
            className="forms text-left"
            name="name"
            value={taskAfterEdit?.name || ""}
            onChange={handleOnChange}
            maxLength="255"
          />

          <h1 className="text-md">Description</h1>
          <textarea
            placeholder="Task Description"
            className="forms text-left"
            name="description"
            value={taskAfterEdit?.description || ""}
            onChange={handleOnChange}
          />

          <div className="flex flex-row justify-between space-x-4">
            <div className="flex flex-col space-y-2 w-full">
              <h1 className="text-md">Due Date</h1>
              <input
                type="date"
                className="forms"
                name="date"
                value={getDateFromDateString(taskAfterEdit?.date)}
                onChange={handleOnChange}
              />
            </div>

            <div className="flex flex-col space-y-2 w-full">
              <h1 className="text-md">Priority</h1>
              <select
                className="forms"
                name="priority"
                value={taskAfterEdit?.priority || "low"}
                onChange={handleOnChange}
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
                name="status"
                value={taskAfterEdit?.status || "pending"}
                onChange={handleOnChange}
              >
                <option value="pending">Pending</option>
                <option value="in_progress">In Progress</option>
                <option value="completed">Completed</option>
              </select>
            </div>
          </div>

          <div className="border-b border-slate-600"></div>
          <div className="flex justify-end space-x-4">
            <IconizedButton
              text="Cancel"
              icon={<ClipboardX size={24} className="ml-2" />}
              btnStyle="btn-white"
              onClick={onClose}
            />
            <IconizedButton
              text="Save Changes"
              icon={<Save size={24} className="ml-2" />}
              btnStyle="btn-blue"
              onClick={handleUpdateTask}
            />
          </div>
        </form>
      </div>
    </div>
  );
};

export default EditTaskPanel;
