import React, { useState, useEffect, useCallback } from "react";
import {
  UserSearch,
  X,
  UserRoundCheck,
  UserX,
  UserPlus,
  UserRoundMinus,
} from "lucide-react";
import proxy from "../utils/proxy";

// Import Shadcn UI components
import {
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogClose,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";

import getDateWithRelativeTime from "../utils/getDateWithRelativeTime";

const AssignTaskPanel = ({
  task,
  setNeedsRefetch,
  setFeedbackMessage,
  setNotificationToAdd,
  sessionUser,
}) => {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedUsers, setSelectedUsers] = useState([]);
  const [preAssignedUsers, setPreAssignedUsers] = useState([]);
  const [usersToUnassign, setUsersToUnassign] = useState([]);
  const [availableUsers, setAvailableUsers] = useState([]);
  const [isLoading, setIsLoading] = useState(false);

  const handleSearch = (e) => {
    setSearchQuery(e.target.value);
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
      let changesOccurred = false;

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
          changesOccurred = true; // Mark that changes happened
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

          // Only add notifications if there are new assignments
          if (userIdsToAssign.length > 0) {
            setNotificationToAdd({
              user_ids: userIdsToAssign,
              message: task.name,
              type: "task_assignment",
            });
          }
        }
      }

      // Handle unassignments if there are any - filter out task owner
      const userIdsToUnassign = usersToUnassign
        .filter((user) => !selectedUsers.some((su) => su.id === user.id))
        .filter((user) => user.id !== task.owner_id) // Prevent task owner from being unassigned
        .map((user) => user.id);

      if (userIdsToUnassign.length > 0) {
        changesOccurred = true; // Mark that changes happened
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
        setNotificationToAdd({
          user_ids: userIdsToUnassign,
          message: task.name,
          type: "task_unassignment",
        });
      }

      // Reset states
      setSelectedUsers([]);
      setUsersToUnassign([]);

      // Only show feedback message if changes were made
      if (changesOccurred) {
        setFeedbackMessage("Task assignments updated successfully!");
        setNeedsRefetch(true);
      } else {
        // No actual changes were made
        setFeedbackMessage("No changes were made to task assignments.");
      }
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

  useEffect(() => {
    if (task) {
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
      // Reset states when component unmounts or task changes
      resetStates();
    }
  }, [task, sessionUser.role]);

  const resetStates = () => {
    setSearchQuery("");
    setSelectedUsers([]);
    setPreAssignedUsers([]);
    setUsersToUnassign([]);
  };

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

  // Get badge variant for user
  const getUserBadgeVariant = (user) => {
    if (isTaskOwner(user.id)) {
      return "secondary";
    } else if (isUserPreAssigned(user.id) && isUserToUnassign(user.id)) {
      return "destructive";
    } else if (isUserPreAssigned(user.id)) {
      return "default";
    } else if (isUserSelected(user.id)) {
      return "default";
    } else {
      return "outline";
    }
  };

  return (
    <DialogContent className="sm:max-w-[900px]  max-h-[100vh] bg-slate-900 text-white border-slate-600 overflow-y-auto">
      <DialogHeader>
        <DialogTitle className="text-xl font-semibold flex justify-between items-center">
          Task Assignment
        </DialogTitle>
        <DialogDescription className="text-slate-400">
          Manage user assignments for this task
        </DialogDescription>
      </DialogHeader>

      {/* Task Information */}
      <div className="bg-slate-800 p-4 rounded-lg">
        <h2 className="text-lg font-semibold text-white">Task: {task.name}</h2>
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
        <h3 className="text-md mb-2">Search Users</h3>
        <div className="relative">
          <UserSearch className="absolute left-2 top-2.5 h-4 w-4 text-slate-400" />
          <Input
            placeholder="Search by name, username, or email..."
            className="pl-8 bg-slate-800 border-slate-700 text-white"
            value={searchQuery}
            onChange={handleSearch}
          />
        </div>
      </div>

      {/* Selected Users - For non-admin users */}
      {sessionUser.role !== "admin" && (
        <div className="mt-4">
          <h3 className="text-md mb-2">
            Assigned Users ({filteredSelectedUsers.length}/
            {selectedUsers.length})
          </h3>
          <div className="bg-slate-800 rounded-lg p-2">
            <ScrollArea className="h-32 w-full">
              {isLoading ? (
                <div className="text-slate-400 text-center py-4">
                  Loading assigned users...
                </div>
              ) : filteredSelectedUsers.length > 0 ? (
                <div className="flex flex-wrap gap-2">
                  {filteredSelectedUsers.map((user) => (
                    <Badge
                      key={user.id}
                      variant="success"
                      className="flex items-center gap-2 rounded-full px-3 py-2 text-sm font-medium text-white"
                    >
                      @{user.username} ({user.display_name})
                      <UserRoundCheck size={16} />
                    </Badge>
                  ))}
                </div>
              ) : (
                <div className="text-slate-400 text-center py-4">
                  {searchQuery
                    ? "No users match your search"
                    : "This task has no assigned users"}
                </div>
              )}
            </ScrollArea>
          </div>
        </div>
      )}

      {/* Search Results - For admin only */}
      {sessionUser.role === "admin" && (
        <div className="space-y-4">
          <div>
            <h3 className="text-md mb-2">
              Manage Users ({selectedUsers.length}/{availableUsers.length})
            </h3>
            <div className="bg-slate-800 rounded-lg p-2">
              <ScrollArea className="h-32 w-full">
                {isLoading ? (
                  <div className="text-slate-400 text-center py-4 ">
                    Loading available users...
                  </div>
                ) : filteredUsers.length > 0 ? (
                  <div className="flex flex-wrap gap-2 p-2">
                    {filteredUsers.map((user) => (
                      // ...existing code...
                      <Badge
                        key={user.id}
                        variant={getUserBadgeVariant(user)}
                        className={`flex items-center gap-2 rounded-full px-3 py-2 text-sm font-medium text-white${
                          isTaskOwner(user.id)
                            ? "opacity-50 cursor-not-allowed text-black"
                            : "cursor-pointer hover:scale-105 transition-transform"
                        }`}
                        onClick={() =>
                          !isTaskOwner(user.id) && toggleUserSelection(user)
                        }
                      >
                        @{user.username} ({user.display_name})
                        {isUserPreAssigned(user.id) &&
                          isUserToUnassign(user.id) &&
                          !isTaskOwner(user.id) && <UserRoundMinus size={16} />}
                        {isUserPreAssigned(user.id) &&
                          !isUserToUnassign(user.id) &&
                          !isTaskOwner(user.id) && <UserRoundCheck size={16} />}
                        {!isUserPreAssigned(user.id) &&
                          isUserSelected(user.id) &&
                          !isTaskOwner(user.id) && <UserPlus size={16} />}
                      </Badge>
                      // ...existing code...
                    ))}
                  </div>
                ) : (
                  <div className="text-slate-400 text-center py-4">
                    <UserX size={24} className="mx-auto mb-2" />
                    {searchQuery
                      ? "No users match your search"
                      : "No available users found"}
                  </div>
                )}
              </ScrollArea>
            </div>

            <div className="text-xs text-slate-400 mt-1">
              <p>
                Slate: Already assigned or to be assigned | Red: To be
                unassigned
              </p>
            </div>
          </div>
        </div>
      )}

      <Separator className="bg-slate-600" />

      <DialogFooter>
        <DialogClose asChild>
          <Button
            variant="outline"
            className="text-white bg-transparent border-slate-600 hover:bg-slate-700"
          >
            Cancel
          </Button>
        </DialogClose>
        <DialogClose asChild>
          <Button
            className="bg-blue-600 hover:bg-blue-700 text-white"
            onClick={handleManageUsers}
          >
            Update Assignments
            <UserRoundCheck className="h-4 w-4 ml-1" />
          </Button>
        </DialogClose>
      </DialogFooter>
    </DialogContent>
  );
};

export default AssignTaskPanel;
