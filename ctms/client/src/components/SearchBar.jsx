import React, { useState, useEffect } from "react";
import {
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  Search,
  X,
} from "lucide-react";
import FilterOptionsBar from "./FilterOptionsBar";
import IconButton from "./subcomponents/IconButton";

const SearchBar = ({
  setSearchCriteria,
  searchCriteria,
  filterOptions,
  setFilterOptions,
}) => {
  // Used for setting the search icon to be active or not
  const [isSearchActive, setIsSearchActive] = useState(false);
  // New state for controlling the chevron/sidebar expansion
  const [isExpanded, setIsExpanded] = useState(false);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    setSearchCriteria(searchCriteria); // Trigger the search with the criteria
    setIsSearchActive(true);
  };

  const handleClearSearch = () => {
    setSearchCriteria("");
    setIsSearchActive(false);
  };

  // if search criteria was erased and empty, set tasks to all tasks
  useEffect(() => {
    if (!searchCriteria) {
      setSearchCriteria("");
      setIsSearchActive(false);
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

  // Toggle chevron and sidebar expansion
  const toggleExpansion = () => {
    setIsExpanded(!isExpanded);
  };

  return (
    <div className="m-5 w-3/4 fixed top-0 translate-y-1/3 z-30 t200e">
      <div
        className={`glass-slate mp5 rounded-full t500e w-full 
        flex flex-row justify-center items-center
        ${isExpanded ? "translate-x-full" : " translate-x-0"}`}
      >
        {/* Chevron button that changes icon based on state */}
        <div onClick={toggleExpansion} className="cursor-pointer t200e">
          {isExpanded ? (
            <IconButton
              icon={<ChevronLeft size={50} />}
              color="text-white opacity-50 hover:opacity-100 hover:bg-blue-600"
              onClick={toggleExpansion}
              tooltip={"Toggle Search Bar"}
            />
          ) : (
            <IconButton
              icon={<ChevronRight size={50} />}
              color="text-white opacity-50 hover:opacity-100 hover:bg-blue-600"
              onClick={toggleExpansion}
              tooltip={"Toggle Search Bar"}
            />
          )}
        </div>

        <div className="w-auto flex-grow">
          <div className="flex flex-col m-auto justify-center items-center space-x-4">
            <form
              className="w-2/4 relative hover:w-3/4 t500e"
              onSubmit={handleSearchSubmit}
            >
              <div className="relative flex items-center">
                <input
                  type="text"
                  value={searchCriteria}
                  placeholder="Search for tasks by title or description..."
                  className="forms w-full pl-10 pr-16 py-2 focus:bg-slate-900 rounded-full"
                  onChange={(e) => {
                    setSearchCriteria(e.target.value);
                    setIsSearchActive(e.target.value.length > 0);
                  }}
                />
                <div className="absolute left-3 top-1/2 transform -translate-y-1/2 flex items-center">
                  <Search
                    size={25}
                    className={`${
                      isSearchActive ? "text-white" : "text-gray-500"
                    } t200e`}
                  />
                </div>
                <button
                  type="button"
                  onClick={handleClearSearch}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-white"
                >
                  <X size={30} />
                </button>
              </div>
            </form>
          </div>
          {/* Filter options */}
          <div className="mt-4 w-full">
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
    </div>
  );
};

export default SearchBar;
