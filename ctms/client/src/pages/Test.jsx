import React from "react";
import { Link, Navigate } from "react-router-dom";

const Test = ({ sessionUser, devMode }) => {
  // Don't use this yet since we need to set up backend sometimes.

  // if (!sessionUser && !devMode) {
  //   return (
  //     <div className="mp5 my-16 animate-fadein">
  //       <h1 className="title text-center">Welcome to the Testing Page!</h1>
  //       <p className="text-center text-xl">
  //         Please log in as admin to view this page, or enable{" "}
  //         <code>devMode</code> to bypass authentication in <code>App.jsx</code>
  //       </p>
  //       {/* redirect to /login */}
  //       <Navigate to="/login" />
  //     </div>
  //   );
  // }
  return (
    <div className="text-center mp5 my-16 animate-fadein">
      <h1 className="title">Test Page</h1>
      <p className="text-xl">
        Welcome to the Test Page! You can find all the testing page for the
        tables here. Click on the links below to test the tables:
      </p>
      <div className="grid grid-cols-2 gap-2">
        <Link to="/test/user" className="test-panel-blue">
          Users Table Testing
        </Link>
        <Link to="/test/task" className="test-panel-amber">
          Tasks Table Testing
        </Link>
      </div>
    </div>
  );
};

export default Test;
