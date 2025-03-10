import React, { useState, useEffect } from "react";
import {
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
} from "lucide-react";
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
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

const TaskDashboard = ({
  tasks,
  user,
  setNeedsRefetch,
  notifications,
  setNotifications,
  needsRefetch,
  setFeedbackMessage,
  devMode,
  setNotificationToAdd,
  filterOptions,
  setFilterOptions,
  searchCriteria,
  setSearchCriteria,
}) => {
  // Ensure tasks is always an array
  const taskList = Array.isArray(tasks) ? tasks : [];
  const [isRefetching, setIsRefetching] = useState(false);
  const [isSearchActive, setIsSearchActive] = useState(false);

  const refetchTaskClicked = () => {
    setIsRefetching(true);
    setNeedsRefetch(true);
  };

  useEffect(() => {
    if (!needsRefetch) {
      // set time out for 1 second to simulate refetching
      setTimeout(() => {
        setIsRefetching(false);
        setFeedbackMessage({
          title: "Success",
          description: "Tasks have been successfully synced",
        });
      }, 750);
    }
  }, [needsRefetch, setNeedsRefetch, setFeedbackMessage, isRefetching]);

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

  return (
    <Card className="w-full mt-8">
      <CardHeader>
        {/* Search and Filter Section */}
        <div className="mb-6">
          <form className="relative" onSubmit={handleSearchSubmit}>
            <div className="relative">
              <Input
                type="text"
                value={searchCriteria}
                placeholder="Search for tasks by title or description..."
                className={`pl-10 pr-12 py-6 rounded-lg border-slate-600 bg-slate-800/90 text-primary-foreground
                  ${isSearchActive ? "border-blue-400" : ""} 
                  focus-visible:ring-blue-500`}
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
                  className="absolute right-2 top-1/2 transform -translate-y-1/2 h-8 w-8 text-slate-400 hover:text-white hover:bg-slate-700"
                >
                  <X size={18} />
                </Button>
              )}
            </div>
          </form>
        </div>

        {/* Filter Options Section */}
        <div className="flex justify-center items-center gap-3 mb-6">
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
                    <Badge variant="secondary" className="ml-1">
                      {filterOptions.sortTitleAsc ? "A-Z" : "Z-A"}
                    </Badge>
                  )}
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                <p>
                  Sort by title{" "}
                  {filterOptions.sortTitleAsc !== null
                    ? filterOptions.sortTitleAsc
                      ? "ascending"
                      : "descending"
                    : ""}
                </p>
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
                    <Badge variant="secondary" className="ml-1">
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
                    <Badge variant="secondary" className="ml-1">
                      {filterOptions.sortPriorityAsc}
                    </Badge>
                  )}
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                <p>Filter by {filterOptions.sortPriorityAsc || "priority"}</p>
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
                  <span>Date</span>
                  {filterOptions.sortDateAsc !== null && (
                    <Badge variant="secondary" className="ml-1">
                      {filterOptions.sortDateAsc ? "Oldest" : "Newest"}
                    </Badge>
                  )}
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                <p>
                  Sort by date{" "}
                  {filterOptions.sortDateAsc !== null
                    ? filterOptions.sortDateAsc
                      ? "ascending"
                      : "descending"
                    : ""}
                </p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </div>

        <Separator className="mb-6" />

        <div className="flex justify-center items-center space-x-4">
          <AddTaskPanel
            setFeedbackMessage={setFeedbackMessage}
            user={user}
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
                  user={user}
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
