import React, { useState, useEffect, useCallback } from "react";
import {
  UserSearch,
  X,
  UserRoundCheck,
  UserX,
  UserPlus,
  UserRoundMinus,
} from "lucide-react";
import proxy from "@/utils/proxy";

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
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

import { useToast } from "@/utils/ToastProvider";
import { useNotification } from "@/utils/NotificationProvider";

const AssignTaskPanel = ({ task, setNeedsRefetch, user }) => {
  const { setFeedbackMessage } = useToast();
  const { setNotificationToAdd } = useNotification();
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
      setFeedbackMessage({
        title: "Missing Requirements",
        description: "Please select users to assign or unassign from the task.",
      });
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
        setFeedbackMessage({
          title: "Success",
          description: "Task assignment updated successfully!",
        });
        setNeedsRefetch(true);
      } else {
        setFeedbackMessage({
          title: "No Changes Made",
          description: "No changes were made to task assignments.",
        });
      }
    } catch (error) {
      setFeedbackMessage({
        title: "Error",
        description: "Failed to update task assignments: " + error.message,
      });
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
      const response = await fetch(`${proxy}/user/under/${user.id}`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
      });

      // If response is 404, just return an empty array without throwing an error
      if (response.status === 404) {
        setAvailableUsers([]);
        return [];
      }

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Failed to fetch available users");
      }

      const data = await response.json();
      setAvailableUsers(data);
      return data; // Return the users data for potential use
    } catch (error) {
      console.error("Error fetching available users:", error);
      // Only show feedback for non-404 errors
      setFeedbackMessage({
        title: "Error",
        description: "Failed to fetch available users: " + error.message,
      });
      return []; // Return empty array in case of error
    } finally {
      setIsLoading(false);
    }
  }, [user.id, setFeedbackMessage]);

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
        setFeedbackMessage({
          title: "Error",
          description:
            "Failed to fetch currently assigned users: " + error.message,
        });
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
      setFeedbackMessage({
        title: "Error",
        description:
          "Failed to fetch currently assigned users: " + error.message,
      });
    } finally {
      setIsLoading(false);
    }
  }, [task, setFeedbackMessage]);

  useEffect(() => {
    if (task) {
      if (user.role === "admin") {
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
  }, [task, user.role]);

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
    <DialogContent
      className="sm:max-w-[900px]  max-h-[100vh] overflow-y-auto"
      aria-describedby="dialog-description"
    >
      <DialogHeader>
        <DialogTitle>
          <div className="text-primary">Task Assignment</div>
        </DialogTitle>
        <DialogDescription>
          Manage user assignments for this task
        </DialogDescription>
      </DialogHeader>

      {/* Task Information */}
      <Card>
        <CardContent>
          <CardTitle>
            <h2 className="text-lg font-semibold">Task: {task.name}</h2>
          </CardTitle>
          <CardDescription>
            <p className=" text-sm truncate">{task.description}</p>
          </CardDescription>
          <CardDescription>
            <p className="text-sm">
              Created by:{" "}
              <span>
                @{task.owner_username} ({task.owner_display_name})
              </span>
            </p>
            <p className="text-sm">
              Created on:{" "}
              <span className="">
                {getDateWithRelativeTime(task.created_at)}
              </span>
            </p>
          </CardDescription>
        </CardContent>
      </Card>

      {/* Search Users - For both admin and non-admin */}
      <Card>
        <CardHeader>
          <CardTitle>
            <h3 className="text-md">
              {user.role === "admin"
                ? `Manage Users (${selectedUsers.length}/${availableUsers.length})`
                : `Assigned Users (${filteredSelectedUsers.length}/${selectedUsers.length})`}
            </h3>
          </CardTitle>

          <Input
            placeholder="Search by name, username, or email..."
            value={searchQuery}
            onChange={handleSearch}
          />
        </CardHeader>
        <CardContent>
          {/* Search Results - For admin only */}
          {user.role === "admin" ? (
            <ScrollArea className="h-32 w-full p-4 border border-muted rounded-md">
              {isLoading ? (
                <div className="text-center py-4 ">
                  Loading available users...
                </div>
              ) : filteredUsers.length > 0 ? (
                <div className="flex flex-wrap gap-2">
                  {filteredUsers.map((user) => (
                    <Badge
                      key={`available-${user.id || "temp"}-${user.username}`}
                      variant={getUserBadgeVariant(user)}
                      className={`flex items-center gap-2 rounded-full px-3 py-2 text-sm font-medium border-2${
                        isTaskOwner(user.id)
                          ? "opacity-50 cursor-not-allowed text-muted-foreground"
                          : "hover:scale-105 transition-transform"
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
                  ))}
                </div>
              ) : (
                <div className="text-center py-4">
                  <UserX size={24} className="mx-auto mb-2" />
                  {searchQuery
                    ? "No users match your search"
                    : "No available users found"}
                </div>
              )}
            </ScrollArea>
          ) : (
            <ScrollArea className="h-32 w-full p-4 border border-muted rounded-md">
              {isLoading ? (
                <div className="text-center py-4">
                  Loading assigned users...
                </div>
              ) : filteredSelectedUsers.length > 0 ? (
                <div className="flex flex-wrap gap-2">
                  {filteredSelectedUsers.map((user) => (
                    <Badge
                      key={`selected-${user.id || "temp"}-${user.username}`} // Updated key
                      variant={
                        user.id === task.owner_id ? "secondary" : "default"
                      }
                      className="flex items-center gap-2 rounded-full px-3 py-2 text-sm font-medium"
                    >
                      @{user.username} ({user.display_name})
                      {user.id === task.owner_id ? (
                        <span className="text-xs ml-1">(Owner)</span>
                      ) : (
                        <UserRoundCheck size={16} />
                      )}
                    </Badge>
                  ))}
                </div>
              ) : (
                <div className="text-center py-4">
                  <UserX size={24} className="mx-auto mb-2" />
                  {searchQuery
                    ? "No users match your search"
                    : "This task has no assigned users"}
                </div>
              )}
            </ScrollArea>
          )}
        </CardContent>
        {user.role === "admin" && (
          <CardFooter>
            <p className="text-xs">
              Grayed out: Already assigned | Highlighted: To be assigned | Red:
              To be unassigned
            </p>
          </CardFooter>
        )}
      </Card>

      {/* Remove the previously separated non-admin view since we've integrated it above */}
      {/* Separator */}
      <Separator />

      <DialogFooter>
        {user.role === "admin" ? (
          <DialogClose asChild>
            <div>
              <Button onClick={handleManageUsers}>
                Update Assignments
                <UserRoundCheck className="h-4 w-4 ml-1" />
              </Button>
            </div>
          </DialogClose>
        ) : (
          <DialogClose asChild>
            <div>
              <Button variant={"outline"}>
                {user.role === "admin" ? "Cancel" : "Close"}
              </Button>
            </div>
          </DialogClose>
        )}
      </DialogFooter>
    </DialogContent>
  );
};

export default AssignTaskPanel;
