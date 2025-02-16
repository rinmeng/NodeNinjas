import React, { useState, useEffect } from "react";
import { Search, X } from "lucide-react";
import FilterOptionsBar from "./FilterOptionsBar";

const SearchBar = ({
  setSearchCriteria,
  searchCriteria,
  filterOptions,
  setFilterOptions,
}) => {
  const handleSearchSubmit = (e) => {
    e.preventDefault();
    setSearchCriteria(searchCriteria); // Trigger the search with the criteria
  };

  const handleClearSearch = () => {
    setSearchCriteria("");
  };
  // if search criteria was erased and empty, set tasks to all tasks
  // Instead, use useEffect if you need to handle empty search criteria
  useEffect(() => {
    if (!searchCriteria) {
      setSearchCriteria("");
    }
  }, [searchCriteria, setSearchCriteria]);

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

  return (
    <div className="m-5 w-1/2">
      <div className="task-bg rounded-full">
        <div className="flex flex-col m-auto justify-center items-center space-x-4">
          <form className="w-3/4 relative" onSubmit={handleSearchSubmit}>
            <input
              type="text"
              value={searchCriteria}
              placeholder="Search for tasks..."
              className="forms w-full pl-4 pr-16 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              onChange={(e) => setSearchCriteria(e.target.value)}
            />
            <div className="absolute right-3 top-1/2 transform -translate-y-1/2 flex space-x-2 items-center">
              <button
                type="button"
                onClick={handleClearSearch}
                className="text-gray-500 hover:text-white t200e"
              >
                <X size={30} />
              </button>
              <button
                type="submit"
                className="text-gray-500 hover:text-white t200e"
              >
                <Search size={25} />
              </button>
            </div>
          </form>
        </div>

        {/* Filter options */}
        <div className="mt-4">
          <FilterOptionsBar
            filterOptions={filterOptions}
            removeAllFilters={removeAllFilters}
            filterTaskByTitle={filterTaskByTitle}
            filterTaskByDate={filterTaskByDate}
            filterTaskByPriority={filterTaskByPriority}
            filterTaskByStatus={filterTaskByStatus}
          />
        </div>
      </div>
    </div>
  );
};

export default SearchBar;
