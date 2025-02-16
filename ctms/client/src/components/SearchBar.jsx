import React from "react";
import { Search, X } from "lucide-react";

const SearchBar = ({ setSearchCriteria, searchCriteria, onSearch }) => {
  const handleSearchSubmit = (e) => {
    e.preventDefault();
    onSearch(searchCriteria); // Trigger the search with the criteria
  };

  const handleClearSearch = () => {
    setSearchCriteria("");
    onSearch(""); // Trigger the search with an empty string
  };

  // if search criteria was erased and empty,
  // trigger search with empty string
  if (!searchCriteria) {
    onSearch("");
  }

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
      </div>
    </div>
  );
};

export default SearchBar;
