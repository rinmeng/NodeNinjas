import React, { useState, useEffect, useCallback } from "react";
import {
  UserSearch,
  X,
  UserRoundCheck,
  UserX,
  UserPlus,
  UserRoundMinus,
} from "lucide-react";
import IconButton from "./subcomponents/IconButton";
import IconizedButton from "./subcomponents/IconizedButton";
import proxy from "../utils/proxy";

const AssignTaskPanel = ({
  task,
  isOpen,
  onClose,
  setNeedsRefetch,
  setFeedbackMessage,
  setNotificationToAdd,
  sessionUser,
}) => {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedUsers, setSelectedUsers] = useState([]);
  const [preAssignedUsers, setPreAssignedUsers] = useState([]); // Track already assigned users
  const [usersToUnassign, setUsersToUnassign] = useState([]); // Track users to be unassigned
  const [availableUsers, setAvailableUsers] = useState([]);
  const [isLoading, setIsLoading] = useState(false);

  const handleSearch = (e) => {
    setSearchQuery(e.target.value);
  };

  const getDateWithRelativeTime = (dateString) => {
    if (!dateString) return "Invalid Date"; // Handle empty values safely

    // Ensure date is parsed correctly
    const taskDate = new Date(dateString);
    if (isNaN(taskDate.getTime())) return "Invalid Date"; // Handle parsing errors

    const now = new Date();
    const diffInMs = taskDate.getTime() - now.getTime();
    const diffInDays = Math.ceil(diffInMs / (1000 * 60 * 60 * 24));

    // Format the date properly
    const formattedDate = taskDate.toLocaleDateString("en-CA", {
      weekday: "short",
      month: "numeric",
      day: "numeric",
      year: "numeric",
    });

    if (diffInDays === 0) return `${formattedDate} (Today)`;
    if (diffInDays === 1) return `${formattedDate} (Tomorrow)`;
    if (diffInDays > 1) return `${formattedDate} (In ${diffInDays} days)`;
    if (diffInDays < 0)
      return `${formattedDate} (${Math.abs(diffInDays)} days ago)`;

    return formattedDate;
  };

  const handleManageUsers = async () => {
    // Handle case when there's nothing to do
    if (selectedUsers.length === 0 && usersToUnassign.length === 0) {
      setFeedbackMessage(
        "Please select users to assign or unassign from the task."
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
      //console.log(selectedUsers);

      // First, handle new assignments if there are any
      if (selectedUsers.length > 0) {
        // Filter out pre-assigned users that are not in the usersToUnassign list
        const userIdsToAssign = selectedUsers
          .filter(
            (user) =>
              !preAssignedUsers.some((pu) => pu.id === user.id) ||
              usersToUnassign.some((uu) => uu.id === user.id)
          )
          .map((user) => user.id);

        if (userIdsToAssign.length > 0) {
          const assignResponse = await fetch(
            `${proxy}/task/assign/${task.id}`,
            {
              method: "POST",
              headers: {
                "Content-Type": "application/json",
              },
              credentials: "include",
              body: JSON.stringify({ user_ids: userIdsToAssign }),
            }
          );

          if (!assignResponse.ok) {
            const errorData = await assignResponse.json();
            throw new Error(
              errorData.message || "Failed to assign task to users"
            );
          }
        }
      }

      // Handle unassignments if there are any - filter out task owner
      const userIdsToUnassign = usersToUnassign
        .filter((user) => !selectedUsers.some((su) => su.id === user.id))
        .filter((user) => user.id !== task.owner_id) // Prevent task owner from being unassigned
        .map((user) => user.id);

      if (userIdsToUnassign.length > 0) {
        const unassignResponse = await fetch(
          `${proxy}/task/unassign/${task.id}`,
          {
            method: "DELETE",
            headers: {
              "Content-Type": "application/json",
            },
            credentials: "include",
            body: JSON.stringify({ user_ids: userIdsToUnassign }),
          }
        );

        if (!unassignResponse.ok) {
          const errorData = await unassignResponse.json();
          throw new Error(
            errorData.message || "Failed to unassign users from task"
          );
        }
      }

      setSelectedUsers([]);

      setFeedbackMessage("Task assigned successfully!");
      setNotificationToAdd({user_ids: userIds, message: `You have been assigned a task, ${task.name}`});
      setUsersToUnassign([]);
      setFeedbackMessage("Task assignments updated successfully!");
      setNeedsRefetch(true);
      onClose();
    } catch (error) {
      setFeedbackMessage("Failed to update task assignments: " + error.message);
    }
  };

  const toggleUserSelection = (user) => {
    // Check if user is the task owner
    if (user.id === task.owner_id) {
      // Do nothing if user is task owner - they cannot be unassigned
      return;
    }

    // Check if user is pre-assigned
    const isPreAssigned = preAssignedUsers.some((u) => u.id === user.id);

    if (isPreAssigned) {
      // If pre-assigned and not in usersToUnassign, add to usersToUnassign
      if (!usersToUnassign.some((u) => u.id === user.id)) {
        setUsersToUnassign([...usersToUnassign, user]);
        // Also remove from selectedUsers if present
        setSelectedUsers(selectedUsers.filter((u) => u.id !== user.id));
      } else {
        // If already in usersToUnassign, remove from it (cancel unassigning)
        setUsersToUnassign(usersToUnassign.filter((u) => u.id !== user.id));
        // And add back to selectedUsers
        setSelectedUsers([...selectedUsers, user]);
      }
    } else {
      // Regular toggle for non-pre-assigned users
      if (selectedUsers.some((u) => u.id === user.id)) {
        setSelectedUsers(selectedUsers.filter((u) => u.id !== user.id));
      } else {
        setSelectedUsers([...selectedUsers, user]);
      }
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
      return data; // Return the users data for potential use
    } catch (error) {
      console.error("Error fetching available users:", error);
      setFeedbackMessage(error.message || "Failed to fetch available users");
      return []; // Return empty array in case of error
    } finally {
      setIsLoading(false);
    }
  }, [sessionUser.id, setFeedbackMessage]);

  const fetchAssignedUsers = useCallback(
    async (allAvailableUsers) => {
      if (!task) return;

      try {
        // Fetch all assignedto records for this task
        const response = await fetch(`${proxy}/task/assignedto/all`, {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
          },
          credentials: "include",
        });

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(
            errorData.message || "Failed to fetch assigned users"
          );
        }

        const assignedRecords = await response.json();

        // Filter records related to current task
        const taskAssignments = assignedRecords.filter(
          (record) => record.task_id === task.id
        );

        // Get the complete user details for each assigned user
        const userIds = taskAssignments.map((record) => record.user_id);

        // If there are no assigned users, return early
        if (userIds.length === 0) return;

        // Find these users in the available users array
        const assignedUsers = allAvailableUsers.filter((user) =>
          userIds.includes(user.id)
        );

        // Set them as selected and pre-assigned
        setSelectedUsers(assignedUsers);
        setPreAssignedUsers(assignedUsers);
      } catch (error) {
        console.error("Error fetching assigned users:", error);
        setFeedbackMessage(
          "Failed to fetch currently assigned users: " + error.message
        );
      }
    },
    [task, setFeedbackMessage]
  );

  const fetchAssignedUsersNotAdmin = useCallback(async () => {
    if (!task) return;
    setIsLoading(true);

    try {
      // Fetch all assignedto records for this task, and put them in the selected users
      const response = await fetch(`${proxy}/task/id/${task.id}`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Failed to fetch assigned users");
      }

      const data = await response.json();
      setSelectedUsers(data.assigned_users || []);
    } catch (error) {
      console.error("Error fetching assigned users:", error);
      setFeedbackMessage(
        error.message || "Failed to fetch currently assigned users"
      );
    } finally {
      setIsLoading(false);
    }
  }, [task, setFeedbackMessage]);

  // Initialize data when panel opens
  useEffect(() => {
    if (isOpen && task) {
      if (sessionUser.role === "admin") {
        const initializeData = async () => {
          // First fetch all available users
          const users = await findAvailableUsers();
          // Then fetch and set the assigned users
          await fetchAssignedUsers(users);
        };

        initializeData();
      } else {
        // For non-admin users
        fetchAssignedUsersNotAdmin();
      }
    } else {
      // Reset states when panel closes
      setSearchQuery("");
      setSelectedUsers([]);
      setPreAssignedUsers([]);
      setUsersToUnassign([]);
    }
  }, [
    isOpen,
    task,
    findAvailableUsers,
    fetchAssignedUsers,
    sessionUser.role,
    fetchAssignedUsersNotAdmin,
  ]);

  // Filter available users based on search query (for admins)
  const filteredUsers = availableUsers.filter((user) => {
    if (!searchQuery) return true;

    const query = searchQuery.toLowerCase();
    return (
      user.username?.toLowerCase().includes(query) ||
      user.display_name?.toLowerCase().includes(query) ||
      user.email?.toLowerCase().includes(query)
    );
  });

  // Filter selected users based on search query (for both admins and non-admins)
  const filteredSelectedUsers = selectedUsers.filter((user) => {
    if (!searchQuery) return true;

    const query = searchQuery.toLowerCase();
    return (
      user.username?.toLowerCase().includes(query) ||
      user.display_name?.toLowerCase().includes(query) ||
      user.email?.toLowerCase().includes(query)
    );
  });

  // Check if a user is currently selected
  const isUserSelected = (userId) => {
    return selectedUsers.some((user) => user.id === userId);
  };

  // Check if a user is pre-assigned (already assigned)
  const isUserPreAssigned = (userId) => {
    return preAssignedUsers.some((user) => user.id === userId);
  };

  // Check if a user is marked for unassignment
  const isUserToUnassign = (userId) => {
    return usersToUnassign.some((user) => user.id === userId);
  };

  // Check if a user is the task owner
  const isTaskOwner = (userId) => {
    return task && userId === task.owner_id;
  };

  if (!isOpen) return null;

  return (
    <div className="fixed top-0 left-0 w-full h-full bg-black bg-opacity-50 z-50">
      <div className="fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 bg-slate-900 rounded-xl p-8 w-1/2 h-auto flex flex-col space-y-4 border-2 border-slate-600">
        <div className="flex flex-row justify-between items-center">
          <div className="title-sm">Task Assignment</div>
          <IconButton
            icon={<X size={30} />}
            onClick={onClose}
            color="hover:bg-white hover:text-slate-950"
          />
        </div>

        <div className="border-b border-slate-600 my-4"></div>

        {/* Task Information */}
        <div className="bg-slate-800 p-4 rounded-lg">
          <h2 className="text-lg font-semibold text-white ">
            Task: {task.name}
          </h2>
          <p className="text-slate-300 text-sm truncate">{task.description}</p>
          <p className="text-slate-400 text-sm mt-2">
            Created by:{" "}
            <span className="text-white">
              @{task.owner_username} ({task.owner_display_name})
            </span>
          </p>
          <p className="text-slate-400 text-sm">
            Created on:{" "}
            <span className="text-white">
              {getDateWithRelativeTime(task.created_at)}
            </span>
          </p>
        </div>

        {/* Search Users - For both admin and non-admin */}
        <div>
          <h1 className="text-md mb-2 ">Search Users</h1>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <UserSearch size={20} className="text-slate-400" />
            </div>
            <input
              type="text"
              placeholder="Search by name, username, or email..."
              className="forms text-left pl-10 w-full"
              value={searchQuery}
              onChange={handleSearch}
            />
          </div>
        </div>

        {/* Selected Users - For non-admin users */}
        {sessionUser.role !== "admin" && (
          <div className="mt-4">
            <h1 className="text-md mb-2">
              Assigned Users ({filteredSelectedUsers.length}/
              {selectedUsers.length})
            </h1>
            <div
              className={`flex flex-wrap max-h-32 overflow-y-auto bg-slate-800 rounded-lg p-2 
              ${
                filteredSelectedUsers.length === 0
                  ? "justify-center"
                  : "justify-start"
              }
            `}
            >
              {isLoading ? (
                <div className="text-slate-400 text-center py-4">
                  Loading assigned users...
                </div>
              ) : filteredSelectedUsers.length > 0 ? (
                filteredSelectedUsers.map((user) => (
                  <div
                    key={user.id}
                    className="flex items-center m-2 w-fit pill-green"
                  >
                    <span>
                      @{user.username} ({user.display_name})
                    </span>
                    <UserRoundCheck size={16} className="ml-2 text-white" />
                  </div>
                ))
              ) : (
                <div className="text-slate-400 text-center py-2">
                  {searchQuery
                    ? "No users match your search"
                    : "This task has no assigned users"}
                </div>
              )}
            </div>
          </div>
        )}

        {/* Search Results - For admin only */}
        {sessionUser.role === "admin" && (
          <div className="space-y-4">
            <div>
              <h1 className="text-md mb-2">
                Manage Users ({selectedUsers.length}/{availableUsers.length})
              </h1>
              <div
                className={`flex flex-wrap max-h-32 overflow-y-auto bg-slate-800 rounded-lg p-2 
              ${
                filteredUsers.length !== 0 ? "justify-start" : "justify-center"
              }`}
              >
                {isLoading ? (
                  <div className="text-slate-400 text-center py-4">
                    Loading available users...
                  </div>
                ) : filteredUsers.length > 0 ? (
                  filteredUsers.map((user) => (
                    <div
                      key={user.id}
                      className={`flex items-center m-2 ${
                        isTaskOwner(user.id)
                          ? "bg-green-600 opacity-50 cursor-not-allowed"
                          : isUserPreAssigned(user.id) &&
                            isUserToUnassign(user.id)
                          ? "bg-red-600 hover:bg-slate-700 cursor-pointer"
                          : isUserPreAssigned(user.id)
                          ? "bg-green-600 hover:bg-red-600 cursor-pointer"
                          : isUserSelected(user.id)
                          ? "bg-green-600 hover:bg-red-600 cursor-pointer"
                          : "bg-slate-700 hover:bg-green-600 cursor-pointer"
                      } w-fit pill`}
                      onClick={() => toggleUserSelection(user)}
                    >
                      <span>
                        @{user.username} ({user.display_name})
                      </span>
                      {isUserPreAssigned(user.id) &&
                        isUserToUnassign(user.id) &&
                        !isTaskOwner(user.id) && (
                          <UserRoundMinus
                            size={16}
                            className="ml-2 text-white"
                          />
                        )}

                      {isUserPreAssigned(user.id) &&
                        !isUserToUnassign(user.id) &&
                        !isTaskOwner(user.id) && (
                          <UserRoundCheck
                            size={16}
                            className="ml-2 text-white"
                          />
                        )}

                      {/* if they are to be assigned, make an icon of UserRoundPlus */}
                      {!isUserPreAssigned(user.id) &&
                        isUserSelected(user.id) &&
                        !isTaskOwner(user.id) && (
                          <UserPlus size={16} className="ml-2 text-white" />
                        )}
                    </div>
                  ))
                ) : (
                  <div className="text-slate-400 text-center py-4 items-center justify-center ">
                    <UserX size={24} className="mx-auto mb-2" />
                    {searchQuery
                      ? "No users match your search"
                      : "No available users found"}
                  </div>
                )}
              </div>

              <div className="text-xs text-slate-400 mt-1">
                <p>Already assigned users are highlighted in green.</p>
                <p>Green: Users to be assigned | Red: Users to be unassigned</p>
              </div>
            </div>

            <div className="border-b border-slate-600"></div>
            <div className="flex justify-center items-center ">
              <IconizedButton
                icon={<UserRoundCheck size={24} className="ml-2" />}
                text="Update Assignments"
                onClick={handleManageUsers}
                btnStyle="btn-blue"
              />
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default AssignTaskPanel;
