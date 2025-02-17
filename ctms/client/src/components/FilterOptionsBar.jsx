import React from "react";
import {
  FilterX,
  ArrowDownAZ,
  ArrowUpAZ,
  ChevronsUpDown,
  CalendarArrowUp,
  CalendarArrowDown,
  ClockAlert,
  ClockArrowUp,
  ClockArrowDown,
  CircleDashed,
  CircleDotDashed,
  CircleDot,
  Filter,
  ArrowDownZA,
} from "lucide-react";

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
    <div className="flex justify-center items-center space-x-4  m-auto">
      <button
        onClick={removeAllFilters}
        className={
          isAnyFilterActive
            ? "pill-red border-white border-4"
            : "pill-grey border-slate-700 border-4"
        }
      >
        {isAnyFilterActive ? <FilterX size={20} /> : <Filter size={20} />}
      </button>

      {/* Title Filter */}
      <button
        onClick={filterTaskByTitle}
        className={`flex items-center space-x-2 ${
          filterOptions.sortTitleAsc === null
            ? "pill-grey border-slate-700 border-4"
            : "pill-green border-white border-4"
        }`}
      >
        {filterOptions.sortTitleAsc ? <ArrowDownAZ size={20} /> : null}
        {filterOptions.sortTitleAsc === false ? (
          <ArrowDownZA size={20} />
        ) : null}
        {filterOptions.sortTitleAsc === null ? (
          <ChevronsUpDown size={20} />
        ) : null}
        <div>Title</div>
      </button>

      {/* Date Filter */}
      <button
        onClick={filterTaskByDate}
        className={`flex items-center space-x-2 ${
          filterOptions.sortDateAsc === null
            ? "pill-grey border-slate-700 border-4"
            : "pill-green border-white border-4"
        }`}
      >
        {filterOptions.sortDateAsc ? <CalendarArrowUp size={20} /> : null}
        {filterOptions.sortDateAsc === false ? (
          <CalendarArrowDown size={20} />
        ) : null}
        {filterOptions.sortDateAsc === null ? (
          <ChevronsUpDown size={20} />
        ) : null}
        <div>Date</div>
      </button>

      {/* Priority Filter */}
      <button
        onClick={filterTaskByPriority}
        className={`flex items-center space-x-2 ${
          filterOptions.sortPriorityAsc === ""
            ? "pill-grey border-slate-700 border-4"
            : "pill-green border-white border-4"
        }`}
      >
        {filterOptions.sortPriorityAsc === "high" ? (
          <ClockAlert size={20} />
        ) : null}
        {filterOptions.sortPriorityAsc === "medium" ? (
          <ClockArrowUp size={20} />
        ) : null}
        {filterOptions.sortPriorityAsc === "low" ? (
          <ClockArrowDown size={20} />
        ) : null}
        {filterOptions.sortPriorityAsc === "" ? (
          <ChevronsUpDown size={20} />
        ) : null}
        <div>Priority</div>
      </button>

      {/* Status Filter */}
      <button
        onClick={filterTaskByStatus}
        className={`flex items-center space-x-2 ${
          filterOptions.sortStatusAsc === ""
            ? "pill-grey border-slate-700 border-4"
            : "pill-green border-white border-4"
        }`}
      >
        {filterOptions.sortStatusAsc === "pending" ? (
          <CircleDashed size={20} />
        ) : null}
        {filterOptions.sortStatusAsc === "in_progress" ? (
          <CircleDotDashed size={20} />
        ) : null}
        {filterOptions.sortStatusAsc === "completed" ? (
          <CircleDot size={20} />
        ) : null}
        {filterOptions.sortStatusAsc === "" ? (
          <ChevronsUpDown size={20} />
        ) : null}
        <div>Status</div>
      </button>
    </div>
  );
};

export default FilterOptionsBar;
