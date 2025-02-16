import React, { useState } from "react";
import { ClipboardX, Save, X } from "lucide-react";
import IconizedButton from "./subcomponents/IconizedButton";
import proxy from "../utils/proxy";

const EditTaskPanel = ({ sessionUser, taskToEdit, isOpen, onClose }) => {
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
    // TODO: Make a PUT request to update the task in the database
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
        assignedTo: assignedUserIDs,
      }),
    })
      .then((response) => response.json())
      .then((data) => console.log("Task updated:", data))
      .catch((error) => console.error("Failed to update task:", error));
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
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 text-white">
      <div className="bg-slate-600 rounded-lg shadow-lg w-1/2 h-auto">
        {/* Panel Header */}
        <div className="flex items-center justify-between p-4 border-b border-gray-400">
          <h2 className="text-xl font-semibold">Edit Task</h2>
          <button
            onClick={onClose}
            className="p-1 hover:bg-gray-100 hover:text-black rounded-full transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Panel Content */}
        <div className="p-4">
          <div className="space-y-4">
            <div className="flex flex-col space-y-1">
              <label className="text-md text-gray-300">Task Name</label>
              <input
                type="text"
                className="forms text-left"
                name="name"
                defaultValue={taskToEdit?.name}
                onChange={handleOnChange}
              />
            </div>
            <div className="flex flex-col space-y-1">
              <label className="text-md text-gray-300">Description</label>
              <textarea
                className="forms text-left"
                rows="4"
                name="description"
                defaultValue={taskToEdit?.description}
                onChange={handleOnChange}
              />
            </div>
            <div className="flex flex-row justify-between space-x-4">
              <div className="flex flex-col space-y-2 w-full">
                <h1 className="text-md">Due Date</h1>
                <input
                  type="date"
                  className="forms"
                  name="date"
                  defaultValue={getDateFromDateString(taskToEdit?.date)}
                  onChange={handleOnChange}
                />
              </div>

              <div className="flex flex-col space-y-2 w-full">
                <h1 className="text-md">Priority</h1>
                <select
                  className="forms"
                  name="priority"
                  defaultValue={taskToEdit?.priority}
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
                  defaultValue={taskToEdit?.status}
                  onChange={handleOnChange}
                >
                  <option value="pending">Pending</option>
                  <option value="in_progress">In Progress</option>
                  <option value="completed">Completed</option>
                </select>
              </div>
            </div>
          </div>
        </div>

        {/* Panel Footer */}
        <div className="flex justify-end gap-2 p-4 border-t border-gray-400">
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
      </div>
    </div>
  );
};

export default EditTaskPanel;
