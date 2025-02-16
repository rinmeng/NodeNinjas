import React, { useState, useEffect, useCallback } from "react";
import { Navigate } from "react-router-dom";
import SearchBar from "../components/SearchBar";
import TaskDashboard from "../components/TaskDashboard";
import AddTaskPanel from "../components/AddTaskPanel";
import Feedback2 from "../components/subcomponents/Feedback2";
import { ListMinus, ListPlus, ListX } from "lucide-react";
const proxy = "http://localhost:15000";

const Dashboard = ({ sessionUser, devMode }) => {
  const [searchCriteria, setSearchCriteria] = useState("");
  const [showAddTaskPanel, setShowAddTaskPanel] = useState(false);
  const [feedbackMessage, setFeedbackMessage] = useState("");
  const [showFeedbackMessage, setShowFeedbackMessage] = useState(false);
  const [addedTaskSuccessfully, setAddedTaskSuccessfully] = useState(false);

  const [allTasks, setAllTasks] = useState([]);

  const [tasks, setTasks] = useState(allTasks);

  const handleSearch = (criteria) => {
    console.log("Searching for tasks with criteria:", criteria);
    if (!criteria) {
      setTasks(allTasks);
      return;
    }

    const filteredTasks = allTasks.filter((task) =>
      task.name.toLowerCase().includes(criteria.toLowerCase())
    );

    setTasks(filteredTasks);
  };

  const fetchTaskFromDatabase = useCallback(async () => {
    try {
      const response = await fetch(
        `${proxy}/task/assignedto/user/${sessionUser.id}`
      );
      const data = await response.json();
      console.log("Fetched tasks from database:", data);
      setAllTasks(data);
      setTasks(data);
    } catch (error) {
      console.error("Error fetching tasks from database:", error.message);
    }
  }, [sessionUser.id]);

  // fetch task when first loaded
  useEffect(() => {
    fetchTaskFromDatabase();
  }, [fetchTaskFromDatabase]);

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
        fetchTaskFromDatabase={fetchTaskFromDatabase}
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
