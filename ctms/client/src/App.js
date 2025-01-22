import React, { useEffect, useState } from 'react';
import './css/output.css';

function App() {
  const [backendData, setBackendData] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Fetch from the home route ('/'), which gets data from the database
    fetch('http://localhost:15000/')
      .then((res) => res.json())
      .then((data) => {
        setBackendData(data);  // Store backend data in state
        setLoading(false);      // Set loading to false after data is fetched
      })
      .catch((error) => {
        console.error("Error fetching data:", error);
        setLoading(false);  // Stop loading even if there's an error
      });
  }, []);

  return (
    <div className='text-center mp5'>
      <h1 className='text-4xl my-5'>App</h1>
      {loading ? ( // Show loading indicator while fetching
        <p>Loading...</p>
      ) : (
        backendData.length === 0 ? ( // If no data found
          <p>No data found.</p>
        ) : (
          backendData.map((school, index) => ( // Map through the data and display it
            <div key={index}>
              <p><strong>Name:</strong> {school.name}</p>
              <p><strong>Location:</strong> {school.location}</p>
            </div>
          ))
        )
      )}
    </div>
  );
}

export default App;
