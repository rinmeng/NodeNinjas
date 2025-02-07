import React from "react";

const IconizedTextField = ({
  icon,
  inputDisplay,
  inputStyle,
  value,
  onChange,
  maxLength,
  name,
  inputPlaceholder,
}) => {
  return (
    <div className="flex flex-col space-y-2 text-lg">
      {inputDisplay && <h1 className="font-semibold">{inputDisplay}</h1>}
      <div className="relative flex items-center w-full">
        {icon}
        <input
          type={
            inputDisplay.toLowerCase().includes("password")
              ? "password"
              : "text"
          }
          className={inputStyle}
          placeholder={inputPlaceholder}
          value={value}
          onChange={(e) => onChange(e)} // Pass the entire event
          maxLength={maxLength}
          name={name}
        />
      </div>
    </div>
  );
};

export default IconizedTextField;
