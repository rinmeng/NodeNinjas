import React, { useEffect } from "react";
import { Navigate } from "react-router-dom";
import DBTable from "./testing/subcomp/DBTable";
import { useState } from "react";
import TickCheckbox from "../components/subcomponents/TickCheckbox.jsx";

const proxy = "http://localhost:15000/";

const Admin = ({ sessionUser, devMode }) => {
  const [usersList, setUsersList] = useState([]);
  const [chosenUserIds, setChosenUserIds] = useState([]); // This is my useState for when a checkbox is ticked for the list of users

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
        console.error("error fetching data:", error);
        setUsersList(null);
      });
  };

  const changeTable = (userId) => {
    setChosenUserIds((prev) =>
      prev.includes(userId)
        ? prev.filter((id) => id !== userId)
        : [...prev, userId]
    );
  };

  const deleteUsers = () => {
    if (chosenUserIds.length == 0) {
      alert("You haven't selected any users!");
      return;
    }

    const newUsers = usersList.filter(
      (user) => !chosenUserIds.includes(user.id)
    );

    setUsersList(newUsers);

    const confirm = window.confirm("Would you like to delete these users?");
    if (!confirm) {
      return;
    }

    //After I delete one or more users, I will update the backend as well
    chosenUserIds.forEach((userId) => {
      fetch(proxy + `user/delete/${userId}`, {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
      })
        .then((res) => {
          if (!res.ok) {
            return res.json().then((error) => {
              throw new Error(error.message || "The users can't be loaded");
            });
          }
          return res.json();
        })
        .then((data) => {
          setChosenUserIds(data);
        })
        .catch((error) => {
          console.error("error fetching data:", error);
        });
    });
  };

  //I want to deselect all users
  const RemoveTicks = () => {};

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
                      chosenUserIds={chosenUserIds}
                      setChosenUserIds={setChosenUserIds}
                      checked={Ticked}
                      onChange={() => changeTable(user.id)}
                    />
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
