import React, { useState, useEffect, useCallback } from "react";
import { Navigate } from "react-router-dom";
import SearchBar from "../components/SearchBar";
import TaskDashboard from "../components/TaskDashboard";
import AddTaskPanel from "../components/AddTaskPanel";
import proxy from "../utils/proxy";

const Dashboard = ({
  sessionUser,
  devMode,
  setFeedbackMessage,
  setNotificationToAdd,
}) => {
  const [searchCriteria, setSearchCriteria] = useState("");
  const [showAddTaskPanel, setShowAddTaskPanel] = useState(false);

  // Initialize with empty array to prevent filter errors
  const [allTasks, setAllTasks] = useState([]);
  const [tasks, setTasks] = useState([]);
  const [showEditTaskPanel, setShowEditTaskPanel] = useState(false);

  const [needsRefetch, setNeedsRefetch] = useState(false);

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
    console.log("Fetching tasks from database...");
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
      setAllTasks([]);
      setTasks([]);
    }
  }, [sessionUser, devMode]);

  useEffect(() => {
    if (needsRefetch) {
      fetchTaskFromDatabase();
      setNeedsRefetch(false);
    }
  }, [needsRefetch, fetchTaskFromDatabase]);

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
    <div className="bg-slate-700 flex flex-col items-center justify-center py-40 p-10 animate-fadein min-h-screen">
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
        showEditTaskPanel={showEditTaskPanel}
        setShowEditTaskPanel={setShowEditTaskPanel}
        setNeedsRefetch={setNeedsRefetch}
        setNotificationToAdd={setNotificationToAdd}
        needsRefetch={needsRefetch}
        setFeedbackMessage={setFeedbackMessage}
        devMode={devMode}
      />
      <AddTaskPanel
        showAddTaskPanel={showAddTaskPanel}
        setShowAddTaskPanel={setShowAddTaskPanel}
        setFeedbackMessage={setFeedbackMessage}
        sessionUser={sessionUser}
        setNeedsRefetch={setNeedsRefetch}
        setNotificationToAdd={setNotificationToAdd}
      />
    </div>
  );
};

export default Dashboard;
