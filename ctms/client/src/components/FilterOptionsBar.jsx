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
} from "lucide-react";

const FilterOptionsBar = ({
  sortTitleAsc,
  sortDateAsc,
  sortPriorityAsc,
  sortStatusAsc,
  removeAllFilters,
  filterTaskByTitle,
  filterTaskByDate,
  filterTaskByPriority,
  filterTaskByStatus,
}) => {
  return (
    <div className="flex justify-center items-center space-x-4 border-4 border-gray-700 px-14 py-4 rounded-full w-fit m-auto">
      <button onClick={removeAllFilters} className="pill-red">
        <FilterX size={20} />
      </button>

      {/* Title Filter */}
      <button
        onClick={filterTaskByTitle}
        className={`flex items-center space-x-2 ${
          sortTitleAsc === null
            ? "pill-grey border-slate-700 border-2"
            : "pill-green border-white border-2"
        }`}
      >
        {sortTitleAsc ? <ArrowDownAZ size={20} /> : null}
        {sortTitleAsc === false ? <ArrowUpAZ size={20} /> : null}
        {sortTitleAsc === null ? <ChevronsUpDown size={20} /> : null}
        <div>Title</div>
      </button>

      {/* Date Filter */}
      <button
        onClick={filterTaskByDate}
        className={`flex items-center space-x-2 ${
          sortDateAsc === null
            ? "pill-grey border-slate-700 border-2"
            : "pill-green border-white border-2"
        }`}
      >
        {sortDateAsc ? <CalendarArrowUp size={20} /> : null}
        {sortDateAsc === false ? <CalendarArrowDown size={20} /> : null}
        {sortDateAsc === null ? <ChevronsUpDown size={20} /> : null}
        <div>Date</div>
      </button>

      {/* Priority Filter */}
      <button
        onClick={filterTaskByPriority}
        className={`flex items-center space-x-2 ${
          sortPriorityAsc === ""
            ? "pill-grey border-slate-700 border-2"
            : "pill-green border-white border-2"
        }`}
      >
        {sortPriorityAsc === "high" ? <ClockAlert size={20} /> : null}
        {sortPriorityAsc === "medium" ? <ClockArrowUp size={20} /> : null}
        {sortPriorityAsc === "low" ? <ClockArrowDown size={20} /> : null}
        {sortPriorityAsc === "" ? <ChevronsUpDown size={20} /> : null}
        <div>Priority</div>
      </button>

      {/* Status Filter */}
      <button
        onClick={filterTaskByStatus}
        className={`flex items-center space-x-2 ${
          sortStatusAsc === ""
            ? "pill-grey border-slate-700 border-2"
            : "pill-green border-white border-2"
        }`}
      >
        {sortStatusAsc === "pending" ? <CircleDashed size={20} /> : null}
        {sortStatusAsc === "inprogress" ? <CircleDotDashed size={20} /> : null}
        {sortStatusAsc === "completed" ? <CircleDot size={20} /> : null}
        {sortStatusAsc === "" ? <ChevronsUpDown size={20} /> : null}
        <div>Status</div>
      </button>
    </div>
  );
};

export default FilterOptionsBar;
