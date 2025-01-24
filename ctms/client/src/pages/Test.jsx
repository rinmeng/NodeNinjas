import React, { useEffect, useState } from "react";
import "../css/output.css";

function Test() {
  const [backendData, setBackendData] = useState(null); // Initialize as null instead of an empty array
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("http://localhost:15000/")
      .then((res) => res.json())
      .then((data) => {
        setBackendData(data); // Store backend data in state
        setLoading(false); // Set loading to false after data is fetched
      })
      .catch((error) => {
        console.error("Error fetching data:", error);
        setBackendData([]); // Set an empty array in case of error, to avoid null value
        setLoading(false); // Stop loading even if there's an error
      });
  }, []);

  return (
    <div className="text-center mp5">
      <h1 className="title">React App + ExpressJS!</h1>
      {loading ? (
        <p className="text-lg">Loading...</p>
      ) : backendData === null ? (
        <p className="text-lg text-red-500">
          Error fetching data. Please try again later.
        </p>
      ) : backendData.length === 0 ? (
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
