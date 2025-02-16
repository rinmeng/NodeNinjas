import { ListPlus, RefreshCcw } from "lucide-react";
import React, { useState, useEffect } from "react";
import TaskCard from "./subcomponents/TaskCard";

import IconizedButton from "./subcomponents/IconizedButton";

const TaskDashboard = ({ showAddTaskPanel, setShowAddTaskPanel }) => {
  const [tasks, setTasks] = useState([
    {
      id: 1,
      title: "Task 1",
      description: "This is task 1",
      date: "2025-02-16",
      status: "pending",
      priority: "high",
    },
    {
      id: 2,
      title: "Task 2",
      description: "This is task 2",
      date: "2025-02-17",
      status: "in progress",
      priority: "medium",
    },
    {
      id: 3,
      title: "Task 3",
      description: "This is task 3",
      date: "2025-02-18",
      status: "completed",
      priority: "low",
    },
    {
      id: 4,
      title: "Task 4",
      description: "This is task 4",
      date: "2025-02-11",
      status: "pending",
      priority: "high",
    },
  ]);
  const fetchTaskFromDatabase = async () => {};

  return (
    <div className="bg-slate-800 w-full h-full rounded-xl p-5">
      <div className="title text-center my-6">Task Dashboard</div>
      <div className="flex justify-center items-center space-x-4">
        <IconizedButton
          text="Create Task"
          icon={<ListPlus size={24} className="ml-2" />}
          onClick={() => setShowAddTaskPanel(!showAddTaskPanel)}
          btnStyle="btn-blue"
        />

        <IconizedButton
          icon={<RefreshCcw size={24} className="ml-2" />}
          text="Refetch Tasks"
          onClick={fetchTaskFromDatabase}
          btnStyle="btn-grey"
        />
      </div>
      <div className="border-b border-slate-700 my-4"></div>
      <div className="flex flex-col space-y-4">
        {tasks.map((task) => (
          <TaskCard task={task} />
        ))}
      </div>
    </div>
  );
};

export default TaskDashboard;
