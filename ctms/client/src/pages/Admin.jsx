import { useState } from "react";
import React from "react";
import DBTable from "./testing/subcomp/DBTable";

const Admin = ({ sessionUser, devMode }) => {
  if ((!sessionUser || sessionUser.role !== "admin") && !devMode) {
    return (
      <div className="mp5 my-16 animate-fadein">
        <h1 className="title text-center">Welcome to the Admin Dashboard!</h1>
        <p className="text-center">Please log in as admin to view this page.</p>
      </div>
    );
  }
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
            <select className="bg-blue-900 mt-15 ml-5">
              <option value="teamMember">Team Members</option>
              <option value="priority">Priority</option>
              <option value="date">Due Date</option>
            </select>
          </div>

          <div>
            <DBTable />
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
          <p className="text-xl mt-15 p-30 text-center">
            You can view Tasks here!
          </p>

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
            ></input>
          </div>

          <div className="mt-5 bg-sky-700 inline-block ml-20 p-4 rounded-xl">
            <label className="text-xl mt-15">
              Choose the Priority Level(1 being Critical and 5 being Low
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
            <label className="text-xl mt-15">Choose a Due Date:</label>
            <input type="date" className="mt-15 ml-5 bg-blue-900"></input>
          </div>

          <div className="mt-5 bg-sky-700 inline-block ml-20 p-4 rounded-xl">
            <label className="text-xl mt-15 block">
              Enter Task Description:
            </label>
            <textarea
              placeHolder="Enter a Description..."
              className="rounded-sm mt-30 bg-blue-900 pl-5"
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
            <button className="bg-green-700 w-30 p-2 ml-auto mr-auto rounded-xl">
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
