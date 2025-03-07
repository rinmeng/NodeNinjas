import { ListPlus } from "lucide-react";
import React, { useState } from "react";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogClose,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

import proxy from "../utils/proxy";
import { Separator } from "@/components/ui/separator";

const AddTaskPanel = ({ setFeedbackMessage, sessionUser, setNeedsRefetch }) => {
  const today = new Date().toISOString().split("T")[0];
  const [task, setTask] = useState({
    title: "",
    date: today,
    description: "",
    status: "pending",
    priority: "low",
  });
  const [open, setOpen] = useState(false);

  const handleAddTask = async (e) => {
    e.preventDefault();

    // First check the basic validation before sending network request
    if (!task.title || !task.date || !task.priority || !task.status) {
      setFeedbackMessage({
        title: "Missing Required Fields",
        description: "Please fill in all required fields.",
      });
      return; // Don't close dialog or proceed with API call
    }
    try {
      await addTaskToDatabase();
      setOpen(false);
    } catch (error) {
      console.error("Error adding task:", error);
      setFeedbackMessage({
        title: "Failed to Add Task",
        description: error.message,
      });
    }
  };

  const addTaskToDatabase = async () => {
    const assignedUserIDs = [];
    // check if user is signed in
    if (sessionUser) {
      assignedUserIDs.push(sessionUser.id);
    }

    // make post request to add task to database
    const response = await fetch(`${proxy}/task/add`, {
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
        owner_id: sessionUser ? sessionUser.id : null,
      }),
      credentials: "include",
    });

    // Parse the response body
    const data = await response.json();

    // If response is not ok, throw the error and STOP EXECUTION
    if (!response.ok) {
      throw new Error(data.message || "Failed to add task");
    }

    // Only reach here if successful
    // Update task state and provide feedback
    setTask({
      title: "",
      description: "",
      date: today,
      priority: "low",
      status: "pending",
    });

    if (!sessionUser) {
      setFeedbackMessage({
        title: "Task added successfully!",
        description:
          "Task will be added with no asignees, please sign in to assign users to the task.",
      });
    } else {
      setFeedbackMessage({
        title: "Task added successfully!",
        description: "Task has been added to your list.",
      });
    }

    setNeedsRefetch(true);
    return data;
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <div>
          <Button className="bg-blue-600 hover:bg-blue-700 text-white">
            Add Task
            <ListPlus />
          </Button>
        </div>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[600px] bg-slate-900 text-white border-slate-600">
        <DialogHeader>
          <DialogTitle className="text-xl font-semibold">Add Task</DialogTitle>
          <DialogDescription className="text-slate-400">
            Create a new task to track your work.
          </DialogDescription>
        </DialogHeader>

        <form className="grid gap-4 py-4">
          <div className="grid gap-2">
            <Label htmlFor="title">Title</Label>
            <Input
              id="title"
              placeholder="Task Title"
              className="bg-slate-800 border-slate-700 text-white"
              value={task.title}
              onChange={(e) => setTask({ ...task, title: e.target.value })}
              maxLength="255"
            />
          </div>

          <div className="grid gap-2">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              placeholder="Task Description"
              className="bg-slate-800 border-slate-700 text-white resize-none min-h-[100px]"
              value={task.description}
              onChange={(e) =>
                setTask({ ...task, description: e.target.value })
              }
            />
          </div>

          <div className="flex flex-row space-x-4">
            <div className="grid gap-2">
              <Label htmlFor="date">Due Date</Label>
              <Input
                id="date"
                type="date"
                className="bg-slate-800 border-slate-700 text-white"
                value={task.date}
                onChange={(e) => setTask({ ...task, date: e.target.value })}
              />
            </div>

            <div className="grid gap-2">
              <Label htmlFor="priority">Priority</Label>
              <Select
                value={task.priority}
                onValueChange={(value) => setTask({ ...task, priority: value })}
              >
                <SelectTrigger className="bg-slate-800 border-slate-700 text-white">
                  <SelectValue placeholder="Select priority" />
                </SelectTrigger>
                <SelectContent className="bg-slate-800 border-slate-700 text-white">
                  <SelectGroup>
                    <SelectItem value="low">Low</SelectItem>
                    <SelectItem value="medium">Medium</SelectItem>
                    <SelectItem value="high">High</SelectItem>
                  </SelectGroup>
                </SelectContent>
              </Select>
            </div>

            <div className="grid gap-2">
              <Label htmlFor="status">Status</Label>
              <Select
                value={task.status}
                onValueChange={(value) => setTask({ ...task, status: value })}
              >
                <SelectTrigger className="bg-slate-800 border-slate-700 text-white">
                  <SelectValue placeholder="Select status" />
                </SelectTrigger>
                <SelectContent className="bg-slate-800 border-slate-700 text-white">
                  <SelectGroup>
                    <SelectItem value="pending">Pending</SelectItem>
                    <SelectItem value="in_progress">In Progress</SelectItem>
                    <SelectItem value="completed">Completed</SelectItem>
                  </SelectGroup>
                </SelectContent>
              </Select>
            </div>
          </div>
        </form>

        <Separator className="bg-slate-600" />

        <DialogFooter>
          <Button
            variant="outline"
            className="text-white bg-transparent border-slate-600 hover:bg-slate-700"
            onClick={() => setOpen(false)}
          >
            Cancel
          </Button>
          <Button
            onClick={handleAddTask}
            className="bg-blue-600 hover:bg-blue-700 text-white"
          >
            Add Task
            <ListPlus className="h-4 w-4 ml-1" />
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default AddTaskPanel;
