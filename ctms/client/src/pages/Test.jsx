import React, { useEffect, useState } from "react";
import "../css/output.css";

const proxy = "http://localhost:15000/";

function Test() {
  const [backendData, setBackendData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState("");
  const [deleteUserId, setDeleteUserId] = useState(""); // Add state for the user ID input

  const fetchData = () => {
    fetch(proxy + "user/all")
      .then((res) => {
        if (!res.ok) {
          return res.json().then((error) => {
            throw new Error(error.error || "Unknown error occurred");
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
        setMessage(error.message);
        setLoading(false);
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
    fetch(proxy + "user/add", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        username: "test",
        email: "test@email.test",
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

  const testDelete = () => {
    if (!deleteUserId) {
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
    <div className="text-center mp5 space-y-4">
      <h1 className="title">React App + ExpressJS!</h1>
      <div className="space-y-4 flex flex-col justify-center m-auto">
        <div className="flex flex-col justify-center m-auto space-y-4">
          <div className="flex flex-row justify-center space-x-4">
            <button onClick={testAdd} className="btn-blue">
              Add Test User
            </button>
            <button type="button" onClick={testDelete} className="btn-red">
              Delete User
            </button>
          </div>
          <form className="space-y-2 w-full">
            {/* Input field to enter the user ID for deletion */}
            <input
              className="forms"
              type="text"
              value={deleteUserId}
              onChange={(e) => setDeleteUserId(e.target.value)} // Update the state when user types
              placeholder="Enter User ID"
            />
          </form>
        </div>
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
      ) : message === "Internal Server Error: Is database setup yet?" ? (
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
              } text-lg text-red-500 my-4`}
            >
              {message}
            </p>
          </div>
          <div className="grid grid-cols-3 gap-4 bg-slate-800 rounded-xl mp5 max-w-3xl mx-auto">
            {backendData && backendData.length === 0 ? (
              <p className="text-lg col-span-3">
                Database found, but no data was in it.
              </p>
            ) : null}
            <div className="font-bold p-2 text-center border-b-2 border-gray-600">
              ID
            </div>
            <div className="font-bold p-2 text-center border-b-2 border-gray-600">
              Name
            </div>
            <div className="font-bold p-2 text-center border-b-2 border-gray-600">
              Email
            </div>

            {backendData.map((user, index) => (
              <React.Fragment key={index}>
                <div className="p-2 text-center border-b border-gray-700">
                  {user.id}
                </div>
                <div className="p-2 text-center border-b border-gray-700">
                  {user.username}
                </div>
                <div className="p-2 text-center border-b border-gray-700">
                  {user.email}
                </div>
              </React.Fragment>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

export default Test;
