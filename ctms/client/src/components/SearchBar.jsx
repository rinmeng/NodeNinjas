import React from "react";
import { Search, X } from "lucide-react";

const SearchBar = ({ setSearchCriteria, searchCriteria, onSearch }) => {
  const handleSearchSubmit = (e) => {
    e.preventDefault();
    onSearch(searchCriteria); // Trigger the search with the criteria
  };

  return (
    <div className="mp5 w-1/2">
      <div className="task-bg rounded-full">
        <div className="flex flex-col m-auto justify-center items-center space-x-4">
          <form className="w-3/4 relative" onSubmit={handleSearchSubmit}>
            <button
              type="submit" // This makes the button trigger the form submit
              className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-white t200e"
            >
              <Search size={20} />
            </button>
            <input
              type="text"
              value={searchCriteria}
              placeholder="Search for tasks..."
              className="forms w-full pl-10 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              onChange={(e) => setSearchCriteria(e.target.value)}
            />
            <button
              type="button"
              onClick={() => setSearchCriteria("")}
              className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-white t200e"
            >
              <X size={25} />
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default SearchBar;
