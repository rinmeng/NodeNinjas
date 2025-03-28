import { CalendarIcon, ListPlus } from "lucide-react";
import React, { useState } from "react";
import { format } from "date-fns";

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
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";

import proxy from "@/utils/proxy";
import { Separator } from "@/components/ui/separator";
import { useToast } from "@/utils/ToastProvider";

const AddTaskPanel = ({ user, setNeedsRefetch }) => {
  const { setFeedbackMessage } = useToast();
  const today = new Date();
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
      setFeedbackMessage({
        title: "Failed to Add Task",
        description: error.message,
      });
    }
  };

  const addTaskToDatabase = async () => {
    const assignedUserIDs = [];
    // check if user is signed in
    if (user) {
      assignedUserIDs.push(user.id);
    }

    // Format the date for the API
    const formattedDate = format(task.date, "yyyy-MM-dd");

    // make post request to add task to database
    const response = await fetch(`${proxy}/task/add`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        name: task.title,
        date: formattedDate,
        description: task.description,
        priority: task.priority,
        status: task.status,
        assigned_users: assignedUserIDs,
        owner_id: user ? user.id : null,
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

    if (!user) {
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
        <Button variant="default">
          Add Task
          <ListPlus />
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>
            <div className="text-xl text-primary font-semibold">Add Task</div>
          </DialogTitle>
          <DialogDescription>
            Create a new task to track your work.
          </DialogDescription>
        </DialogHeader>

        <Card>
          <CardHeader>
            <CardTitle>
              <h3 className="text-md">Task Details</h3>
            </CardTitle>
            <CardDescription>Enter information about your task</CardDescription>
          </CardHeader>
          <CardContent>
            <form className="grid gap-4 py-2">
              <div className="grid gap-2">
                <Label htmlFor="title">Title</Label>
                <Input
                  id="title"
                  placeholder="Task Title"
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
                  className="resize-none min-h-[100px]"
                  value={task.description}
                  onChange={(e) =>
                    setTask({ ...task, description: e.target.value })
                  }
                />
              </div>

              <div className="flex flex-row space-x-4">
                <div className="grid gap-2">
                  <Label htmlFor="date">Due Date</Label>
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button
                        variant="outline"
                        className="justify-start text-left font-normal"
                      >
                        {task.date ? (
                          format(task.date, "PPP")
                        ) : (
                          <span>Pick a date</span>
                        )}
                        <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0" align="start">
                      <Calendar
                        mode="single"
                        selected={task.date}
                        onSelect={(date) => setTask({ ...task, date })}
                        initialFocus
                      />
                    </PopoverContent>
                  </Popover>
                </div>

                <div className="grid gap-2">
                  <Label htmlFor="priority">Priority</Label>
                  <Select
                    value={task.priority}
                    onValueChange={(value) =>
                      setTask({ ...task, priority: value })
                    }
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select priority" />
                    </SelectTrigger>
                    <SelectContent>
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
                    onValueChange={(value) =>
                      setTask({ ...task, status: value })
                    }
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select status" />
                    </SelectTrigger>
                    <SelectContent>
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
          </CardContent>
        </Card>

        <Separator />

        <DialogFooter>
          <DialogClose asChild>
            <Button variant="outline" onClick={() => setOpen(false)}>
              Cancel
            </Button>
          </DialogClose>
          <Button onClick={handleAddTask}>
            Add Task
            <ListPlus className="h-4 w-4 ml-1" />
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default AddTaskPanel;
