import React from "react";

const IconizedButton = ({ icon, text, btnStyle, onClick }) => {
  return (
    <button
      className={`${btnStyle}  flex justify-center items-center `}
      onClick={onClick}
    >
      <span>{text}</span>
      {icon}
    </button>
  );
};

export default IconizedButton;
