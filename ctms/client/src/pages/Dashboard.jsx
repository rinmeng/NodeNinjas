import React, { useState, useEffect, useCallback } from "react";
import { Navigate } from "react-router-dom";
import SearchBar from "../components/SearchBar";
import TaskDashboard from "../components/TaskDashboard";
import AddTaskPanel from "../components/AddTaskPanel";
import Feedback2 from "../components/subcomponents/Feedback2";
import { ListPlus, ListX } from "lucide-react";
const proxy = "http://localhost:15000";

const Dashboard = ({ sessionUser, devMode }) => {
  const [searchCriteria, setSearchCriteria] = useState("");
  const [showAddTaskPanel, setShowAddTaskPanel] = useState(false);
  const [feedbackMessage, setFeedbackMessage] = useState("");
  const [showFeedbackMessage, setShowFeedbackMessage] = useState(false);
  const [addedTaskSuccessfully, setAddedTaskSuccessfully] = useState(false);

  const [allTasks, setAllTasks] = useState([]);

  const [tasks, setTasks] = useState(allTasks);

  const [filterOptions, setFilterOptions] = useState({
    sortTitleAsc: null,
    sortDateAsc: null,
    sortPriorityAsc: "",
    sortStatusAsc: "",
  });

  const handleSearch = useCallback(
    (criteria) => {
      setSearchCriteria(criteria); // Update the search criteria first

      // Use useEffect to handle the filtering after the state update
      if (!criteria) {
        setTasks(allTasks);
      } else {
        const filteredTasks = allTasks.filter(
          (task) =>
            task.name.toLowerCase().includes(criteria.toLowerCase()) ||
            task.description.toLowerCase().includes(criteria.toLowerCase())
        );
        setTasks(filteredTasks);
      }
    },
    [allTasks]
  );

  useEffect(() => {
    handleSearch(searchCriteria);
  }, [searchCriteria, handleSearch]);

  const fetchTaskFromDatabase = useCallback(async () => {
    // Add null check for sessionUser
    if (!sessionUser && !devMode) {
      console.log("No user session found");
      return;
    }

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
  }, [sessionUser, devMode]);

  // fetch task when first loaded
  useEffect(() => {
    fetchTaskFromDatabase();
  }, [fetchTaskFromDatabase]);

  // if user is not logged in, redirect to login page
  if (!sessionUser && !devMode) {
    return (
      <div className="mp5 my-16 animate-fadein">
        <h1 className="title text-center">Welcome to your Dashboard!</h1>
        <p className="text-center text-xl">
          Please log in to view this page, or enable <code>devMode</code> to
          bypass authentication in <code>App.jsx</code>
        </p>
        {/* redirect to /login */}
        <Navigate to="/login" />
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center justify-center py-20 mp5">
      <SearchBar
        setSearchCriteria={setSearchCriteria}
        searchCriteria={searchCriteria}
        filterOptions={filterOptions}
        setFilterOptions={setFilterOptions}
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
