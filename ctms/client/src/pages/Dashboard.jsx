import React, { useState, useEffect, useCallback } from "react";
import { Navigate } from "react-router-dom";
import SearchBar from "../components/SearchBar";
import TaskDashboard from "../components/TaskDashboard";
import AddTaskPanel from "../components/AddTaskPanel";
import Feedback2 from "../components/subcomponents/Feedback2";
import { ListPlus, ListX } from "lucide-react";
import proxy from "../utils/proxy";

const Dashboard = ({ sessionUser, devMode }) => {
  const [searchCriteria, setSearchCriteria] = useState("");
  const [showAddTaskPanel, setShowAddTaskPanel] = useState(false);
  const [feedbackMessage, setFeedbackMessage] = useState("");
  const [showFeedbackMessage, setShowFeedbackMessage] = useState(false);
  const [addedTaskSuccessfully, setAddedTaskSuccessfully] = useState(false);

  // Initialize with empty array to prevent filter errors
  const [allTasks, setAllTasks] = useState([]);
  const [tasks, setTasks] = useState([]);
  const [showEditTaskPanel, setShowEditTaskPanel] = useState(false);

  const [filterOptions, setFilterOptions] = useState({
    sortTitleAsc: null,
    sortDateAsc: null,
    sortPriorityAsc: "",
    sortStatusAsc: "",
  });

  const handleSearch = useCallback(
    (criteria) => {
      setSearchCriteria(criteria);

      if (!criteria) {
        setTasks(allTasks);
      } else {
        // Guard against null/undefined allTasks
        const tasksToFilter = Array.isArray(allTasks) ? allTasks : [];
        const filteredTasks = tasksToFilter.filter(
          (task) =>
            task.name.toLowerCase().includes(criteria.toLowerCase()) ||
            task.description.toLowerCase().includes(criteria.toLowerCase())
        );
        setTasks(filteredTasks);
      }
    },
    [allTasks]
  );

  const fetchTaskFromDatabase = useCallback(async () => {
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

      // Ensure we always set an array
      const tasksArray = Array.isArray(data) ? data : [];
      setAllTasks(tasksArray);
      setTasks(tasksArray);
    } catch (error) {
      console.error("Error fetching tasks from database:", error.message);
      // Set empty arrays on error
      setAllTasks([]);
      setTasks([]);
    }
  }, [sessionUser, devMode]);

  useEffect(() => {
    fetchTaskFromDatabase();
  }, [fetchTaskFromDatabase]);

  useEffect(() => {
    handleSearch(searchCriteria);
  }, [searchCriteria, handleSearch]);

  // Sort tasks based on filter options
  useEffect(() => {
    const sortTasks = () => {
      // Guard against null/undefined allTasks
      let tasksToSort = Array.isArray(allTasks) ? [...allTasks] : [];

      // Apply search filter
      if (searchCriteria) {
        tasksToSort = tasksToSort.filter(
          (task) =>
            task.name.toLowerCase().includes(searchCriteria.toLowerCase()) ||
            task.description
              .toLowerCase()
              .includes(searchCriteria.toLowerCase())
        );
      }

      // Apply title sort
      if (filterOptions.sortTitleAsc !== null) {
        tasksToSort.sort((a, b) => {
          return filterOptions.sortTitleAsc
            ? a.name.localeCompare(b.name)
            : b.name.localeCompare(a.name);
        });
      }

      // Apply date sort
      if (filterOptions.sortDateAsc !== null) {
        tasksToSort.sort((a, b) => {
          return filterOptions.sortDateAsc
            ? new Date(a.date) - new Date(b.date)
            : new Date(b.date) - new Date(a.date);
        });
      }

      // Apply priority filter
      if (filterOptions.sortPriorityAsc !== "") {
        tasksToSort = tasksToSort.filter(
          (task) =>
            task.priority.toLowerCase() ===
            filterOptions.sortPriorityAsc.toLowerCase()
        );
      }

      // Apply status filter
      if (filterOptions.sortStatusAsc !== "") {
        tasksToSort = tasksToSort.filter(
          (task) =>
            task.status.toLowerCase() ===
            filterOptions.sortStatusAsc.toLowerCase()
        );
      }

      setTasks(tasksToSort);
    };

    sortTasks();
  }, [filterOptions, allTasks, searchCriteria]);

  if (!sessionUser && !devMode) {
    return (
      <div className="mp5 my-16 animate-fadein">
        <h1 className="title text-center">Welcome to your Dashboard!</h1>
        <p className="text-center text-xl">
          Please log in to view this page, or enable <code>devMode</code> to
          bypass authentication in <code>App.jsx</code>
        </p>
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
        sessionUser={sessionUser}
        showAddTaskPanel={showAddTaskPanel}
        setShowAddTaskPanel={setShowAddTaskPanel}
        tasks={tasks}
        setTasks={setTasks}
        fetchTaskFromDatabase={fetchTaskFromDatabase}
        showEditTaskPanel={showEditTaskPanel}
        setShowEditTaskPanel={setShowEditTaskPanel}
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
