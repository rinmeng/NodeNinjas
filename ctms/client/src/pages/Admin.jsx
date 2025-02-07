import React, { useEffect } from "react";
import { Navigate } from "react-router-dom";
import DBTable from "./testing/subcomp/DBTable";
import { useState } from "react";

const proxy = "http://localhost:15000/";

const Admin = ({ sessionUser, devMode }) => {
  const [taskName, setTaskName] = useState("");
  const [taskDesc, setTaskDesc] = useState("");
  const [taskPriority, setTaskPriority] = useState("1");
  const [taskDue, setTaskDue] = useState("");

  const [usersList, setUsersList] = useState([]);

  //This is my UseState for filtering my data in the table
  const [filterData, setFilterData] = useState("");

  // UseState for the list of tasks you can view
  const [taskList, setTaskList] = useState([]);

  if ((!sessionUser || sessionUser.role !== "admin") && !devMode) {
    return (
      <div className="mp5 my-16 animate-fadein">
        <h1 className="title text-center">Welcome to the Admin Dashboard!</h1>
        <p className="text-center text-xl">
          Please log in as admin to view this page, or enable{" "}
          <code>devMode</code> to bypass authentication in <code>App.jsx</code>
        </p>
        {/* redirect to /login */}
        <Navigate to="/login" />
      </div>
    );
  }

  //Our function will check the new task that is added when the user presses the "Add" button on the Add Task form
  const HandleAddandViewTask = () => {
    // A new Task object is made and it contains name, description, priority and date fields.
    const addedTask = {
      id: Date.now(),
      name: taskName,
      description: taskDesc,
      priority: taskPriority,
      date: taskDue,
    };

    //Once the new task has been created, we will added the created task to our existing array of tasks.
    setTaskList([...taskList, addedTask]);

    // After creating our new task, we will reset all the fields in the Add Task section
    setTaskName("");
    setTaskDesc("");
    setTaskPriority("1");
    setTaskDue("");
  };

  //Here is my data for the table which view all created tasks under Managing Roles.
  const columns = [
    { header: "Task Name", key: "name" },
    { header: "Task Description", key: "description" },
    { header: "Task Priority", key: "priority" },
    { header: "Due Date", key: "date" },
  ];

  const usersColumns = [
    { header: "User Id", key: "id" },
    { header: "Username", key: "username" },
    { header: "Email Address", key: "email" },
    { header: "Role", key: "role" },
  ];

  //If the user chooses a specific option from the selector, this function will be called and sort our tasks based on their priority or due date
  const FilterDataByOption = () => {
    const clonedList = [...taskList];
    if (filterData === "priority") {
      clonedList.sort((a, b) => a.priority - b.priority);
    } else clonedList.sort((a, b) => new Date(a.date) - new Date(b.date));

    return clonedList;
  };

  useEffect(() => {
    fetchUsers();
  }, []);

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

  return (
    <div className="mp5 my-16 animate-fadein">
      <h1 className="title text-center">Welcome to the Admin Dashboard!</h1>

      {/*--------------------------------------- Managing Roles}---------------------------------------- */}
      <section className="my-8 p-4">
        <div className="bg-sky-800">
          <div className="bg-sky-900 rounded-t-lg">
            <h1 className="text-2xl font-bold text-center">
              {" "}
              Manage Users, Tasks and Roles{" "}
            </h1>
          </div>

          <div className="mt-5 bg-sky-700 inline-block ml-20 p-4 rounded-xl">
            <label className="text-xl mt-15">Filter Tasks by:</label>
            <select
              className="bg-blue-900 mt-15 ml-5"
              value={filterData}
              onChange={(e) => setFilterData(e.target.value)}
            >
              <option value="teamMember">Team Members</option>
              <option value="priority">Priority</option>
              <option value="date">Due Date</option>
            </select>
          </div>

          <div className="mt-5 bg-sky-700 inline-block ml-20 p-4 rounded-xl">
            <label className="text-xl mt-15">Adjust Users:</label>
            <button className="bg-red-700 w-30 ml-5 p-2 rounded-xl">
              Deactivate
            </button>
            <button className="bg-red-700 w-30 ml-5 p-2 rounded-xl">
              Delete
            </button>
          </div>

          <div>
            <DBTable
              columns={columns}
              data={FilterDataByOption()}
              loading={false}
            />
          </div>

          <div>
            <DBTable
              columns={usersColumns}
              data={usersList || []}
              loading={false}
            />
          </div>

          <div className="rounded-sm mt-5 bg-sky-900 rounded-b-lg p-2 "></div>
        </div>
      </section>

      {/*-------------------------------- Searching Tasks------------------------------------------------------ */}
      <section className="my-8 p-4">
        <div className="bg-sky-800">
          <div className="bg-sky-900 rounded-t-lg">
            <h1 className="text-2xl font-bold text-center"> Search Task </h1>
          </div>

          <div className="mt-5 bg-sky-700 inline-block ml-20 p-4 rounded-xl">
            <label className="text-xl mt-15">
              Search the Name of the Task:
            </label>
            <input
              type="text"
              placeholder="Enter Task Name"
              className="rounded-sm pl-5 ml-5 bg-blue-900"
            ></input>
          </div>

          <div className="mt-5 bg-sky-700 inline-block ml-20 p-4 rounded-xl">
            <label className="text-xl mt-15">Filter Tasks by:</label>
            <select className="bg-blue-900 mt-15 ml-5">
              <option value="name">Name</option>
              <option value="priority">Priority</option>
              <option value="status">Status</option>
              <option value="date">Due Date</option>
            </select>
          </div>

          <div className="rounded-sm mt-5 bg-sky-900 rounded-b-lg p-2 "></div>
        </div>
      </section>

      {/*---------------------------------------- View Task------------------------------------------------------------------- */}

      <section>
        <div className="bg-sky-800">
          <div className="bg-sky-900 rounded-t-lg">
            <h1 className="text-2xl font-bold text-center"> View Task </h1>
          </div>

          {/* If there are no new tasks, there will be a display message. Otherwise, all created Tasks can be viewed on the View Task */}
          {taskList.length > 0 ? (
            taskList.map((task, index) => (
              <div
                key={task.id}
                className="text-center text-xl m-5 bg-blue-900 rounded pt-5 pb-5"
              >
                <h2>
                  {index + 1}. Name: {task.name}
                </h2>
                <p>Priority: {task.priority}</p>
                <p>Description: {task.description}</p>
                <p>Due Date: {task.date}</p>
              </div>
            ))
          ) : (
            <p className="text-center text-xl">
              There aren't any assigned tasks here!
            </p>
          )}
          <div className="mt-4 flex justify-end">
            <div className="bg-sky-700 inline-block p-4 rounded-xl mr-5">
              <label className="text-xl mt-15">Filter by:</label>
              <select className="bg-blue-900 mt-15 ml-5 p-1">
                <option value="pending">Pending</option>
                <option value="inProgress">In Progress</option>
                <option value="completed">Completed</option>
              </select>
            </div>
          </div>

          <div className="rounded-sm mt-5 bg-sky-900 rounded-b-lg p-2 "></div>
        </div>
      </section>

      {/*----------------------------------------------------Add Task----------------------------------------------------------*/}
      <section className="my-8 p-4">
        <div className="bg-sky-800">
          <div className="bg-sky-900 rounded-t-lg">
            <h1 className="text-2xl font-bold text-center"> Add Task </h1>
          </div>

          <div className="mt-5 bg-sky-700 inline-block ml-20 p-4 rounded-xl">
            <label className="text-xl mt-15 ">
              Enter the Name of the Task:
            </label>
            <input
              type="text"
              placeholder="Enter Task Name..."
              className="rounded-sm pl-5 ml-5 bg-blue-900"
              value={taskName}
              onChange={(e) => setTaskName(e.target.value)}
            ></input>
          </div>

          <div className="mt-5 bg-sky-700 inline-block ml-20 p-4 rounded-xl">
            <label className="text-xl mt-15">
              Choose the Priority Level(1 being Critical and 5 being Low
              Priority):
            </label>
            <select
              className="bg-blue-900 mt-15 ml-5"
              value={taskPriority}
              onChange={(e) => setTaskPriority(e.target.value)}
            >
              <option value="1">1</option>
              <option value="2">2</option>
              <option value="3">3</option>
              <option value="4">4</option>
              <option value="5">5</option>
            </select>
          </div>

          <div className="mt-5 bg-sky-700 inline-block ml-20 p-4 rounded-xl">
            <label className="text-xl mt-15">Choose a Due Date:</label>
            <input
              type="date"
              className="mt-15 ml-5 bg-blue-900"
              value={taskDue}
              onChange={(e) => setTaskDue(e.target.value)}
            ></input>
          </div>

          <div className="mt-5 bg-sky-700 inline-block ml-20 p-4 rounded-xl">
            <label className="text-xl mt-15 block">
              Enter Task Description:
            </label>
            <textarea
              placeHolder="Enter a Description..."
              className="rounded-sm mt-30 bg-blue-900 pl-5"
              value={taskDesc}
              onChange={(e) => setTaskDesc(e.target.value)}
            ></textarea>
          </div>

          <div className="mt-5 bg-sky-700 inline-block ml-20 p-4 rounded-xl absolute">
            <label className="text-xl mt-15 block">Assign User:</label>
            <input
              type="text"
              placeholder="Enter User ID..."
              className="rounded-sm pl-5  bg-blue-900"
            ></input>
            <button className="bg-green-700 w-30 ml-5 p-2 rounded-xl">
              Add Users
            </button>
          </div>

          <div className="rounded-sm mt-5 bg-sky-900 rounded-b-lg p-2 flex justify-center">
            <button
              className="bg-green-700 w-30 p-2 ml-auto mr-auto rounded-xl"
              onClick={HandleAddandViewTask}
            >
              Add Task
            </button>
          </div>
        </div>
      </section>

      {/*------------------------------------------Update Task---------------------------------------------------------------------*/}
      <section className="my-8 p-4">
        <div className="bg-sky-800">
          <div className="bg-sky-900 rounded-t-lg">
            <h1 className="text-2xl font-bold text-center"> Update Task </h1>
          </div>

          <div className="mt-5 bg-sky-700 inline-block ml-20 p-4 rounded-xl">
            <label className="text-xl mt-15 ">
              Change the Name of the Task:
            </label>
            <input
              type="text"
              placeholder="Enter Task Name..."
              className="rounded-sm pl-5 ml-5 bg-blue-900"
            ></input>
          </div>

          <div className="mt-5 bg-sky-700 inline-block ml-20 p-4 rounded-xl">
            <label className="text-xl mt-15">
              Change the Priority Level(1 being Critical and 5 being Low
              Priority):
            </label>
            <select className="bg-blue-900 mt-15 ml-5">
              <option>1</option>
              <option>2</option>
              <option>3</option>
              <option>4</option>
              <option>5</option>
            </select>
          </div>

          <div className="mt-5 bg-sky-700 inline-block ml-20 p-4 rounded-xl">
            <label className="text-xl mt-15">Change Due Date:</label>
            <input type="date" className="mt-15 ml-5 bg-blue-900"></input>
          </div>

          <div className="mt-5 bg-sky-700 inline-block ml-20 p-4 rounded-xl">
            <label className="text-xl mt-15 block">
              Change Task Description:
            </label>
            <textarea
              placeHolder="Enter a Description..."
              className="rounded-sm mt-30 bg-blue-900 pl-5"
            ></textarea>
          </div>

          <div className="mt-5 bg-sky-700 inline-block ml-20 p-4 rounded-xl absolute">
            <label className="text-xl mt-15 block">Re-assign Users:</label>
            <input
              type="text"
              placeholder="Enter User ID..."
              className="rounded-sm pl-5  bg-blue-900"
            ></input>
            <button className="bg-green-700 w-30 ml-5 p-2 rounded-xl">
              Add User
            </button>
            <button className="bg-red-700 w-30 ml-5 p-2 rounded-xl">
              Remove User
            </button>
          </div>

          <div className="rounded-sm mt-5 bg-sky-900 rounded-b-lg p-2 flex justify-center">
            <button className="bg-green-700 w-30 p-2 ml-auto mr-auto rounded-xl">
              Update Task
            </button>
          </div>
        </div>
      </section>

      {/*-----------------------------------------Lock Task from Users-----------------------------------------------------------------------*/}
      <section>
        <div className="bg-sky-800">
          <div className="bg-sky-900 rounded-t-lg">
            <h1 className="text-2xl font-bold text-center"> Lock Task </h1>
          </div>

          <div className="mt-5 bg-sky-700 inline-block ml-20 p-4 rounded-xl">
            <label className="text-xl mt-15 block">Type in Task ID:</label>
            <input
              type="text"
              placeholder="Enter Task Name..."
              className="rounded-sm pl-5  bg-blue-900"
            ></input>
          </div>

          <div className="rounded-sm mt-5 bg-sky-900 rounded-b-lg p-2 flex justify-center">
            <button className="bg-red-700 w-30 p-2 ml-auto mr-auto rounded-xl">
              Lock Task
            </button>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Admin;
