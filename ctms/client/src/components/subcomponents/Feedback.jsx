import React, { useState, useEffect } from "react";

const Feedback = ({ icon, message, seconds, isSuccess }) => {
  const [opacity, setOpacity] = useState(0);

  useEffect(() => {
    // Fade in immediately
    setOpacity(1);

    // Start fade out before end
    const fadeOutTime = (seconds - 1) * 1000;
    const fadeTimer = setTimeout(() => {
      setOpacity(0);
    }, fadeOutTime);

    return () => clearTimeout(fadeTimer);
  }, [seconds]);

  return (
    <div
      className={`
            fixed z-50 w-1/2 my-6 left-1/2 transform -translate-x-1/2 justify-center 
            flex items-center p-4 rounded-lg transition-opacity duration-500 ease-in-out
            ${isSuccess ? "bg-green-600" : "bg-red-600"}
        `}
      style={{ opacity }}
    >
      <span className="text-white mr-2">{icon}</span>
      <span className="text-white font-medium text-lg">{message}</span>
    </div>
  );
};

export default Feedback;
