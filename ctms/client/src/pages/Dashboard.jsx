import React, { useState } from "react";
import { Navigate } from "react-router-dom";
import SearchBar from "../components/SearchBar";
import TaskDashboard from "../components/TaskDashboard";
import AddTaskPanel from "../components/AddTaskPanel";
import Feedback2 from "../components/subcomponents/Feedback2";
import { ListMinus, ListPlus, ListX } from "lucide-react";

const Dashboard = ({ sessionUser, devMode }) => {
  const [searchCriteria, setSearchCriteria] = useState("");
  const [showAddTaskPanel, setShowAddTaskPanel] = useState(false);
  const [feedbackMessage, setFeedbackMessage] = useState("");
  const [showFeedbackMessage, setShowFeedbackMessage] = useState(false);
  const [addedTaskSuccessfully, setAddedTaskSuccessfully] = useState(false);

  const [allTasks, setAllTasks] = useState([
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

  const [tasks, setTasks] = useState(allTasks);

  const handleSearch = (criteria) => {
    console.log("Searching for tasks with criteria:", criteria);
    if (!criteria) {
      setTasks(allTasks);
      return;
    }

    const filteredTasks = allTasks.filter((task) =>
      task.title.toLowerCase().includes(criteria.toLowerCase())
    );

    setTasks(filteredTasks);
  };

  return (
    <div className="flex flex-col items-center justify-center py-20 mp5">
      <SearchBar
        setSearchCriteria={setSearchCriteria}
        searchCriteria={searchCriteria}
        onSearch={handleSearch}
      />
      <TaskDashboard
        showAddTaskPanel={showAddTaskPanel}
        setShowAddTaskPanel={setShowAddTaskPanel}
        tasks={tasks}
        setTasks={setTasks}
      />
      <AddTaskPanel
        showAddTaskPanel={showAddTaskPanel}
        setShowAddTaskPanel={setShowAddTaskPanel}
        setShowFeedbackMessage={setShowFeedbackMessage}
        setFeedbackMessage={setFeedbackMessage}
        setAddedTaskSuccessfully={setAddedTaskSuccessfully}
        sessionUser={sessionUser}
      />
      {showFeedbackMessage && (
        <Feedback2
          icon={
            addedTaskSuccessfully ? <ListPlus size={24} /> : <ListX size={24} />
          }
          message={feedbackMessage}
          isSuccess={addedTaskSuccessfully}
        />
      )}
    </div>
  );
};

export default Dashboard;
