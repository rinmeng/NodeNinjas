import React, { useEffect, useState } from "react";
import "../css/output.css";

function Test() {
  const [backendData, setBackendData] = useState(null); // To store backend data
  const [loading, setLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState(""); // To store error messages

  useEffect(() => {
    fetch("http://localhost:15000/")
      .then((res) => {
        if (!res.ok) {
          // If response status is not OK (e.g., 500 or 404), throw an error
          return res.json().then((error) => {
            throw new Error(error.error || "Unknown error occurred");
          });
        }
        return res.json();
      })
      .then((data) => {
        setBackendData(data); // Store backend data in state
        setLoading(false); // Set loading to false after data is fetched
      })
      .catch((error) => {
        console.error("Error fetching data:", error);
        setErrorMessage(error.message); // Set the error message from the response or generic message
        setLoading(false); // Stop loading even if there's an error
      });
  }, []);

  return (
    <div className="text-center mp5">
      <h1 className="title">React App + ExpressJS!</h1>
      {loading ? (
        <p className="text-lg">Loading...</p>
      ) : errorMessage ? (
        <p className="text-lg text-red-500">
          Error: {errorMessage} {/* Display the error message */}
        </p>
      ) : backendData && backendData.length === 0 ? (
        <p className="text-lg">No data found.</p>
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
