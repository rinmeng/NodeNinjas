import React from "react";

const Feedback = ({ icon, message, isSuccess }) => {
  return (
    <div
      className={`
        fixed z-[60] w-1/2 bottom-6 left-1/2 -translate-x-1/2 
        flex items-center justify-center p-4 rounded-lg transition-opacity 
        duration-500 ease-in-out shadow-lg
        ${isSuccess ? "glass-green" : "glass-amber"}
      `}
    >
      <span className="text-white mr-2">{icon}</span>
      <span className="text-white font-medium text-lg">{message}</span>
    </div>
  );
};

export default Feedback;
