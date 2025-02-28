import React, { useState } from "react";

const IconButton = ({
  onClick,
  icon,
  hoverIcon,
  color,
  tooltip,
  isDisabled,
}) => {
  const [isHovering, setIsHovering] = useState(false);

  // Determine which icon to display - use hoverIcon if provided and hovering, otherwise use default icon
  const displayIcon = isHovering && hoverIcon ? hoverIcon : icon;

  return (
    <div className="relative inline-block">
      <button
        onClick={onClick}
        onMouseEnter={() => setIsHovering(true)}
        onMouseLeave={() => setIsHovering(false)}
        className={`p-2 items-center rounded-full transition-all duration-200 text-slate-500  ${
          isDisabled ? "" : color
        }
        ${isDisabled ? "opacity-50 cursor-not-allowed " : ""}`}
        disabled={isDisabled}
      >
        {displayIcon}
      </button>
      {isHovering && tooltip && (
        <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-2 py-1 bg-gray-800 text-white text-xs rounded whitespace-nowrap">
          {tooltip}
        </div>
      )}
    </div>
  );
};

export default IconButton;
