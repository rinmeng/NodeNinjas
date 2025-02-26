import React, { useState, useEffect, useCallback } from "react";
import { UserSearch, X, Users, UserRoundCheck } from "lucide-react";
import IconButton from "./subcomponents/IconButton";
import IconizedButton from "./subcomponents/IconizedButton";
import proxy from "../utils/proxy";

const AssignTaskPanel = ({
  task,
  isOpen,
  onClose,
  setNeedsRefetch,
  setFeedbackMessage,
  sessionUser,
}) => {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedUsers, setSelectedUsers] = useState([]);
  const [availableUsers, setAvailableUsers] = useState([]);
  const [isLoading, setIsLoading] = useState(false);

  const handleSearch = (e) => {
    setSearchQuery(e.target.value);
  };

  const handleAssignUsers = async () => {
    if (selectedUsers.length === 0) {
      setFeedbackMessage(
        "Please select at least one user to assign the task to."
      );
      return;
    }

    try {
      const userIds = selectedUsers.map((user) => user.id);
      const response = await fetch(`${proxy}/task/assign/${task.id}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify({ user_ids: userIds }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Failed to assign task to users");
      }
      setSelectedUsers([]);
      setFeedbackMessage("Task assigned successfully!");
      setNeedsRefetch(true);
      onClose();
    } catch (error) {
      setFeedbackMessage("Failed to assign task: " + error.message);
    }
  };

  const toggleUserSelection = (user) => {
    if (selectedUsers.find((u) => u.id === user.id)) {
      setSelectedUsers(selectedUsers.filter((u) => u.id !== user.id));
    } else {
      setSelectedUsers([...selectedUsers, user]);
    }
  };

  const findAvailableUsers = useCallback(async () => {
    setIsLoading(true);
    try {
      const response = await fetch(`${proxy}/user/under/${sessionUser.id}`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Failed to fetch available users");
      }

      const data = await response.json();
      setAvailableUsers(data);
    } catch (error) {
      console.error("Error fetching available users:", error);
      setFeedbackMessage("Failed to fetch available users: " + error.message);
    } finally {
      setIsLoading(false);
    }
  }, [sessionUser.id, setFeedbackMessage]);

  // Filter available users based on search query
  const filteredUsers = availableUsers.filter((user) => {
    if (!searchQuery) return true;

    const query = searchQuery.toLowerCase();
    return (
      user.username?.toLowerCase().includes(query) ||
      user.display_name?.toLowerCase().includes(query) ||
      user.id?.toString().includes(query)
    );
  });

  useEffect(() => {
    if (isOpen && task) {
      // Fetch available users when the panel opens
      findAvailableUsers();
    }
  }, [isOpen, task, findAvailableUsers]);

  if (!isOpen) return null;

  return (
    <div className="fixed top-0 left-0 w-full h-full bg-black bg-opacity-50 z-50">
      <div className="fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 bg-slate-900 rounded-xl p-8 w-1/2 h-auto flex flex-col space-y-4 border-2 border-slate-600">
        <div className="flex flex-row justify-between items-center">
          <div className="title-sm">Assign Task</div>
          <IconButton
            icon={<X size={30} />}
            onClick={onClose}
            color="hover:bg-white hover:text-slate-950"
          />
        </div>

        <div className="border-b border-slate-600 my-4"></div>

        {/* Task Information */}
        <div className="bg-slate-800 p-4 rounded-lg">
          <h2 className="text-lg font-semibold text-white mb-2">
            Task: {task.name}
          </h2>
          <p className="text-slate-300 text-sm truncate">{task.description}</p>
        </div>

        <h1 className="text-md mt-4">Search Users</h1>
        <div className="relative">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <UserSearch size={20} className="text-slate-400" />
          </div>
          <input
            type="text"
            placeholder="Search by name."
            className="forms text-left pl-10 w-full"
            value={searchQuery}
            onChange={handleSearch}
          />
        </div>

        {/* Selected Users */}
        <div className="mt-4">
          <h1 className="text-md mb-2">
            Selected Users ({selectedUsers.length})
          </h1>
          <div className="flex flex-wrap max-h-32 overflow-y-auto bg-slate-800 rounded-lg p-2 space-x-1">
            {selectedUsers.length > 0 ? (
              selectedUsers.map((user) => (
                <div
                  key={user.id}
                  className="flex items-center bg-green-600 cursor-pointer hover:bg-red-600 w-fit pill"
                  onClick={() => toggleUserSelection(user)}
                >
                  <span>
                    {user.username} ({user.display_name})
                  </span>
                </div>
              ))
            ) : (
              <div className="text-slate-400 text-center py-2">
                No users selected
              </div>
            )}
          </div>
        </div>

        {/* Search Results */}
        <div className="mt-4">
          <h1 className="text-md mb-2">Search Results</h1>
          <div className="flex flex-wrap max-h-40 overflow-y-auto bg-slate-800 rounded-lg p-2 space-x-1">
            {isLoading ? (
              <div className="text-slate-400 text-center py-4">
                Loading available users...
              </div>
            ) : filteredUsers.length > 0 ? (
              filteredUsers.map((user) => (
                <div
                  key={user.id}
                  className="flex items-center bg-slate-700 cursor-pointer hover:bg-blue-600 w-fit pill"
                  onClick={() => toggleUserSelection(user)}
                >
                  <span>
                    {user.username} ({user.display_name})
                  </span>
                </div>
              ))
            ) : (
              <div className="text-slate-400 text-center py-4">
                <Users size={24} className="mx-auto mb-2" />
                {searchQuery
                  ? "No users match your search"
                  : "No available users found"}
              </div>
            )}
          </div>
        </div>

        <div className="border-b border-slate-600"></div>
        <div className="flex justify-center items-center">
          <IconizedButton
            icon={<UserRoundCheck size={24} className="ml-2" />}
            text="Assign Users"
            onClick={handleAssignUsers}
            btnStyle="btn-blue"
          />
        </div>
      </div>
    </div>
  );
};

export default AssignTaskPanel;
