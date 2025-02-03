import { useState } from "react";
import React from "react";

// This is the page for our Admin dedicated Dashboard

const AdminPage = () => {
    return(
        <div className="text-center mp5">
            <h1 className="title">Welcome to the Admin Dashboard!</h1>

             {/* Managing Roles} */}
             <section className="my-8 p-4">
                <div className="task-bg">
                <h2 className="text-2xl font-bold m-3 text-white"> Manage Users and Roles</h2>

                <div className="flex gap-5">
                <input type="text" placeholder="Search User by Employee ID..." className="task"></input>
                <button className="w-60 task bg-green-600"> Add User</button>
                </div>

                <div className="text-center">
                    <table className="border outline-4 m-auto">
                        <tr className="bg-gray-600 pt-5 pb-3 pl-10 text-center">
                          <th className="pl-10"> First Name</th>
                          <th className="pl-10"> Last Name</th>
                          <th className="pt-5 pb-3 pl-20 text-center"> Employee ID</th>
                          <th className="pt-5 pb-3 pl-40 text-center"> Email</th>
                          <th className="pt-5 pb-3 pl-40 text-center"> Role</th>
                          <th className="pt-5 pb-3 pl-20 pr-10 text-center"> Reassign/Delete User</th>
                        </tr>
                        <tr className="bg-gray-400 pl-10 pt-5 pb-5 pr-10 text-center">
                            <td >TestFirst</td>
                            <td>TestLast</td>
                            <td>TestID</td>
                            <td>TestEmail</td>
                            <td>TestRole</td>
                            <td> <button className="task bg-yellow-500 rounded pl-5 pr-5">Make Admin</button> 
                            <button className= "task bg-red-600 rounded pl-5 pr-5">Delete User</button>
                            </td>
                        </tr>
                    </table>
                </div>

               </div>
             </section>
            
            {/* Searching Tasks */}
            <section className="my-8 p-4">
                <div className="task-bg">
                <h2 className="text-2xl font-bold m-3 text-white"> Search for Existing Tasks!</h2>
                <div className="flex flex-col md:flex-row gap-4">
                <input type="text" placeholder="Search Tasks.." className="task"></input>
                <select className= "task">
                    <option value="name"> Name </option>
                    <option value="date"> Date </option>
                    <option value="status"> Status </option>
                    <option value="priority"> Priority </option>
                </select>
                </div>
                </div>
            </section>

            {/* View Task */}
            <section className="my-8 p-4 task-bg">
                <h2 className="text-2xl font-bold mb-4">View Tasks</h2>
                <p> You can view tasks here!</p>
            </section>
            
            {/*Add Task*/}
            <section className="my-8 p-4">
                <div className="task-bg">
                <h2 className="text-2xl font-bold mb-4">Add Task</h2>
                <input type="text" placeholder="Task Title" className="task"></input>
                <input type="textarea" placeholder="Task Description" className="task h-10"></input>
                <button className="w-60 task bg-blue-600 ">Add Task</button>
                </div>
            </section>

            {/* */}
            <section className="my-8 p-4">
                <div className="task-bg">
                <h2 className="text-2xl font-bold mb-4">Update Task</h2>
                <input type="text" placeholder="Task ID" className="task"></input>
                <input type="textarea" placeholder="New Name" className="task h-10"></input>
                <input type="textarea" placeholder="New Description" className="task h-10"></input>
                <button className="w-60 task bg-green-600 ">Update Task</button>
                </div>
            </section>


        </div>

    );
};

export default AdminPage;