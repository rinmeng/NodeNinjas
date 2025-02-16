import React, { useState } from "react";
import { Search, X } from "lucide-react";
import FilterOptionsBar from "./FilterOptionsBar";

const SearchBar = ({ setSearchCriteria, searchCriteria, onSearch }) => {
  const handleSearchSubmit = (e) => {
    e.preventDefault();
    onSearch(searchCriteria); // Trigger the search with the criteria
  };

  const handleClearSearch = () => {
    setSearchCriteria("");
    onSearch(""); // Trigger the search with an empty string
  };

  const [sortTitleAsc, setSortTitleAsc] = useState(null);
  const [sortDateAsc, setSortDateAsc] = useState(null);
  const [sortPriorityAsc, setSortPriorityAsc] = useState("");
  const [sortStatusAsc, setSortStatusAsc] = useState("");

  // if search criteria was erased and empty,
  // trigger search with empty string
  if (!searchCriteria) {
    onSearch("");
  }

  const filterTaskByTitle = () => {
    if (sortTitleAsc === null) {
      setSortTitleAsc(true);
    } else if (sortTitleAsc === true) {
      setSortTitleAsc(false);
    } else {
      setSortTitleAsc(null);
    }
  };

  const filterTaskByDate = () => {
    if (sortDateAsc === null) {
      setSortDateAsc(true);
    } else if (sortDateAsc === true) {
      setSortDateAsc(false);
    } else {
      setSortDateAsc(null);
    }
  };

  const filterTaskByPriority = () => {
    if (sortPriorityAsc === "") {
      setSortPriorityAsc("high");
    } else if (sortPriorityAsc === "high") {
      setSortPriorityAsc("medium");
    } else if (sortPriorityAsc === "medium") {
      setSortPriorityAsc("low");
    } else {
      setSortPriorityAsc("");
    }
  };

  const removeAllFilters = () => {
    setSortTitleAsc(null);
    setSortDateAsc(null);
    setSortPriorityAsc("");
    setSortStatusAsc("");
  };

  const filterTaskByStatus = () => {
    if (sortStatusAsc === "") {
      setSortStatusAsc("pending");
    } else if (sortStatusAsc === "pending") {
      setSortStatusAsc("inprogress");
    } else if (sortStatusAsc === "inprogress") {
      setSortStatusAsc("completed");
    } else {
      setSortStatusAsc("");
    }
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
            sortTitleAsc={sortTitleAsc}
            sortDateAsc={sortDateAsc}
            sortPriorityAsc={sortPriorityAsc}
            sortStatusAsc={sortStatusAsc}
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
