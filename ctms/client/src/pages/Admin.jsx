import { Checkbox } from "@/components/ui/checkbox";
import { MoreHorizontal, ArrowUpDown, RefreshCw, Trash2 } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

import React, { useEffect, useState } from "react";
import { Navigate } from "react-router-dom";
import DataTable from "../components/Datatable";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Card, CardContent, CardTitle, CardHeader } from "@/components/ui/card";
import proxy from "@/src/utils/proxy";
import { useAuth } from "@/utils/AuthProvider";

const Admin = ({ devMode, setFeedbackMessage }) => {
  const { user } = useAuth();
  const [usersList, setUsersList] = useState([]);
  const [chosenUserIds, setChosenUserIds] = useState([]);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isRefetching, setIsRefetching] = useState(false);
  const [sortDirection, setSortDirection] = useState("none"); // 'none', 'asc', or 'desc'
  const [initialLoad, setInitialLoad] = useState(true);

  useEffect(() => {
    // Initial load without visual feedback
    if (initialLoad) {
      loadUsersInitially();
    }
  }, []);

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

  // Initial load function without visual feedback
  const loadUsersInitially = () => {
    fetch(`${proxy}/user/all`, { credentials: "include" })
      .then((res) => {
        if (!res.ok) {
          return res.json().then((error) => {
            throw new Error(error.message || "The users can't be loaded");
          });
        }
        return res.json();
      })
      .then((data) => {
        setUsersList(data);
        setInitialLoad(false);
      })
      .catch((error) => {
        console.error("Error fetching data:", error);
        setUsersList([]);
        setInitialLoad(false);
      });
  };

  if ((!user || user.role !== "admin") && !devMode) {
    return (
      <div className="mp5 my-16 animate-fadein">
        <h1 className="title text-center">Welcome to the Admin Page!</h1>
        <p className="text-center text-xl">
          Please log in as admin to view this page, or enable{" "}
          <code>devMode</code> to bypass authentication in <code>App.jsx</code>
        </p>
        <Navigate to="/login" />
      </div>
    );
  }

  // Sort users based on current sort direction
  const sortUsers = () => {
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
  };

  const usersColumns = [
    {
      id: "select",
      header: ({ table }) => (
        <Checkbox
          checked={
            table.getIsAllPageRowsSelected() ||
            (table.getIsSomePageRowsSelected() && "indeterminate")
          }
          onCheckedChange={(value) => table.toggleAllPageRowsSelected(!!value)}
          aria-label="Select all"
        />
      ),
      cell: ({ row }) => (
        <Checkbox
          checked={row.getIsSelected()}
          onCheckedChange={(value) => row.toggleSelected(!!value)}
          aria-label="Select row"
        />
      ),
      enableSorting: false,
      enableHiding: false,
    },
    {
      header: "ID",
      accessorKey: "id",
      cell: ({ row }) => (
        <span className="font-mono text-xs">{row.getValue("id")}</span>
      ),
    },
    {
      accessorKey: "username",
      header: ({ column }) => {
        return (
          <Button variant="ghost" onClick={sortUsers}>
            Username
            <ArrowUpDown className="ml-2 h-4 w-4" />
          </Button>
        );
      },
    },
    { header: "Email Address", accessorKey: "email" },
    { header: "Role", accessorKey: "role" },
    {
      id: "actions",
      cell: ({ row }) => {
        const user = row.original;

        return (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="h-8 w-8">
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuLabel>Actions</DropdownMenuLabel>
              <DropdownMenuItem
                onClick={() =>
                  updateUserRole(
                    user.id,
                    user.role === "admin" ? "team_member" : "admin"
                  )
                }
              >
                Change Role to {user.role === "admin" ? "Team Member" : "Admin"}
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                onClick={() => {
                  if (
                    window.confirm("Are you sure you want to delete this user?")
                  ) {
                    deleteUsers([user.id]);
                  }
                }}
                className="text-destructive focus:text-destructive"
              >
                Delete User
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        );
      },
    },
  ];

  // Modify your deleteUsers function to accept an array of IDs:
  const deleteUsers = async (userIds = chosenUserIds) => {
    if (userIds.length === 0) {
      setFeedbackMessage({
        title: "Error",
        description: "No users are selected!",
      });
      return;
    }

    setIsDeleting(true);
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

          const data = await res.json();
          validDeletions.push(userId);
        } catch (error) {
          console.error(`Error deleting user ${userId}:`, error);
        }
      }

      if (validDeletions.length > 0) {
        setUsersList((prev) =>
          prev.filter((user) => !validDeletions.includes(user.id))
        );
        setChosenUserIds((prev) =>
          prev.filter((id) => !validDeletions.includes(id))
        );
        setFeedbackMessage({
          title: "Success",
          description: `Successfully deleted ${validDeletions.length} user(s)`,
        });
      } else {
        setFeedbackMessage({
          title: "Error",
          description:
            "No users were deleted. Users with admin role or active assignments cannot be deleted.",
        });
        fetchUsers();
      }
    } catch (error) {
      console.error("Error in delete operation:", error);
      setFeedbackMessage({
        title: "Error",
        description: "An unexpected error occurred while deleting users",
      });
    } finally {
      setIsDeleting(false);
    }
  };

  // User-initiated fetch with loading indicators
  const fetchUsers = () => {
    setIsLoading(true);
    setIsRefetching(true);
    fetch(`${proxy}/user/all`, { credentials: "include" })
      .then((res) => {
        if (!res.ok) {
          return res.json().then((error) => {
            throw new Error(error.message || "The users can't be loaded");
          });
        }
        return res.json();
      })
      .then((data) => {
        console.log("Fetch list:", data);
        setUsersList(data);
        setSortDirection("none"); // Reset sort direction when fetching new data
        // Loading indicator will be cleared by the useEffect
      })
      .catch((error) => {
        console.error("Error fetching data:", error);
        setFeedbackMessage({
          title: "Error",
          description: "Failed to load users",
        });
        setUsersList([]);
        setIsLoading(false);
        setIsRefetching(false);
      });
  };

  const changeTable = (userId) => {
    setChosenUserIds((prev) => {
      if (!Array.isArray(prev)) {
        return [userId];
      }
      return prev.includes(userId)
        ? prev.filter((id) => id !== userId)
        : [...prev, userId];
    });
  };

  const resetSelection = () => {
    setChosenUserIds([]);
  };

  const updateUserRole = (userId, newRole) => {
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
      .then((data) => {
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
        setIsRefetching(false);
      })
      .catch((error) => {
        console.error("Error updating role:", error);
        setFeedbackMessage({
          title: "Error",
          description: "Failed to update role: " + error.message,
        });
        setIsRefetching(false);
      });
  };

  return (
    <div className=" w-full my-30 animate-fadein">
      <Card className="max-w-lg mx-auto">
        <CardHeader>
          <CardTitle>
            <h2 className="text-2xl font-semibold">User Administration</h2>
          </CardTitle>
        </CardHeader>
        <CardContent className=" flex flex-col items-center">
          <Dialog>
            <DialogTrigger asChild>
              <Button className="w-full">Manage Users</Button>
            </DialogTrigger>

            {/* Make the dialog much larger */}
            <DialogContent className="min-w-[900px]">
              <DialogHeader>
                <DialogTitle className="text-primary flex items-center gap-4 text-xl">
                  Manage Users
                  <Button
                    variant="default"
                    size="sm"
                    onClick={fetchUsers}
                    disabled={isLoading}
                  >
                    <RefreshCw
                      className={`h-4 w-4 mr-1 ${
                        isLoading || isRefetching ? "animate-spin" : ""
                      }`}
                    />
                    Sync Users
                  </Button>
                </DialogTitle>
                <DialogDescription>
                  View and manage all users in the system
                </DialogDescription>
              </DialogHeader>

              {chosenUserIds.length > 0 && (
                <div className="flex items-center gap-2 mb-4">
                  <Button
                    variant="destructive"
                    size="sm"
                    onClick={() => {
                      if (
                        window.confirm(
                          "Are you sure you want to delete the selected users?"
                        )
                      ) {
                        deleteUsers();
                      }
                    }}
                    disabled={isDeleting}
                    className="flex items-center"
                  >
                    <Trash2 className="h-4 w-4 mr-1" />
                    Delete Selected ({chosenUserIds.length})
                  </Button>
                  <Button variant="outline" size="sm" onClick={resetSelection}>
                    Clear Selection
                  </Button>
                </div>
              )}

              <DataTable
                columns={usersColumns}
                data={usersList}
                loading={isLoading && !initialLoad}
                initialPageSize={5}
              />
            </DialogContent>
          </Dialog>
        </CardContent>
      </Card>
    </div>
  );
};

export default Admin;
