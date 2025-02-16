import React, { useState, useEffect } from "react";

const Feedback = ({ icon, message, isSuccess }) => {
  return (
    <div
      className={`
            fixed z-[60] w-1/2 top-0 translate-y-full my-6 left-1/2  -translate-x-1/2 justify-center 
            flex items-center p-4 rounded-lg transition-opacity duration-500 ease-in-out
            ${isSuccess ? "glass-green" : "glass-amber"}
        `}
    >
      <span className="text-white mr-2">{icon}</span>
      <span className="text-white font-medium text-lg">{message}</span>
    </div>
  );
};

export default Feedback;
