import React, { useState } from "react";
import { Save, X } from "lucide-react";
import proxy from "../utils/proxy";
import getDateWithRelativeTime from "../utils/getDateWithRelativeTime";

// Import Shadcn UI components
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogClose,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";

const EditTaskPanel = ({
  taskToEdit,
  setNeedsRefetch,
  setFeedbackMessage,
  setNotificationToAdd,
  sessionUser,
}) => {
  const [taskAfterEdit, setTaskAfterEdit] = useState(taskToEdit || {});

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setTaskAfterEdit((prevState) => ({
      ...prevState,
      [name]: value,
    }));
  };

  const handleSelectChange = (name, value) => {
    setTaskAfterEdit((prevState) => ({
      ...prevState,
      [name]: value,
    }));
  };

  const getDateFromDateString = (dateString) => {
    if (!dateString) return ""; // Handle empty values safely

    // Ensure date is parsed correctly
    const taskDate = new Date(dateString);
    if (isNaN(taskDate.getTime())) return ""; // Handle parsing errors

    // Format the date as YYYY-MM-DD for input[type="date"]
    const year = taskDate.getFullYear();
    const month = String(taskDate.getMonth() + 1).padStart(2, "0");
    const day = String(taskDate.getDate()).padStart(2, "0");

    return `${year}-${month}-${day}`;
  };

  const handleUpdateTask = async () => {
    if ((taskAfterEdit.name == "") | (taskAfterEdit.date == "")) {
      setFeedbackMessage("Please fill in all required fields.");
      return;
    }
    try {
      const response = await fetch(`${proxy}/task/update/:id`, {
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
        }),
        credentials: "include",
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Failed to update task");
      }

      const data = await response.json();
      console.log("Updated task:", data);
      setNeedsRefetch(true);
      setFeedbackMessage("Task updated successfully!");

      // Add notification if status was changed to completed
      if (
        taskAfterEdit.status === "completed" &&
        taskToEdit.status !== "completed"
      ) {
        setNotificationToAdd({
          user_ids: [taskToEdit.owner_id],
          message: `Task "${taskAfterEdit.name}" was marked as completed`,
          type: "task_completed",
        });
      }
    } catch (error) {
      console.error("Failed to update task:", error);
      setFeedbackMessage(error.message || "Failed to update task.");
    }
  };

  return (
    <DialogContent className="sm:max-w-[900px] max-h-[100vh] bg-slate-900 text-white border-slate-600 overflow-y-auto">
      <DialogHeader>
        <DialogTitle className="text-xl font-semibold flex justify-between items-center">
          Edit Task
        </DialogTitle>
        <DialogDescription className="text-slate-400">
          Make changes to your task details below
        </DialogDescription>
      </DialogHeader>

      {/* Rest of the component remains the same as before */}
      {/* Task Information */}
      <div className="bg-slate-800 p-4 rounded-lg">
        <h2 className="text-lg font-semibold text-white">
          Task: {taskToEdit.name}
        </h2>
        <p className="text-slate-300 text-sm truncate">
          {taskToEdit.description}
        </p>
        <p className="text-slate-400 text-sm mt-2">
          Created by:{" "}
          <span className="text-white">
            @{taskToEdit.owner_username} ({taskToEdit.owner_display_name})
          </span>
        </p>
        <p className="text-slate-400 text-sm">
          Created on:{" "}
          <span className="text-white">
            {getDateWithRelativeTime(taskToEdit.created_at)}
          </span>
        </p>
      </div>

      {/* Form Fields */}
      <div className="space-y-4 py-4">
        <div className="space-y-2">
          <Label htmlFor="name">Task Title</Label>
          <Input
            id="name"
            name="name"
            value={taskAfterEdit?.name || ""}
            onChange={handleInputChange}
            className="bg-slate-800 border-slate-700 text-white"
            placeholder="Enter task title"
            maxLength={255}
          />
        </div>

        <div className="space-y-2 w-full">
          <Label htmlFor="description">Description</Label>
          <Textarea
            id="description"
            name="description"
            value={taskAfterEdit?.description || ""}
            onChange={handleInputChange}
            className="w-full bg-slate-800 resize-none border-slate-700 text-white min-h-[120px]"
            placeholder="Provide a detailed description of the task "
          />
        </div>

        <div className="flex flex-row justify-start space-x-4">
          <div className="space-y-2 ">
            <Label htmlFor="date">Due Date</Label>
            <Input
              id="date"
              name="date"
              type="date"
              value={getDateFromDateString(taskAfterEdit?.date)}
              onChange={handleInputChange}
              className="flex justify-center  bg-slate-800 border-slate-700 text-white"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="priority">Priority</Label>
            <Select
              value={taskAfterEdit?.priority || "low"}
              onValueChange={(value) => handleSelectChange("priority", value)}
            >
              <SelectTrigger className="w-full bg-slate-800 border-slate-700 text-white">
                <SelectValue placeholder="Select priority" />
              </SelectTrigger>
              <SelectContent className="bg-slate-800 border-slate-700 text-white">
                <SelectItem value="low">Low</SelectItem>
                <SelectItem value="medium">Medium</SelectItem>
                <SelectItem value="high">High</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="status">Status</Label>
            <Select
              value={taskAfterEdit?.status || "pending"}
              onValueChange={(value) => handleSelectChange("status", value)}
            >
              <SelectTrigger className="bg-slate-800 border-slate-700 text-white">
                <SelectValue placeholder="Select status" />
              </SelectTrigger>
              <SelectContent className="bg-slate-800 border-slate-700 text-white">
                <SelectItem value="pending">Pending</SelectItem>
                <SelectItem value="in_progress">In Progress</SelectItem>
                <SelectItem value="completed">Completed</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </div>

      <Separator className="bg-slate-600" />

      <DialogFooter>
        <DialogClose asChild>
          <Button
            variant="outline"
            className="text-white bg-transparent border-slate-600 hover:bg-slate-700"
          >
            Cancel
          </Button>
        </DialogClose>
        <DialogClose asChild>
          <Button
            className="bg-blue-600 hover:bg-blue-700 text-white"
            onClick={handleUpdateTask}
          >
            Save Changes
            <Save className="h-4 w-4" />
          </Button>
        </DialogClose>
      </DialogFooter>
    </DialogContent>
  );
};

export default EditTaskPanel;
