import React from "react";
import { ListPlus, RefreshCcw, ClipboardList } from "lucide-react";
import TaskCard from "./subcomponents/TaskCard";
import IconizedButton from "./subcomponents/IconizedButton";

const TaskDashboard = ({
  showAddTaskPanel,
  setShowAddTaskPanel,
  tasks,
  sessionUser,
  setNeedsRefetch,
}) => {
  // Ensure tasks is always an array
  const taskList = Array.isArray(tasks) ? tasks : [];

  return (
    <div className="bg-slate-900 w-full h-full rounded-xl p-5">
      <div className="text-center my-6 text-xl font-semibold">
        Task Dashboard
      </div>

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
          onClick={() => setNeedsRefetch(true)}
          btnStyle="btn-grey"
        />
      </div>

      <div className="border-b border-slate-700 my-4"></div>

      {taskList.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-8 text-slate-400">
          <ClipboardList size={48} className="mb-4" />
          <p className="text-lg">No tasks available</p>
          <p className="text-sm mt-2">
            Click 'Create Task' to add your first task
          </p>
        </div>
      ) : (
        <div className="flex flex-col space-y-4">
          {taskList.map((task) => (
            <TaskCard
              key={task.id}
              task={task}
              sessionUser={sessionUser}
              setNeedsRefetch={setNeedsRefetch}
            />
          ))}
        </div>
      )}
    </div>
  );
};

export default TaskDashboard;
