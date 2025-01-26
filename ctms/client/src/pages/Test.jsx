import React, { useEffect, useState } from "react";
import "../css/output.css";

const proxy = "http://localhost:15000/";

function Test() {
  const [backendData, setBackendData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState("");
  const [deleteUserId, setDeleteUserId] = useState(""); // Add state for the user ID input

  const fetchData = () => {
    fetch(proxy)
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
        setErrorMessage(error.message);
        setLoading(false);
      });
  };

  const resetTableData = () => {
    fetch(proxy + "setup/reset")
      .then((res) => {
        if (!res.ok) {
          return res.json().then((error) => {
            throw new Error(error.error || "Reset failed");
          });
        }
        return res.json();
      })
      .then(() => {
        window.location.reload();
      })
      .catch((error) => {
        console.error("Reset error:", error);
        setErrorMessage(error.message);
      });
  };

  const deleteTableData = () => {
    fetch(proxy + "setup/delete")
      .then((res) => {
        if (!res.ok) {
          return res.json().then((error) => {
            throw new Error(error.error || "Delete failed");
          });
        }
        return res.json();
      })
      .then(() => {
        window.location.reload();
      })
      .catch((error) => {
        console.error("Delete error:", error);
        setErrorMessage(error.message);
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
      .then((res) => {
        if (!res.ok) {
          return res.json().then((error) => {
            throw new Error(error.error || "Add failed");
          });
        }
        return res.json();
      })
      .then(() => {
        window.location.reload();
      })
      .catch((error) => {
        console.error("Add error:", error);
        setErrorMessage(error.message);
      });
  };

  const testDelete = () => {
    if (!deleteUserId) {
      setErrorMessage("Please enter a valid user ID to delete");
      return;
    }

    fetch(proxy + `user/delete/${deleteUserId}`, {
      method: "DELETE", // Send a DELETE request
    })
      .then((res) => {
        if (!res.ok) {
          return res.json().then((error) => {
            throw new Error(error.error || "Delete failed");
          });
        }
        return res.json();
      })
      .then(() => {
        window.location.reload(); // Reload to reflect the changes
      })
      .catch((error) => {
        console.error("Delete error:", error);
        setErrorMessage(error.message);
      });
  };

  const setupDatabase = () => {
    fetch(proxy + "setup")
      .then((res) => {
        if (!res.ok) {
          return res.json().then((error) => {
            throw new Error(error.error || "Setup failed");
          });
        }
        return res.json();
      })
      .then(() => {
        window.location.reload();
      })
      .catch((error) => {
        console.error("Setup error:", error);
        setErrorMessage(error.message);
      });
  };

  useEffect(() => {
    fetchData();
  }, []);

  return (
    <div className="text-center mp5 space-y-4">
      <h1 className="title">React App + ExpressJS!</h1>
      <div className="space-y-4 flex flex-col justify-center w-1/6 m-auto">
        <button onClick={testAdd} className="btn">
          Add Test User
        </button>
        <form className="space-y-2 w-full">
          <button type="button" onClick={testDelete} className="btn w-full">
            Delete User
          </button>
          {/* Input field to enter the user ID for deletion */}
          <input
            className="forms"
            type="text"
            value={deleteUserId}
            onChange={(e) => setDeleteUserId(e.target.value)} // Update the state when user types
            placeholder="Enter User ID"
          />
        </form>
        <button onClick={resetTableData} className="btn-grey">
          Reset Table
        </button>
        <button onClick={deleteTableData} className="btn-red">
          Delete Table
        </button>
      </div>
      {loading ? (
        <p className="text-lg">Loading...</p>
      ) : errorMessage ? (
        <div>
          <p className="text-lg text-red-500 my-4">Error: {errorMessage}</p>
          <button onClick={setupDatabase} className="btn-green">
            Load database
          </button>
        </div>
      ) : (
        <div>
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
