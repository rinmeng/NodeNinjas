import React, { useEffect, useState } from "react";
import { Navigate } from "react-router-dom";
import DBTable from "./testing/subcomp/DBTable";
import TickCheckbox from "../components/subcomponents/TickCheckbox.jsx";
import DataTable from "../components/Datatable";
import { Button } from "@/components/ui/button";
import { ArrowUpDown } from "lucide-react";
import { filterFns } from "@tanstack/react-table";

const proxy = "http://localhost:15000/";

const Admin = ({ sessionUser, devMode, setFeedbackMessage }) => {
  const [usersList, setUsersList] = useState([]);
  const [chosenUserIds, setChosenUserIds] = useState([]);
  const [isDeleting, setIsDeleting] = useState(false);
  const [nameOrder, setNameOrder] = useState(0);

  useEffect(() => {
    fetchUsers();
  }, []);

  if ((!sessionUser || sessionUser.role !== "admin") && !devMode) {
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

  const usersColumns = [
    {
      header: "Select User",
      accessorKey: "selectUser",
      cell: ({ row }) => (
        <TickCheckbox
          userId={row.original.id}
          checked={chosenUserIds.includes(row.original.id)}
          onChange={() => changeTable(row.original.id)}
        />
      ),
    },
    { header: "User Id", accessorKey: "id" },
    {
      accessorKey: "username",
      header: ({ column }) => {
        return (
          <Button
            variant="ghost"
            onClick={() => {
              if (nameOrder == 0) {
                fetchAscUsers();
                setNameOrder(1);
              } else {
                fetchDescUsers();
                setNameOrder(0);
              }
            }}
          >
            Username
            <ArrowUpDown className="ml-2 h-4 w-4" />
          </Button>
        );
      },
    },
    { header: "Email Address", accessorKey: "email", filterFns: "includes" },
    { header: "Role", accessorKey: "role" },

    {
      header: "Change Role",
      accessorKey: "changeRole",
      cell: ({ row }) => (
        <select
          value={row.original.role}
          onChange={(e) => updateUserRole(row.original.id, e.target.value)}
          className="bg-yellow-500 text-white rounded-md p-1 focus:outline-none focus:ring-2 focus:ring-yellow-600"
          disabled={isDeleting}
        >
          <option value="admin">Admin</option>
          <option value="team_member">team_member</option>
        </select>
      ),
    },
  ];

  const fetchUsers = () => {
    fetch(proxy + "user/all", { credentials: "include" })
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
      })
      .catch((error) => {
        console.error("Error fetching data:", error);
        setFeedbackMessage({
          title: "Error",
          description: "Failed to load users",
        });
        setUsersList([]);
      });
  };

  const fetchAscUsers = (nameOrder) => {
    fetch(proxy + "user/all", { credentials: "include" })
      .then((res) => {
        if (!res.ok) {
          return res.json().then((error) => {
            throw new Error(error.message || "The users can't be loaded");
          });
        }
        return res.json();
      })
      .then((data) => {
        const sortAlph = data.sort((a, b) => {
          const useA = a.username;
          const useB = b.username;
          if (useA < useB) return -1;
          if (useA > useB) return 1;
          return 0;
        });

        console.log("Fetch list:", sortAlph);
        setUsersList(sortAlph);
      })
      .catch((error) => {
        console.error("Error fetching data:", error);
        setFeedbackMessage({
          title: "Error",
          description: "Failed to load users",
        });
        setUsersList([]);
      });
  };

  const fetchDescUsers = (nameOrder) => {
    fetch(proxy + "user/all", { credentials: "include" })
      .then((res) => {
        if (!res.ok) {
          return res.json().then((error) => {
            throw new Error(error.message || "The users can't be loaded");
          });
        }
        return res.json();
      })
      .then((data) => {
        const sortAlph = data.sort((a, b) => {
          const useA = a.username;
          const useB = b.username;
          if (useA < useB) return 1;
          if (useA > useB) return -1;
          return 0;
        });

        console.log("Fetch list:", sortAlph);
        setUsersList(sortAlph);
      })
      .catch((error) => {
        console.error("Error fetching data:", error);
        setFeedbackMessage({
          title: "Error",
          description: "Failed to load users",
        });
        setUsersList([]);
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

  const deleteUsers = async () => {
    // First check if any users are selected
    if (chosenUserIds.length === 0) {
      setFeedbackMessage({
        title: "Error",
        description: "No users are selected!",
      });
      return;
    }

    // Ask for confirmation before deleting
    const confirm = window.confirm("Would you like to delete these users?");
    if (!confirm) {
      return;
    }

    setIsDeleting(true);
    const validDeletions = []; // Move array inside function to avoid persistence issues

    try {
      // Process deletions sequentially to avoid race conditions
      for (const userId of chosenUserIds) {
        try {
          const res = await fetch(proxy + `user/delete/${userId}`, {
            method: "DELETE",
            headers: {
              "Content-Type": "application/json",
            },
            credentials: "include",
          });

          if (!res.ok) {
            const errorData = await res.json();
            console.error(`Failed to delete user ${userId}:`, errorData);
            continue; // Skip to next user if this one fails
          }

          const data = await res.json();
          console.log("Deleted user:", data);
          validDeletions.push(userId);
        } catch (error) {
          console.error(`Error deleting user ${userId}:`, error);
        }
      }

      // Update UI based on deletion results
      if (validDeletions.length > 0) {
        // Update user list to remove deleted users
        setUsersList((prev) =>
          prev.filter((user) => !validDeletions.includes(user.id))
        );

        // Remove deleted users from selected IDs
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

        // Refresh the list to show current state
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

  const resetSelection = () => {
    setChosenUserIds([]);
  };

  const updateUserRole = (userId, newRole) => {
    fetch(proxy + `user/updateRole/${userId}`, {
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
      })
      .catch((error) => {
        console.error("Error updating role:", error);
        setFeedbackMessage({
          title: "Error",
          description: "Failed to update role: " + error.message,
        });
      });
  };

  return (
    <div className="mp5 my-16 animate-fadein bg-slate-700">
      <h1 className="title text-center">Welcome to the Admin Dashboard!</h1>

      <section className="my-8 p-4">
        <div className="bg-slate-900">
          <div className="bg-slate-900 rounded-t-lg">
            <h1 className="text-2xl font-bold text-center">
              Manage Users, Tasks and Roles
            </h1>
          </div>

          <div className="flex justify-around items-center">
            <div className="mt-5 bg-slate-800 inline-block ml-20 p-4 rounded-xl">
              <label className="text-xl mt-15">Action:</label>
              <button
                onClick={deleteUsers}
                disabled={isDeleting || chosenUserIds.length === 0}
                className={`${
                  isDeleting || chosenUserIds.length === 0
                    ? "bg-gray-500"
                    : "bg-red-700"
                } w-30 ml-5 p-2 rounded-xl`}
              >
                {isDeleting ? "Deleting..." : "Delete Selected Users"}
              </button>
              <button
                onClick={resetSelection}
                disabled={isDeleting || chosenUserIds.length === 0}
                className={`${
                  isDeleting || chosenUserIds.length === 0
                    ? "bg-gray-500"
                    : "bg-red-700"
                } w-30 ml-5 p-2 rounded-xl`}
              >
                Reset
              </button>
            </div>
          </div>

          <div>
            <DataTable
              columns={usersColumns}
              data={usersList.map((user) => {
                const Ticked = chosenUserIds.includes(user.id);
                return {
                  ...user,
                  selectUser: (
                    <TickCheckbox
                      userId={user.id}
                      checked={Ticked}
                      onChange={() => changeTable(user.id)}
                    />
                  ),
                  changeRole: (
                    <select
                      value={user.role}
                      onChange={(e) => updateUserRole(user.id, e.target.value)}
                      className="bg-yellow-500 text-white rounded-md p-1 focus:outline-none focus:ring-2 focus:ring-yellow-600"
                      disabled={isDeleting}
                    >
                      <option value="admin">Admin</option>
                      <option value="team_member">team_member</option>
                    </select>
                  ),
                };
              })}
              loading={false}
            />
            {/* <DBTable
              columns={usersColumns}
              data={usersList.map((user) => {
                const Ticked = chosenUserIds.includes(user.id);
                return {
                  ...user,
                  selectUser: (
                    <TickCheckbox
                      userId={user.id}
                      checked={Ticked}
                      onChange={() => changeTable(user.id)}
                    />
                  ),
                  changeRole: (
                    <select
                      value={user.role}
                      onChange={(e) => updateUserRole(user.id, e.target.value)}
                      className="bg-yellow-500 text-white rounded-md p-1 focus:outline-none focus:ring-2 focus:ring-yellow-600"
                      disabled={isDeleting}
                    >
                      <option value="admin">Admin</option>
                      <option value="team_member">team_member</option>
                    </select>
                  ),
                };
              })}
              loading={false}
            /> */}
          </div>

          <div className="rounded-sm mt-5 bg-slate-900 rounded-b-lg p-2"></div>
        </div>
      </section>
    </div>
  );
};

export default Admin;
