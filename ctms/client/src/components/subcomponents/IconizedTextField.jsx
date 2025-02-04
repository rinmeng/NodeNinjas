import React from "react";

const IconizedTextField = ({
  icon,
  inputDisplay,
  inputStyle,
  value,
  onChange,
  maxLength,
}) => {
  return (
    <div className="flex flex-col space-y-2 text-lg">
      <h1 className="font-semibold">{inputDisplay}</h1>
      <div className="relative flex items-center w-full">
        {icon}
        <input
          type={
            inputDisplay.toLowerCase().includes("password")
              ? "password"
              : "text"
          }
          className={inputStyle}
          value={value}
          onChange={onChange}
          maxLength={maxLength}
        />
      </div>
    </div>
  );
};

export default IconizedTextField;
