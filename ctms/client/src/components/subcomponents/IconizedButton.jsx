import React from "react";

const IconizedButton = ({ icon, text, btnStyle, onClick }) => {
  return (
    <button
      className={`${btnStyle}  flex justify-center items-center cursor-pointer `}
      onClick={onClick}
      disabled={btnStyle.includes("disabled")} // disable button if it has the disabled class
    >
      <span>{text}</span>
      {icon}
    </button>
  );
};

export default IconizedButton;
