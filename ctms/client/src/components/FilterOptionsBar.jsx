import React from "react";
import {
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
import { Button } from "@/components/ui/button";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { Badge } from "@/components/ui/badge";

const FilterOptionsBar = ({
  filterOptions,
  removeAllFilters,
  filterTaskByTitle,
  filterTaskByDate,
  filterTaskByPriority,
  filterTaskByStatus,
}) => {
  const isAnyFilterActive =
    filterOptions.sortDateAsc !== null ||
    filterOptions.sortTitleAsc !== null ||
    filterOptions.sortPriorityAsc !== "" ||
    filterOptions.sortStatusAsc !== "";

  return (
    <div className="flex justify-center items-center gap-3 m-auto">
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
              {isAnyFilterActive ? <FilterX size={18} /> : <Filter size={18} />}
            </Button>
          </TooltipTrigger>
          <TooltipContent>
            <p>
              {isAnyFilterActive ? "Reset all filters" : "No active filters"}
            </p>
          </TooltipContent>
        </Tooltip>

        {/* Title Filter */}
        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              variant={
                filterOptions.sortTitleAsc !== null ? "default" : "secondary"
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
                filterOptions.sortPriorityAsc !== "" ? "default" : "secondary"
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
  );
};

export default FilterOptionsBar;
