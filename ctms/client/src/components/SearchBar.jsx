import React, { useState, useEffect } from "react";
import { ChevronLeft, ChevronRight, Search, X } from "lucide-react";
import FilterOptionsBar from "./FilterOptionsBar";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { Card, CardContent } from "@/components/ui/card";

const SearchBar = ({
  setSearchCriteria,
  searchCriteria,
  filterOptions,
  setFilterOptions,
}) => {
  const [isSearchActive, setIsSearchActive] = useState(false);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    setSearchCriteria(searchCriteria);
    setIsSearchActive(true);
  };

  const handleClearSearch = () => {
    setSearchCriteria("");
    setIsSearchActive(false);
  };

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

  return (
    <div className="m-5 w-3/4 fixed top-0 translate-y-1/3 z-30 transition-all duration-200">
      <Card
        className={`bg-slate-900/80 backdrop-blur-md border-slate-700 transition-all duration-500 w-full 
        flex flex-row justify-center items-center rounded-full`}
      >
        <CardContent className="w-auto flex-grow py-4 px-6">
          <div className="flex flex-col m-auto justify-center items-center">
            <form
              className="w-2/4 relative hover:w-3/4 transition-all duration-500"
              onSubmit={handleSearchSubmit}
            >
              <div className="relative flex items-center">
                <Input
                  type="text"
                  value={searchCriteria}
                  placeholder="Search for tasks by title or description..."
                  className={`pl-10 pr-12 py-6 rounded-full border-slate-600 bg-slate-800/90 text-primary-foreground
                    ${isSearchActive ? "border-blue-400" : ""} 
                    focus-visible:ring-blue-500`}
                  onChange={(e) => {
                    setSearchCriteria(e.target.value);
                    setIsSearchActive(e.target.value.length > 0);
                  }}
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
        </CardContent>
      </Card>
    </div>
  );
};

export default SearchBar;
