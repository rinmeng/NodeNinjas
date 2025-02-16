import React, { useState } from "react";
import { Navigate } from "react-router-dom";
import SearchBar from "../components/SearchBar";
import TaskDashboard from "../components/TaskDashboard";
import AddTaskPanel from "../components/AddTaskPanel";
import Feedback2 from "../components/subcomponents/Feedback2";
import { ListMinus, ListPlus, ListX } from "lucide-react";

const Dashboard = ({ sessionUser, devMode }) => {
  const [searchCriteria, setSearchCriteria] = useState("");
  const [showAddTaskPanel, setShowAddTaskPanel] = useState(false);
  const [feedbackMessage, setFeedbackMessage] = useState("");
  const [showFeedbackMessage, setShowFeedbackMessage] = useState(false);
  const [addedTaskSuccessfully, setAddedTaskSuccessfully] = useState(false);

  // The search function, triggered when the search button is clicked in
  // the SearchBar component
  const handleSearch = (criteria) => {
    console.log("Searching for tasks with criteria:", criteria);
    // Add actual search logic here (e.g., filtering tasks, API call, etc.)
  };

  return (
    <div className="flex flex-col items-center justify-center py-20 mp5">
      <SearchBar
        setSearchCriteria={setSearchCriteria}
        searchCriteria={searchCriteria}
        onSearch={handleSearch}
      />
      <TaskDashboard
        showAddTaskPanel={showAddTaskPanel}
        setShowAddTaskPanel={setShowAddTaskPanel}
      />
      <AddTaskPanel
        showAddTaskPanel={showAddTaskPanel}
        setShowAddTaskPanel={setShowAddTaskPanel}
        setShowFeedbackMessage={setShowFeedbackMessage}
        setFeedbackMessage={setFeedbackMessage}
        setAddedTaskSuccessfully={setAddedTaskSuccessfully}
        sessionUser={sessionUser}
      />
      {showFeedbackMessage && (
        <Feedback2
          icon={
            addedTaskSuccessfully ? <ListPlus size={24} /> : <ListX size={24} />
          }
          message={feedbackMessage}
          isSuccess={addedTaskSuccessfully}
        />
      )}
    </div>
  );
};

export default Dashboard;
