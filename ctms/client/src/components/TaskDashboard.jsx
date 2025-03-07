import React, { useState, useEffect } from "react";
import { ClipboardList, RefreshCw } from "lucide-react";
import TaskCard from "./subcomponents/TaskCard";
import AddTaskPanel from "./AddTaskPanel";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";

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
  }, [needsRefetch, setNeedsRefetch, setFeedbackMessage, isRefetching]);

  return (
    <Card className="w-full mt-28">
      <CardHeader>
        <div className="flex justify-center items-center space-x-4">
          <AddTaskPanel
            setFeedbackMessage={setFeedbackMessage}
            sessionUser={sessionUser}
            setNeedsRefetch={setNeedsRefetch}
          />

          <Button
            variant="outline"
            onClick={refetchTaskClicked}
            disabled={isRefetching}
            className="flex gap-2"
          >
            Sync Tasks
            <RefreshCw
              className={`h-4 w-4 ${isRefetching ? "animate-spin" : ""}`}
            />
          </Button>
        </div>

        {isRefetching && (
          <CardDescription className="text-center mt-2">
            Refetching tasks...
          </CardDescription>
        )}
      </CardHeader>

      <Separator />

      <CardContent className="pt-6">
        {taskList.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-8 text-muted-foreground">
            <ClipboardList size={48} className="mb-4" />
            <p className="text-lg">No tasks available</p>
            <p className="text-sm mt-2">
              Click 'Create Task' to add your first task
            </p>
          </div>
        ) : (
          <div>
            <CardTitle className="text-center text-muted-foreground mb-6">
              {taskList.length} tasks found
            </CardTitle>
            <div className="flex flex-col gap-4 w-1/2 mx-auto">
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
      </CardContent>

      <CardFooter>
        <Separator className="w-full" />
      </CardFooter>
    </Card>
  );
};

export default TaskDashboard;
