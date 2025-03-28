import React, { useState } from "react";
import { Navigate } from "react-router-dom";
import {
  CalendarIcon,
  ClipboardList,
  RefreshCw,
  Search,
  X,
  FilterX,
  Filter,
  ArrowDownAZ,
  ArrowDownZA,
  ChevronsUpDown,
  CalendarArrowUp,
  CalendarArrowDown,
  ClockAlert,
  ClockArrowUp,
  ClockArrowDown,
  CircleDashed,
  CircleDotDashed,
  CircleCheck,
  Loader2,
} from "lucide-react";
import TaskCard from "@/src/components/subcomponents/TaskCard";
import AddTaskPanel from "@/src/components/AddTaskPanel";
import FilterButton from "@/src/components/subcomponents/FilterButton";
import useTasks from "@/hooks/useTasks";
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
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { useAuth } from "@/utils/AuthProvider";
import { useToast } from "@/utils/ToastProvider";
import { format, set } from "date-fns";
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
  const [isRefetching, setIsRefetching] = useState(false);
  const [isSearchActive, setIsSearchActive] = useState(false);

);

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

  const refetchTaskClicked = () => {
    setIsRefetching(true);
    triggerRefetch();

    // Set timeout for 750ms to ensure animation is visible
    setTimeout(() => {
      setIsRefetching(false);
      setFeedbackMessage({
        title: "Success",
        description: "Tasks have been successfully synced",
      });
    }, 750);
  };

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

  // SearchBar Component
  const SearchBar = () => (
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
  );

  // DateRangeSelector Component
  const DateRangeSelector = () => (
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
            onSelect={(date) => handleFilterChange("fromDate", date)}
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
            onSelect={(date) => handleFilterChange("toDate", date)}
            initialFocus
          />
        </PopoverContent>
      </Popover>
    </div>
  );

  // Empty Tasks Component
  const EmptyTasks = () => (
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
  );

  // LoadingIndicator Component
  const LoadingIndicator = () => (
    <div className="flex w-full flex-col items-center justify-center py-8 text-muted-foreground">
      <Loader2 size={48} className="animate-spin mb-4" />
      <p className="text-lg">Loading tasks...</p>
    </div>
  );

  return (
    <Card className="container mx-auto w-full my-24 animate-fade-in">
      <CardHeader className={"space-y-4"}>
        {/* Search Section */}
        <SearchBar />

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
            <FilterButton
              active={filterOptions.sortTitleAsc}
              onClick={() => handleFilterChange("sortTitleAsc")}
              icon={ChevronsUpDown}
              activeIcon={
                filterOptions.sortTitleAsc ? ArrowDownAZ : ArrowDownZA
              }
              label="Title"
              badgeText={filterOptions.sortTitleAsc ? "A-Z" : "Z-A"}
              tooltipText={`Sort by title ${
                filterOptions.sortTitleAsc !== null
                  ? filterOptions.sortTitleAsc
                    ? "ascending"
                    : "descending"
                  : ""
              }`}
            />

            {/* Status Filter */}
            <FilterButton
              active={filterOptions.sortStatusAsc}
              onClick={() => handleFilterChange("sortStatusAsc")}
              icon={ChevronsUpDown}
              activeIcon={
                filterOptions.sortStatusAsc === "pending"
                  ? CircleDashed
                  : filterOptions.sortStatusAsc === "in_progress"
                  ? CircleDotDashed
                  : CircleCheck
              }
              label="Status"
              badgeText={filterOptions.sortStatusAsc.replace("_", " ")}
              tooltipText={`Filter by ${
                filterOptions.sortStatusAsc || "status"
              }`}
            />

            {/* Priority Filter */}
            <FilterButton
              active={filterOptions.sortPriorityAsc}
              onClick={() => handleFilterChange("sortPriorityAsc")}
              icon={ChevronsUpDown}
              activeIcon={
                filterOptions.sortPriorityAsc === "high"
                  ? ClockAlert
                  : filterOptions.sortPriorityAsc === "medium"
                  ? ClockArrowUp
                  : ClockArrowDown
              }
              label="Priority"
              badgeText={filterOptions.sortPriorityAsc}
              tooltipText={`Filter by ${
                filterOptions.sortPriorityAsc || "priority"
              }`}
            />

            {/* Date Filter */}
            <FilterButton
              active={filterOptions.sortDateAsc}
              onClick={() => handleFilterChange("sortDateAsc")}
              icon={ChevronsUpDown}
              activeIcon={
                filterOptions.sortDateAsc ? CalendarArrowUp : CalendarArrowDown
              }
              label="Due Date"
              badgeText={
                filterOptions.sortDateAsc ? "Upcoming" : "Not Imminent"
              }
              tooltipText={`Sort by date ${
                filterOptions.sortDateAsc !== null
                  ? filterOptions.sortDateAsc
                    ? "ascending"
                    : "descending"
                  : ""
              }`}
            />
          </TooltipProvider>
        </div>

        {/* Date Range Filter */}
        <DateRangeSelector />

        {/* Actions */}
        <div className="flex justify-center items-center gap-3">
          <AddTaskPanel user={user} setNeedsRefetch={triggerRefetch} />

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

        {/* Task Count */}
        {!isRefetching && (
          <CardDescription className="text-center">
            Showing {taskList.length} tasks
          </CardDescription>
        )}
      </CardHeader>

      <Separator />

      <CardContent>
        {/* Loading State */}
        {isLoading && <LoadingIndicator />}

        <div>
          <CardTitle className="text-center text-muted-foreground mb-6">
            {taskList.length === 0 && !isLoading && <EmptyTasks />}
          </CardTitle>

          {/* Task List */}
          <div className="flex flex-col gap-4 w-1/2 mx-auto">
            {taskList.map((task) => (
              <TaskCard
                key={task.id}
                task={task}
                user={user}
                setNeedsRefetch={triggerRefetch}
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
