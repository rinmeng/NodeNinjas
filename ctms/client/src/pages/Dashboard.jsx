import React, { useState, useEffect, useCallback } from "react";
import { Navigate } from "react-router-dom";
import {
  CalendarIcon,
  ClipboardList,
  RefreshCw,
  Search,
  X,
  FilterX,
  ArrowDownAZ,
  ChevronsUpDown,
  CalendarArrowUp,
  CalendarArrowDown,
  ClockAlert,
  ClockArrowUp,
  ClockArrowDown,
  CircleDashed,
  CircleDotDashed,
  Filter,
  ArrowDownZA,
  CircleCheck,
  Loader2,
} from "lucide-react";
import TaskCard from "@/src/components/subcomponents/TaskCard";
import AddTaskPanel from "@/src/components/AddTaskPanel";
import proxy from "@/utils/proxy";
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
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { useAuth } from "@/utils/AuthProvider";
import { useToast } from "@/utils/ToastProvider";
import { format } from "date-fns";
import { cn } from "@/lib/utils";

import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";

function Dashboard({ devMode }) {
  const { user } = useAuth();
  const { setFeedbackMessage } = useToast();
  const [searchCriteria, setSearchCriteria] = useState("");

  const [isRefetching, setIsRefetching] = useState(false);
  const [isSearchActive, setIsSearchActive] = useState(false);

  // Initialize with empty array to prevent filter errors
  const [allTasks, setAllTasks] = useState([]);
  const [tasks, setTasks] = useState([]);

  const [needsRefetch, setNeedsRefetch] = useState(false);

  const [isLoading, setIsLoading] = useState(false);

  const [filterOptions, setFilterOptions] = useState({
    sortTitleAsc: null,
    sortDateAsc: null,
    sortPriorityAsc: "",
    sortStatusAsc: "",
    toDate: null,
    fromDate: null,
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
    try {
      setIsLoading(true);
      const response = await fetch(`${proxy}/task/assignedto/user/${user.id}`);
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
    } finally {
      setIsLoading(false);
    }
  }, [user, devMode]);

  // Handle search input change
  const handleSearchChange = (e) => {
    setSearchCriteria(e.target.value);
    setIsSearchActive(e.target.value.length > 0);
  };

  // Handle search form submission
  const handleSearchSubmit = (e) => {
    e.preventDefault();
    setIsSearchActive(searchCriteria.length > 0);
  };

  // Clear search
  const handleClearSearch = () => {
    setSearchCriteria("");
    setIsSearchActive(false);
  };

  // Filter functions
  const filterTaskByTitle = () => {
    if (filterOptions.sortTitleAsc === null) {
      setFilterOptions({ ...filterOptions, sortTitleAsc: true });
    } else if (filterOptions.sortTitleAsc === true) {
      setFilterOptions({ ...filterOptions, sortTitleAsc: false });
    } else {
      setFilterOptions({ ...filterOptions, sortTitleAsc: null });
    }
  };

  const filterTaskByDate = () => {
    if (filterOptions.sortDateAsc === null) {
      setFilterOptions({ ...filterOptions, sortDateAsc: true });
    } else if (filterOptions.sortDateAsc === true) {
      setFilterOptions({ ...filterOptions, sortDateAsc: false });
    } else {
      setFilterOptions({ ...filterOptions, sortDateAsc: null });
    }
  };

  const filterTaskByPriority = () => {
    if (filterOptions.sortPriorityAsc === "") {
      setFilterOptions({ ...filterOptions, sortPriorityAsc: "high" });
    } else if (filterOptions.sortPriorityAsc === "high") {
      setFilterOptions({ ...filterOptions, sortPriorityAsc: "medium" });
    } else if (filterOptions.sortPriorityAsc === "medium") {
      setFilterOptions({ ...filterOptions, sortPriorityAsc: "low" });
    } else {
      setFilterOptions({ ...filterOptions, sortPriorityAsc: "" });
    }
  };

  const filterTaskByStatus = () => {
    if (filterOptions.sortStatusAsc === "") {
      setFilterOptions({ ...filterOptions, sortStatusAsc: "pending" });
    } else if (filterOptions.sortStatusAsc === "pending") {
      setFilterOptions({ ...filterOptions, sortStatusAsc: "in_progress" });
    } else if (filterOptions.sortStatusAsc === "in_progress") {
      setFilterOptions({ ...filterOptions, sortStatusAsc: "completed" });
    } else {
      setFilterOptions({ ...filterOptions, sortStatusAsc: "" });
    }
  };

  const removeAllFilters = () => {
    setFilterOptions({
      sortTitleAsc: null,
      sortDateAsc: null,
      sortPriorityAsc: "",
      sortStatusAsc: "",
    });
  };

  const isAnyFilterActive =
    filterOptions.sortDateAsc !== null ||
    filterOptions.sortTitleAsc !== null ||
    filterOptions.sortPriorityAsc !== "" ||
    filterOptions.sortStatusAsc !== "";

  // Ensure tasks is always an array
  const taskList = Array.isArray(tasks) ? tasks : [];

  const refetchTaskClicked = () => {
    setIsRefetching(true);
    setNeedsRefetch(true);

    // Set timeout for 750ms to ensure animation is visible
    setTimeout(() => {
      setIsRefetching(false);
      setFeedbackMessage({
        title: "Success",
        description: "Tasks have been successfully synced",
      });
    }, 750);
  };

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

  if (!user && !devMode) {
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
    <Card className="container mx-auto w-full my-24 animate-fade-in">
      <CardHeader className={"space-y-4"}>
        {/* Search and Filter Section */}
        <div className="w-1/2 mx-auto">
          <form className="relative" onSubmit={handleSearchSubmit}>
            <div className="relative">
              <Input
                type="text"
                value={searchCriteria}
                placeholder="Search for tasks by title or description..."
                className={`pl-10 pr-12`}
                onChange={handleSearchChange}
              />
              <div className="absolute left-3 top-1/2 transform -translate-y-1/2 flex items-center">
                <Search
                  size={20}
                  className={`transition-colors duration-200 ${
                    isSearchActive ? "text-blue-400" : "text-slate-400"
                  }`}
                />
              </div>
              {searchCriteria && (
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  onClick={handleClearSearch}
                  className="absolute right-2 top-1/2 transform -translate-y-1/2 h-8 w-8"
                >
                  <X size={18} />
                </Button>
              )}
            </div>
          </form>
        </div>

        {/* Filter Options Section */}
        <div className="flex justify-center items-center gap-3">
          <TooltipProvider>
            {/* Reset Filter Button */}
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant={isAnyFilterActive ? "destructive" : "secondary"}
                  size="icon"
                  onClick={removeAllFilters}
                  className="transition-all"
                >
                  {isAnyFilterActive ? (
                    <FilterX size={18} />
                  ) : (
                    <Filter size={18} />
                  )}
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                <p>
                  {isAnyFilterActive
                    ? "Reset all filters"
                    : "No active filters"}
                </p>
              </TooltipContent>
            </Tooltip>

            {/* Title Filter */}
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant={
                    filterOptions.sortTitleAsc !== null
                      ? "default"
                      : "secondary"
                  }
                  onClick={filterTaskByTitle}
                  className="flex items-center gap-2 transition-all"
                >
                  {filterOptions.sortTitleAsc ? (
                    <ArrowDownAZ size={18} />
                  ) : filterOptions.sortTitleAsc === false ? (
                    <ArrowDownZA size={18} />
                  ) : (
                    <ChevronsUpDown size={18} />
                  )}
                  <span>Title</span>
                  {filterOptions.sortTitleAsc !== null && (
                    <Badge variant="secondary" className="capitalize">
                      {filterOptions.sortTitleAsc ? "A-Z" : "Z-A"}
                    </Badge>
                  )}
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                <div>
                  Sort by title{" "}
                  {filterOptions.sortTitleAsc !== null
                    ? filterOptions.sortTitleAsc
                      ? "ascending"
                      : "descending"
                    : ""}
                </div>
              </TooltipContent>
            </Tooltip>

            {/* Status Filter */}
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant={
                    filterOptions.sortStatusAsc !== "" ? "default" : "secondary"
                  }
                  onClick={filterTaskByStatus}
                  className="flex items-center gap-2 transition-all"
                >
                  {filterOptions.sortStatusAsc === "pending" ? (
                    <CircleDashed size={18} />
                  ) : filterOptions.sortStatusAsc === "in_progress" ? (
                    <CircleDotDashed size={18} />
                  ) : filterOptions.sortStatusAsc === "completed" ? (
                    <CircleCheck size={18} />
                  ) : (
                    <ChevronsUpDown size={18} />
                  )}
                  <span>Status</span>
                  {filterOptions.sortStatusAsc !== "" && (
                    <Badge variant="secondary" className="capitalize">
                      {filterOptions.sortStatusAsc.replace("_", " ")}
                    </Badge>
                  )}
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                <p>Filter by {filterOptions.sortStatusAsc || "status"}</p>
              </TooltipContent>
            </Tooltip>

            {/* Priority Filter */}
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant={
                    filterOptions.sortPriorityAsc !== ""
                      ? "default"
                      : "secondary"
                  }
                  onClick={filterTaskByPriority}
                  className="flex items-center gap-2 transition-all"
                >
                  {filterOptions.sortPriorityAsc === "high" ? (
                    <ClockAlert size={18} />
                  ) : filterOptions.sortPriorityAsc === "medium" ? (
                    <ClockArrowUp size={18} />
                  ) : filterOptions.sortPriorityAsc === "low" ? (
                    <ClockArrowDown size={18} />
                  ) : (
                    <ChevronsUpDown size={18} />
                  )}
                  <span>Priority</span>
                  {filterOptions.sortPriorityAsc !== "" && (
                    <Badge variant="secondary" className="capitalize">
                      {filterOptions.sortPriorityAsc}
                    </Badge>
                  )}
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                <div>
                  Filter by {filterOptions.sortPriorityAsc || "priority"}
                </div>
              </TooltipContent>
            </Tooltip>

            {/* Date Filter */}
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant={
                    filterOptions.sortDateAsc !== null ? "default" : "secondary"
                  }
                  onClick={filterTaskByDate}
                  className="flex items-center gap-2 transition-all"
                >
                  {filterOptions.sortDateAsc ? (
                    <CalendarArrowUp size={18} />
                  ) : filterOptions.sortDateAsc === false ? (
                    <CalendarArrowDown size={18} />
                  ) : (
                    <ChevronsUpDown size={18} />
                  )}
                  <span>Due Date</span>
                  {filterOptions.sortDateAsc !== null && (
                    <Badge variant="secondary">
                      {filterOptions.sortDateAsc ? "Upcoming" : "Not Imminent"}
                    </Badge>
                  )}
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                <div>
                  Sort by date{" "}
                  {filterOptions.sortDateAsc !== null
                    ? filterOptions.sortDateAsc
                      ? "ascending"
                      : "descending"
                    : ""}
                </div>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </div>

        {/* Date Range Filter */}
        <div className="flex justify-center items-center gap-3 mt-4">
          <Popover>
            <PopoverTrigger asChild>
              <Button
                variant={"outline"}
                className={cn(
                  "w-[240px] justify-start text-center font-normal",
                  !filterOptions.fromDate && "text-muted-foreground"
                )}
              >
                <CalendarIcon className="mr-2 h-4 w-4" />
                {filterOptions.fromDate ? (
                  format(filterOptions.fromDate, "PPP")
                ) : (
                  <span>From Date</span>
                )}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0" align="start">
              <Calendar
                mode="single"
                selected={filterOptions.fromDate}
                onSelect={(date) =>
                  setFilterOptions({ ...filterOptions, fromDate: date })
                }
                initialFocus
              />
            </PopoverContent>
          </Popover>
          <span>-</span>
          <Popover>
            <PopoverTrigger asChild>
              <Button
                variant={"outline"}
                className={cn(
                  "w-[240px] justify-start text-center font-normal",
                  !filterOptions.toDate && "text-muted-foreground"
                )}
              >
                <CalendarIcon className="mr-2 h-4 w-4" />
                {filterOptions.toDate ? (
                  format(filterOptions.toDate, "PPP")
                ) : (
                  <span>To Date</span>
                )}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0" align="start">
              <Calendar
                mode="single"
                selected={filterOptions.toDate}
                onSelect={(date) =>
                  setFilterOptions({ ...filterOptions, toDate: date })
                }
                initialFocus
              />
            </PopoverContent>
          </Popover>
        </div>

        <div className="flex justify-center items-center gap-3">
          <AddTaskPanel user={user} setNeedsRefetch={setNeedsRefetch} />

          <Button
            variant="outline"
            onClick={refetchTaskClicked}
            disabled={isRefetching}
            className="flex gap-2"
          >
            {isRefetching && <RefreshCw className="animate-spin" />}
            Sync Tasks
          </Button>
        </div>

        {!isRefetching && (
          <CardDescription className="text-center">
            Showing {taskList.length} tasks
          </CardDescription>
        )}
      </CardHeader>

      <Separator />

      <CardContent>
        {isLoading && (
          <div className="flex w-full flex-col items-center justify-center py-8 text-muted-foreground">
            <Loader2 size={48} className="animate-spin mb-4" />
            <p className="text-lg">Loading tasks...</p>
          </div>
        )}

        <div>
          <CardTitle className="text-center text-muted-foreground mb-6">
            {taskList.length === 0 && !isLoading && (
              <div className="flex w-full flex-col items-center justify-center py-8 text-muted-foreground">
                <ClipboardList size={48} className="mb-4" />
                <p className="text-lg">
                  No tasks available matching<br></br>
                  {searchCriteria && `\"${searchCriteria}\"`}
                </p>
                {!searchCriteria && (
                  <p className="text-sm mt-2">
                    Click 'Create Task' to add your first task
                  </p>
                )}
              </div>
            )}
          </CardTitle>
          <div className="flex flex-col gap-4 w-1/2 mx-auto">
            {taskList.map((task) => (
              <TaskCard
                key={task.id}
                task={task}
                user={user}
                setNeedsRefetch={setNeedsRefetch}
                devMode={devMode}
              />
            ))}
          </div>
        </div>
      </CardContent>

      <CardFooter>
        <Separator className="w-full" />
      </CardFooter>
    </Card>
  );
}

export default Dashboard;
