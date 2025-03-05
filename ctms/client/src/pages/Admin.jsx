import React, { useEffect } from "react";
import { Navigate } from "react-router-dom";
import DBTable from "./testing/subcomp/DBTable";
import { useState } from "react";
import TickCheckbox from "../components/subcomponents/TickCheckbox.jsx";

const proxy = "http://localhost:15000/";

const Admin = ({ sessionUser, devMode, setFeedbackMessage }) => {
  const [usersList, setUsersList] = useState([]);

  const [chosenUserIds, setChosenUserIds] = useState([]); // This is my useState for when a checkbox is ticked for the list of users
  const validDeletions = []; //I made an array to store users who can be successfully deleted from the Admin table

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
        {/* redirect to /login */}
        <Navigate to="/login" />
      </div>
    );
  }

  //Here is my data for the table which views all users under Managing Roles.
  const usersColumns = [
    { header: "User Id", key: "id" },
    { header: "Username", key: "username" },
    { header: "Email Address", key: "email" },
    { header: "Role", key: "role" },
    { header: "Select User", key: "selectUser" },
    { header: "Change Role", key: "changeRole" },
  ];

  //We are obtaining the users from our database
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
        console.error("error fetching data:", error);
        setUsersList(null);
      });
  };

  const changeTable = (userId) => {
    setChosenUserIds((prev) => {
      if (!Array.isArray(prev)) {
        return [];
      }
      return prev.includes(userId)
        ? prev.filter((id) => id !== userId)
        : [...prev, userId];
    });
  };

  //function which deletes the selected users from the Admin table
  const deleteUsers = () => {
    //There will be an alert when no users are selected after pressing the "Delete Selected Users" button
    if (chosenUserIds.length === 0) {
      setFeedbackMessage({
        title: "Error",
        description: "No users are selected!",
      });
      return;
    }

    //After I delete one or more users, I will update the backend as well
    chosenUserIds.forEach((userId) => {
      //I added a variable to store users that can be successfully deleted and exclude any admin who manages existing users.

      fetch(proxy + `user/delete/${userId}`, {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
      })
        .then(async (res) => {
          if (!res.ok) {
            const error = await res.json();
            setFeedbackMessage({
              title: "Error",
              description: "Failed to delete user ID: " + userId,
            });
          }
          return res.json();
        })
        .then((data) => {
          console.log("Deleted user", data);
          validDeletions.push(userId);
          console.log(validDeletions);
        })
        .catch((error) => {
          setFeedbackMessage({
            title: "Error",
            description:
              "At least one of the users can't be deleted as they are an admin",
          });
          fetchUsers();
        })
        .finally(() => {
          if (!validDeletions.length > 0) {
            setFeedbackMessage({
              title: "Error",
              description: "No users were deleted",
            });
          } else {
            setChosenUserIds((prev) =>
              prev.filter((id) => !validDeletions.includes(id))
            );
            setFeedbackMessage({
              title: "Success",
              description: "User(s) deleted successfully",
            });
          }
        });
    });

    const confirm = window.confirm("Would you like to delete these users?");
    if (!confirm) {
      setFeedbackMessage({
        title: "Error",
        description: "No users were deleted",
      });

      return;
    }

    //This will be the list of users who weren't deleted
    const newUsers = usersList.filter(
      (user) => !chosenUserIds.includes(user.id)
    );

    setUsersList(newUsers);
  };

  //I want to deselect all ticked users when I press the "Reset" button
  const RemoveTicks = () => {
    setChosenUserIds([]);
  };
  //updating the user's role
  const updateUserRole = (userId, newRole) => {
    fetch(proxy + `user/updateRole/${userId}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
      },
      credentials: "include",
      body: JSON.stringify({ role: newRole }),
    })
      .then(async (res) => {
        if (!res.ok) {
          const error = await res.json();
          setFeedbackMessage({
            title: "Error",
            description: "Failed to update role",
          });
          throw new Error(error.message || "Failed to update role");
        }
        return res.json();
      })
      .then((data) => {
        setFeedbackMessage({
          title: "Success",
          description: "Role updated successfully",
        });

        //update userlist state immediately
        setUsersList((prev) =>
          prev.map((user) =>
            user.id === userId ? { ...user, role: newRole } : user
          )
        );
        fetchUsers(); // Fetch update from backend
      })

      .catch((error) => {
        console.error("Error updating role:", error);
      });
  };

  return (
    <div className="mp5 my-16 animate-fadein">
      <h1 className="title text-center">Welcome to the Admin Dashboard!</h1>

      {/*--------------------------------------- Managing Roles}---------------------------------------- */}
      <section className="my-8 p-4">
        <div className="bg-sky-800">
          <div className="bg-sky-900 rounded-t-lg">
            <h1 className="text-2xl font-bold text-center">
              {" "}
              Manage Users, Tasks and Roles
            </h1>
          </div>

          <div className="flex justify-around items-center">
            <div className="mt-5 bg-sky-700 inline-block ml-20 p-4 rounded-xl">
              <label className="text-xl mt-15">Action:</label>
              <button
                onClick={deleteUsers}
                className="bg-red-700 w-30 ml-5 p-2 rounded-xl"
              >
                Delete Selected Users
              </button>
              <button
                onClick={RemoveTicks}
                className="bg-red-700 w-30 ml-5 p-2 rounded-xl"
              >
                Reset
              </button>
            </div>
          </div>

          <div>
            <DBTable
              columns={usersColumns}
              data={usersList.map((user) => {
                const Ticked =
                  Array.isArray(chosenUserIds) &&
                  chosenUserIds.includes(user.id);
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
                    >
                      <option value="admin">Admin</option>
                      <option value="team_member">team_member</option>
                    </select>
                  ),
                };
              })}
              loading={false}
            />
          </div>

          <div className="rounded-sm mt-5 bg-sky-900 rounded-b-lg p-2 "></div>
        </div>
      </section>
    </div>
  );
};

export default Admin;
