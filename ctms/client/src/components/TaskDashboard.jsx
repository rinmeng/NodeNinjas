import React, { useState, useEffect } from "react";
import { ClipboardList, RefreshCw } from "lucide-react";
import TaskCard from "./subcomponents/TaskCard";
import AddTaskPanel from "./AddTaskPanel";
import { Button } from "@/components/ui/button";

const TaskDashboard = ({
  tasks,
  sessionUser,
  setNeedsRefetch,
  notifications,
  setNotifications,
  needsRefetch,
  setFeedbackMessage,
  devMode,
  setNotificationToAdd,
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
        if (isRefetching) {
          setFeedbackMessage({
            title: "Success",
            description: "Tasks have been successfully synced",
          });
        }
      }, 1000);
    }
  }, [needsRefetch, setNeedsRefetch, setFeedbackMessage]);

  return (
    <div className="bg-slate-950 w-full h-full rounded-xl p-5 mt-28">
      <div className="flex justify-center items-center space-x-4">
        <AddTaskPanel
          setFeedbackMessage={setFeedbackMessage}
          sessionUser={sessionUser}
          setNeedsRefetch={setNeedsRefetch}
        />

        <div className="group">
          <Button
            variant="secondary"
            onClick={refetchTaskClicked}
            className={`cursor-pointer  ${
              isRefetching ? "cursor-not-allowed disabled opacity-50" : ""
            }`}
          >
            Sync Tasks
            <RefreshCw className={`${isRefetching ? "animate-spin" : ""}`} />
          </Button>
        </div>
      </div>

      {isRefetching && (
        <div className="text-center text-slate-400 mt-2">
          <p>Refetching tasks...</p>
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
        <div>
          <h1 className="text-center text-slate-400 mb-4">
            {taskList.length} tasks found
          </h1>
          <div className="flex flex-col">
            {taskList.map((task) => (
              <TaskCard
                key={task.id}
                task={task}
                sessionUser={sessionUser}
                setNeedsRefetch={setNeedsRefetch}
                notifications={notifications}
                setNotifications={setNotifications}
                setFeedbackMessage={setFeedbackMessage}
                devMode={devMode}
                setNotificationToAdd={setNotificationToAdd}
              />
            ))}
          </div>
        </div>
      )}

      <div className="border-b border-slate-700 my-4"></div>
    </div>
  );
};

export default TaskDashboard;
