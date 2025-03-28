import { useState, useCallback, useEffect } from "react";
import proxy from "@/utils/proxy";
import { useToast } from "@/utils/ToastProvider";

function useUserManagement(currentUser, devMode) {
  const { setFeedbackMessage } = useToast();
  const [usersList, setUsersList] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isRefetching, setIsRefetching] = useState(false);
  const [sortDirection, setSortDirection] = useState("none");
  const [initialLoad, setInitialLoad] = useState(true);

  // Load users initially without visual feedback
  const loadUsersInitially = useCallback(async () => {
    if (!currentUser?.id && !devMode) return;

    try {
      const res = await fetch(`${proxy}/user/under/${currentUser.id}`, {
        credentials: "include",
      });

      if (!res.ok) {
        const error = await res.json();
        throw new Error(error.message || "The users can't be loaded");
      }

      let data = await res.json();
      data = data.filter((user) => user.role !== "admin");
      setUsersList(data);
    } catch (error) {
      console.error("Error fetching data:", error);
      setUsersList([]);
    } finally {
      setInitialLoad(false);
    }
  }, [currentUser, devMode]);

  // Fetch users with loading indicators
  const fetchUsers = useCallback(() => {
    if (!currentUser?.id && !devMode) return;

    setIsLoading(true);
    setIsRefetching(true);

    fetch(`${proxy}/user/under/${currentUser.id}`, { credentials: "include" })
      .then((res) => {
        if (!res.ok) {
          return res.json().then((error) => {
            throw new Error(error.message || "The users can't be loaded");
          });
        }
        return res.json();
      })
      .then((data) => {
        data = data.filter((user) => user.role !== "admin");
        setUsersList(data);
        setSortDirection("none"); // Reset sort direction when fetching new data
      })
      .catch((error) => {
        console.error("Error fetching data:", error);
        setFeedbackMessage({
          title: "Error",
          description: "Failed to load users",
        });
        setUsersList([]);
      })
      .finally(() => {
        setIsLoading(false);
        setIsRefetching(false);
      });
  }, [currentUser, devMode, setFeedbackMessage]);

  // Sort users based on current sort direction
  const sortUsers = useCallback(() => {
    // Toggle sort direction
    const newDirection =
      sortDirection === "none" || sortDirection === "desc" ? "asc" : "desc";
    setSortDirection(newDirection);

    // Create a new sorted array without modifying the original data
    const sortedUsers = [...usersList].sort((a, b) => {
      const useA = a.username.toLowerCase();
      const useB = b.username.toLowerCase();

      if (newDirection === "asc") {
        return useA < useB ? -1 : useA > useB ? 1 : 0;
      } else {
        return useA > useB ? -1 : useA < useB ? 1 : 0;
      }
    });

    setUsersList(sortedUsers);
  }, [usersList, sortDirection]);

  // Delete users
  const deleteUsers = useCallback(
    async (userIds) => {
      if (userIds.length === 0) {
        setFeedbackMessage({
          title: "Error",
          description: "No users are selected!",
        });
        return;
      }

      const validDeletions = [];

      try {
        for (const userId of userIds) {
          try {
            const res = await fetch(`${proxy}/user/delete/${userId}`, {
              method: "DELETE",
              headers: {
                "Content-Type": "application/json",
              },
              credentials: "include",
            });

            if (!res.ok) {
              const errorData = await res.json();
              console.error(`Failed to delete user ${userId}:`, errorData);
              continue;
            }

            await res.json();
            validDeletions.push(userId);
          } catch (error) {
            console.error(`Error deleting user ${userId}:`, error);
          }
        }

        if (validDeletions.length > 0) {
          setUsersList((prev) =>
            prev.filter((user) => !validDeletions.includes(user.id))
          );
          setFeedbackMessage({
            title: "Success",
            description: `Successfully deleted ${validDeletions.length} user(s)`,
          });
          return true;
        } else {
          setFeedbackMessage({
            title: "Error",
            description:
              "No users were deleted. Users with admin role or active assignments cannot be deleted.",
          });
          fetchUsers();
          return false;
        }
      } catch (error) {
        console.error("Error in delete operation:", error);
        setFeedbackMessage({
          title: "Error",
          description: "An unexpected error occurred while deleting users",
        });
        return false;
      }
    },
    [fetchUsers, setFeedbackMessage]
  );

  // Update user role
  const updateUserRole = useCallback(
    (userId, newRole) => {
      // Find the user in the usersList
      const userToUpdate = usersList.find((user) => user.id === userId);

      // Check if the user is an admin
      if (userToUpdate.role === "admin") {
        setFeedbackMessage({
          title: "Error",
          description: "Cannot change the role of an admin user.",
        });
        return;
      }

      setIsRefetching(true);

      fetch(`${proxy}/user/updateRole/${userId}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify({ role: newRole }),
      })
        .then((res) => {
          if (!res.ok) {
            return res.json().then((error) => {
              throw new Error(error.message || "Failed to update role");
            });
          }
          return res.json();
        })
        .then(() => {
          setFeedbackMessage({
            title: "Success",
            description: "Role updated successfully",
          });

          // Update local state with the new role
          setUsersList((prev) =>
            prev.map((user) =>
              user.id === userId ? { ...user, role: newRole } : user
            )
          );
        })
        .catch((error) => {
          console.error("Error updating role:", error);
          setFeedbackMessage({
            title: "Error",
            description: "Failed to update role: " + error.message,
          });
          setUsersList((prev) =>
            prev.map((user) =>
              user.id === userId ? { ...user, role: userToUpdate.role } : user
            )
          );
        })
        .finally(() => {
          setIsRefetching(false);
        });
    },
    [usersList, setFeedbackMessage]
  );

  // Initial load effect
  useEffect(() => {
    if (initialLoad) {
      loadUsersInitially();
    }
  }, [initialLoad, loadUsersInitially]);

  // Handle loading state and feedback only for user-initiated refreshes
  useEffect(() => {
    if (isRefetching && !initialLoad) {
      const timer = setTimeout(() => {
        setIsRefetching(false);
        setIsLoading(false);
        setFeedbackMessage({
          title: "Success",
          description: "User data has been successfully synced",
        });
      }, 500);

      return () => clearTimeout(timer);
    }
  }, [isRefetching, setFeedbackMessage, initialLoad]);

  return {
    usersList,
    isLoading,
    isRefetching,
    sortDirection,
    fetchUsers,
    sortUsers,
    deleteUsers,
    updateUserRole,
  };
}

export default useUserManagement;
