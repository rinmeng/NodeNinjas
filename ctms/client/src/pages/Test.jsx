import React from "react";
import { Link } from "react-router-dom";

const Test = () => {
  return (
    <div className="text-center mp5 my-16">
      <h1 className="title">Test Page</h1>
      <p className="text-xl">
        Welcome to the Test Page! You can find all the testing page for the
        tables here. Click on the links below to test the tables:
      </p>
      <div className="grid grid-cols-2 gap-2">
        <Link to="/test/user" className="test-panel">
          Users Table Testing
        </Link>
        <Link to="/test/task" className="test-panel">
          Tasks Table Testing
        </Link>
      </div>
    </div>
  );
};

export default Test;
