import { useState, useEffect, useCallback } from "react";
import proxy from "@/utils/proxy";

function useTasks(user, devMode) {
  const [allTasks, setAllTasks] = useState([]);
  const [tasks, setTasks] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [needsRefetch, setNeedsRefetch] = useState(false);
  const [searchCriteria, setSearchCriteria] = useState("");
  const [filterOptions, setFilterOptions] = useState({
    sortTitleAsc: null,
    sortDateAsc: null,
    sortPriorityAsc: "",
    sortStatusAsc: "",
    toDate: null,
    fromDate: null,
  });

  const fetchTasks = useCallback(async () => {
    if (!user?.id && !devMode) return;

    try {
      setIsLoading(true);
      const response = await fetch(
        `${proxy}/task/assignedto/user/${user?.id}`,
        {
          credentials: "include",
        }
      );
      const data = await response.json();

      // Ensure we always set an array
      const tasksArray = Array.isArray(data) ? data : [];
      setAllTasks(tasksArray);
      setTasks(tasksArray);
    } catch (error) {
      console.error("Error fetching tasks from database:", error.message);
      setAllTasks([]);
      setTasks([]);
    } finally {
      setIsLoading(false);
    }
  }, [user, devMode]);

  // Search tasks
  const handleSearch = useCallback(
    (criteria) => {
      setSearchCriteria(criteria);

      if (!criteria) {
        setTasks(allTasks);
        return;
      }

      const tasksToFilter = Array.isArray(allTasks) ? allTasks : [];
      const filteredTasks = tasksToFilter.filter(
        (task) =>
          task.name.toLowerCase().includes(criteria.toLowerCase()) ||
          task.description.toLowerCase().includes(criteria.toLowerCase())
      );
      setTasks(filteredTasks);
    },
    [allTasks]
  );

  // Handle filter changes
  const handleFilterChange = useCallback((filterName, value) => {
    setFilterOptions((prevOptions) => {
      const newOptions = { ...prevOptions };

      // Handle boolean toggles
      if (filterName === "sortTitleAsc" || filterName === "sortDateAsc") {
        if (prevOptions[filterName] === null) {
          newOptions[filterName] = true;
        } else if (prevOptions[filterName] === true) {
          newOptions[filterName] = false;
        } else {
          newOptions[filterName] = null;
        }
      }
      // Handle cycle states (priority, status)
      else if (filterName === "sortPriorityAsc") {
        if (prevOptions[filterName] === "") {
          newOptions[filterName] = "high";
        } else if (prevOptions[filterName] === "high") {
          newOptions[filterName] = "medium";
        } else if (prevOptions[filterName] === "medium") {
          newOptions[filterName] = "low";
        } else {
          newOptions[filterName] = "";
        }
      } else if (filterName === "sortStatusAsc") {
        if (prevOptions[filterName] === "") {
          newOptions[filterName] = "pending";
        } else if (prevOptions[filterName] === "pending") {
          newOptions[filterName] = "in_progress";
        } else if (prevOptions[filterName] === "in_progress") {
          newOptions[filterName] = "completed";
        } else {
          newOptions[filterName] = "";
        }
      }
      // Handle direct value assignments
      else {
        newOptions[filterName] = value;
      }

      return newOptions;
    });
  }, []);

  // Reset all filters
  const removeAllFilters = useCallback(() => {
    setFilterOptions({
      sortTitleAsc: null,
      sortDateAsc: null,
      sortPriorityAsc: "",
      sortStatusAsc: "",
      toDate: null,
      fromDate: null,
    });
  }, []);

  // Check if any filter is active
  const isAnyFilterActive =
    filterOptions.sortDateAsc !== null ||
    filterOptions.sortTitleAsc !== null ||
    filterOptions.sortPriorityAsc !== "" ||
    filterOptions.sortStatusAsc !== "" ||
    filterOptions.fromDate !== null ||
    filterOptions.toDate !== null;

  // Trigger refetch
  const triggerRefetch = useCallback(() => {
    setNeedsRefetch(true);
  }, []);

  // Apply filters and search
  useEffect(() => {
    if (needsRefetch) {
      fetchTasks();
      setNeedsRefetch(false);
    }
  }, [needsRefetch, fetchTasks]);

  // Initial data load
  useEffect(() => {
    fetchTasks();
  }, [fetchTasks]);

  // Apply search
  useEffect(() => {
    handleSearch(searchCriteria);
  }, [searchCriteria, handleSearch]);

  // Apply filters
  useEffect(() => {
    const sortTasks = () => {
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

      // Apply date range filter
      if (filterOptions.fromDate) {
        tasksToSort = tasksToSort.filter(
          (task) => new Date(task.date) >= filterOptions.fromDate
        );
      }

      if (filterOptions.toDate) {
        tasksToSort = tasksToSort.filter(
          (task) => new Date(task.date) <= filterOptions.toDate
        );
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

  return {
    tasks,
    allTasks,
    isLoading,
    searchCriteria,
    filterOptions,
    isAnyFilterActive,
    setSearchCriteria,
    handleSearch,
    handleFilterChange,
    removeAllFilters,
    triggerRefetch,
  };
}

export default useTasks;
