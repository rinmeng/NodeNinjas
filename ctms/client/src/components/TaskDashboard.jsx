import React, { use, useState, useEffect } from "react";
import { ListPlus, ClipboardList, RefreshCw } from "lucide-react";
import TaskCard from "./subcomponents/TaskCard";
import IconizedButton from "./subcomponents/IconizedButton";

const TaskDashboard = ({
  showAddTaskPanel,
  setShowAddTaskPanel,
  tasks,
  sessionUser,
  setNeedsRefetch,
  notifications,
  setNotifications,
  needsRefetch,
}) => {
  // Ensure tasks is always an array
  const taskList = Array.isArray(tasks) ? tasks : [];
  const [isRefetching, setIsRefetching] = useState(false);

  const refetchTaskClicked = () => {
    setIsRefetching(true);

    setNeedsRefetch(true);
  };

  useEffect(() => {
    if (!needsRefetch) {
      // set time out for 1 second to simulate refetching
      setTimeout(() => {
        setIsRefetching(false);
      }, 500);
    }
  }, [needsRefetch, setNeedsRefetch]);

  return (
    <div className="bg-slate-950 w-full h-full rounded-xl p-5 mt-28">
      <div className="title text-center mb-6">
        <h1>Task Dashboard</h1>
      </div>

      <div className="flex justify-center items-center space-x-4 ">
        <IconizedButton
          text="Create Task"
          icon={<ListPlus size={24} className="ml-2" />}
          onClick={() => setShowAddTaskPanel(!showAddTaskPanel)}
          btnStyle="btn-blue"
        />

        <div className="group">
          <IconizedButton
            icon={
              <RefreshCw
                size={24}
                className="ml-2 -rotate-180 group-hover:rotate-180 t500e
          "
              />
            }
            text="Refetch Tasks"
            onClick={refetchTaskClicked}
            btnStyle="btn-grey"
          />
        </div>
      </div>
      {isRefetching && (
        <div className="text-sm text-slate-400 my-4 flex items-center justify-center">
          <RefreshCw size={16} className="animate-spin" />
          <span className="ml-2">Refetching tasks...</span>
        </div>
      )}

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
              notifications={notifications}
              setNotifications={setNotifications}
            />
          ))}
        </div>
      )}

      <div className="border-b border-slate-700 my-4"></div>
    </div>
  );
};

export default TaskDashboard;
