import React, { useState } from "react";
import { Save, X } from "lucide-react";
import proxy from "../utils/proxy";
import getDateWithRelativeTime from "../utils/getDateWithRelativeTime";

// Import Shadcn UI components
import {
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
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { useToast } from "@/utils/ToastProvider";
import { useNotification } from "@/utils/NotificationProvider";

const EditTaskPanel = ({ taskToEdit, setNeedsRefetch, user }) => {
  const [taskAfterEdit, setTaskAfterEdit] = useState(taskToEdit || {});
  const { setFeedbackMessage } = useToast();
  const { setNotificationToAdd } = useNotification();

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
    if (taskAfterEdit.name == "" || taskAfterEdit.date == "") {
      setFeedbackMessage({
        title: "Missing Requirements",
        description: "Please fill in all required fields.",
      });
      return;
    }

    // Check if there are any changes
    const hasChanges =
      taskAfterEdit.name !== taskToEdit.name ||
      taskAfterEdit.description !== taskToEdit.description ||
      taskAfterEdit.date !== taskToEdit.date ||
      taskAfterEdit.priority !== taskToEdit.priority ||
      taskAfterEdit.status !== taskToEdit.status;

    if (!hasChanges) {
      setFeedbackMessage({
        title: "No Recorded Changes",
        description: "No changes were made to the task.",
      });
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
      setFeedbackMessage({
        title: "Success",
        description: "Task updated successfully!",
      });

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
      setFeedbackMessage({
        title: "Error",
        description: error.message || "Failed to update task.",
      });
    }
  };

  return (
    <DialogContent className="sm:max-w-[900px] max-h-[100vh] overflow-y-auto">
      <DialogHeader>
        <DialogTitle>
          <div className="text-primary">Edit Task</div>
        </DialogTitle>
        <DialogDescription>
          Make changes to your task details below
        </DialogDescription>
      </DialogHeader>

      {/* Task Information */}
      <Card>
        <CardContent>
          <CardTitle>
            <h2 className="text-lg font-semibold">Task: {taskToEdit.name}</h2>
          </CardTitle>
          <CardDescription>
            <p className="text-sm truncate">{taskToEdit.description}</p>
          </CardDescription>
          <CardDescription>
            <p className="text-sm">
              Created by:{" "}
              <span>
                @{taskToEdit.owner_username} ({taskToEdit.owner_display_name})
              </span>
            </p>
            <p className="text-sm">
              Created on:{" "}
              <span>{getDateWithRelativeTime(taskToEdit.created_at)}</span>
            </p>
          </CardDescription>
        </CardContent>
      </Card>

      {/* Form Fields */}
      <Card>
        <CardHeader>
          <CardTitle>
            <h3 className="text-md">Task Details</h3>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name">Task Title</Label>
              <Input
                id="name"
                name="name"
                value={taskAfterEdit?.name || ""}
                onChange={handleInputChange}
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
                className="w-full resize-none min-h-[120px]"
                placeholder="Provide a detailed description of the task"
              />
            </div>

            <div className="flex flex-row justify-start space-x-4">
              <div className="space-y-2">
                <Label htmlFor="date">Due Date</Label>
                <Input
                  id="date"
                  name="date"
                  type="date"
                  value={getDateFromDateString(taskAfterEdit?.date)}
                  onChange={handleInputChange}
                  className="flex justify-center"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="priority">Priority</Label>
                <Select
                  value={taskAfterEdit?.priority || "low"}
                  onValueChange={(value) =>
                    handleSelectChange("priority", value)
                  }
                >
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Select priority" />
                  </SelectTrigger>
                  <SelectContent>
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
                  <SelectTrigger>
                    <SelectValue placeholder="Select status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="pending">Pending</SelectItem>
                    <SelectItem value="in_progress">In Progress</SelectItem>
                    <SelectItem value="completed">Completed</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <Separator />

      <DialogFooter>
        <DialogClose asChild>
          <Button variant="outline">Cancel</Button>
        </DialogClose>
        <DialogClose asChild>
          <Button onClick={handleUpdateTask}>
            Save Changes
            <Save className="h-4 w-4 ml-1" />
          </Button>
        </DialogClose>
      </DialogFooter>
    </DialogContent>
  );
};

export default EditTaskPanel;
