import React, { useEffect, useState } from "react";
import "../../css/output.css";
import DBTable from "./subcomp/DBTable";

const proxy = "http://localhost:15000/";

function Test() {
  const isOnlyNumbers = (str) => /^[0-9]+$/.test(str);

  const [backendData, setBackendData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState("");
  const [deleteUserId, setDeleteUserId] = useState(""); // Add state for the user ID input
  const [formData, setFormData] = useState({
    username: "",
    email: "",
    password: "",
    role: "",
    displayName: "",
  });

  const columns = [
    { header: "id", key: "id" },
    { header: "username", key: "username" },
    { header: "email", key: "email" },
    { header: "role", key: "role" },
    { header: "password_hash", key: "password_hash" },
    { header: "display_name", key: "display_name" },
    { header: "manager_id", key: "manager_id" },
  ];

  const fetchData = () => {
    fetch(proxy + "user/all", { credentials: "include" })
      .then((res) => {
        if (!res.ok) {
          // Parse the error response as JSON
          return res.json().then((error) => {
            throw new Error(error.message || "Failed to fetch users");
          });
        }
        return res.json();
      })
      .then((data) => {
        setBackendData(data);
        setLoading(false);
      })
      .catch((error) => {
        console.error("Error fetching data:", error);
        setMessage(
          "An error occurred while fetching data, Is the server running? Is the database loaded?"
        );
        setLoading(false);
        setBackendData([]); // Set empty data on error
      });
  };

  const resetTableData = () => {
    fetch(proxy + "setup/reset")
      .then((res) => res.json())
      .then((data) => {
        setMessage(data.message);
        fetchData();
      });
  };

  const deleteTableData = () => {
    fetch(proxy + "setup/delete")
      .then((res) => res.json())
      .then((data) => {
        setMessage(data.message);
        fetchData();
      });
  };

  const testAdd = () => {
    if (
      !formData.username ||
      !formData.email ||
      !formData.password ||
      !formData.role ||
      !formData.displayName ||
      !isOnlyNumbers(formData.managerId)
    ) {
      setMessage("Please fill in all fields");
      return;
    }
    if (formData.role !== "admin" && formData.role !== "team_member") {
      setMessage("Role must be either 'admin' or 'team_member'");
      return;
    }
    fetch(proxy + "user/add", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        username: formData.username,
        email: formData.email,
        password_hash: formData.password,
        role: formData.role,
        display_name: formData.displayName,
        manager_id: parseInt(formData.managerId),
      }),
    })
      .then((res) => res.json())
      .then((data) => {
        if (data.error) {
          setMessage(data.error);
        } else {
          setMessage(data.message);
          fetchData();
        }
      });
  };

  const testAdd10Users = () => {
    const users = Array.from({ length: 10 }, (_, i) => ({
      username: `testuser${i + 1}`,
      email: `testuser${i + 1}@example.com`,
      password_hash: `password${i + 1}`,
      role: i === 9 ? "admin" : "team_member",
      display_name: `Test User ${i + 1}`,
    }));

    Promise.all(
      users.map((user) =>
        fetch(proxy + "user/add", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(user),
        }).then((res) => res.json())
      )
    )
      .then((results) => {
        const errors = results.filter((result) => result.error);
        if (errors.length) {
          setMessage(
            `Failed to add some users: ${errors.map((e) => e.error).join(", ")}`
          );
        } else {
          setMessage("Successfully added 10 test users");
          fetchData();
        }
      })
      .catch((error) => {
        setMessage("Failed to add test users");
      });
  };

  const testDelete = () => {
    if (!deleteUserId || !isOnlyNumbers(deleteUserId)) {
      setMessage("Please enter a valid user ID to delete");
      return;
    }
    fetch(proxy + `user/delete/${deleteUserId}`, {
      method: "DELETE",
    })
      .then((res) => res.json())
      .then((data) => {
        if (data.error) {
          setMessage(data.error);
        } else {
          setMessage(data.message);
          fetchData();
        }
      })
      .catch((error) => {
        setMessage("Failed to delete user");
      });
  };

  const setupDatabase = () => {
    fetch(proxy + "setup")
      .then((res) => res.json())
      .then((data) => {
        setMessage(data.message);
        window.location.reload();
      });
  };

  useEffect(() => {
    fetchData();
  }, []);

  return (
    <div className="text-center mp5 space-y-4 my-16">
      <h1 className="title">React App + ExpressJS!</h1>
      <div className="space-y-4 flex flex-col justify-center m-auto">
        <div className="flex flex-col justify-center m-auto space-y-4">
          <button onClick={testAdd10Users} className="btn-blue">
            Add 10 Tests User
          </button>
          <h1 className="text-3xl">Add Users</h1>
          <form className="flex flex-col space-y-2 w-full">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <h2 className="text-lg">Username:</h2>
                <input
                  className="forms "
                  type="text"
                  placeholder="Username"
                  value={formData.username}
                  onChange={(e) =>
                    setFormData({ ...formData, username: e.target.value })
                  }
                />
              </div>
              <div>
                <h2 className="text-lg">Password:</h2>
                <input
                  className="forms"
                  type="text"
                  placeholder="Password"
                  value={formData.password}
                  onChange={(e) =>
                    setFormData({ ...formData, password: e.target.value })
                  }
                />
              </div>
              <div className="col-span-2">
                <h2 className="text-lg">Display Name:</h2>
                <input
                  className="forms w-full"
                  type="text"
                  placeholder="Display Name"
                  value={formData.displayName}
                  onChange={(e) =>
                    setFormData({ ...formData, displayName: e.target.value })
                  }
                />
              </div>
              <div>
                <h2 className="text-lg">Email:</h2>
                <input
                  className="forms"
                  type="text"
                  placeholder="Email"
                  value={formData.email}
                  onChange={(e) =>
                    setFormData({ ...formData, email: e.target.value })
                  }
                />
              </div>
              <div>
                <h2 className="text-lg">Role:</h2>
                <input
                  className="forms"
                  type="text"
                  placeholder="Role"
                  value={formData.role}
                  onChange={(e) =>
                    setFormData({ ...formData, role: e.target.value })
                  }
                />
              </div>
              <div>
                <h2 className="text-lg">Manager ID:</h2>
                <input
                  className="forms"
                  type="text"
                  placeholder="Manager ID"
                  value={formData.managerId}
                  onChange={(e) =>
                    setFormData({ ...formData, managerId: e.target.value })
                  }
                />
              </div>
            </div>
            <button type="button" onClick={testAdd} className="btn-blue">
              Add User
            </button>
          </form>

          <h1 className="text-3xl">Delete Users</h1>
          <form className="space-y-2 w-full space-x-4">
            <input
              className="forms "
              type="text"
              value={deleteUserId}
              onChange={(e) => setDeleteUserId(e.target.value)} // Update the state when user types
              placeholder="Enter User ID"
            />
            <button type="button" onClick={testDelete} className="btn-red">
              Delete User
            </button>
          </form>
        </div>

        <h1 className="text-3xl">Table Actions</h1>
        <div className="flex flex-row justify-center w-full space-x-4">
          <button onClick={resetTableData} className="btn-grey">
            Reset Table
          </button>
          <button onClick={deleteTableData} className="btn-red">
            Delete Table
          </button>
          <button onClick={setupDatabase} className="btn-green">
            Load database
          </button>
        </div>
      </div>
      {loading ? (
        <p className="text-lg">Loading...</p>
      ) : message.toLowerCase().includes("error") ? (
        <div>
          <p className="text-lg text-red-500 my-4">{message}</p>
        </div>
      ) : (
        <div>
          <div>
            <p
              className={`${
                message.toLowerCase().includes("success")
                  ? "text-green-500"
                  : "text-red-500"
              } text-lg my-4`}
            >
              {message}
            </p>
          </div>
          <DBTable
            columns={columns}
            data={backendData || []}
            loading={loading}
          />
        </div>
      )}
    </div>
  );
}

export default Test;
