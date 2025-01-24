import React, { useEffect, useState } from "react";
import "../css/output.css";

function Test() {
  const [backendData, setBackendData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState("");

  const fetchData = () => {
    fetch("http://localhost:15000/")
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

  const setupDatabase = () => {
    fetch("http://localhost:15000/setup")
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
    <div className="text-center mp5">
      <h1 className="title">React App + ExpressJS!</h1>
      {loading ? (
        <p className="text-lg">Loading...</p>
      ) : errorMessage ? (
        <div>
          <p className="text-lg text-red-500">Error: {errorMessage}</p>
          <button onClick={setupDatabase} className="btn">
            Load database
          </button>
        </div>
      ) : backendData && backendData.length === 0 ? (
        <p className="text-lg">Database found, but no data was in it.</p>
      ) : (
        <div>
          <div>Data loaded!</div>
          <div className="grid grid-cols-2 gap-4 bg-slate-800 rounded-xl mp5">
            <div className="font-bold p-2 text-center border-b-2 border-gray-600">
              Name
            </div>
            <div className="font-bold p-2 text-center border-b-2 border-gray-600">
              Location
            </div>
            {backendData.map((school, index) => (
              <React.Fragment key={index}>
                <div className="p-2 text-center border-b border-gray-700">
                  {school.name}
                </div>
                <div className="p-2 text-center border-b border-gray-700">
                  {school.location}
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
