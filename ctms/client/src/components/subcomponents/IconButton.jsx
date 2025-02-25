import React, { useState } from "react";

const IconButton = ({ onClick, icon, hoverIcon, color }) => {
  const [isHovering, setIsHovering] = useState(false);

  // Determine which icon to display - use hoverIcon if provided and hovering, otherwise use default icon
  const displayIcon = isHovering && hoverIcon ? hoverIcon : icon;

  return (
    <button
      onClick={onClick}
      onMouseEnter={() => setIsHovering(true)}
      onMouseLeave={() => setIsHovering(false)}
      className={`p-2 rounded-full transition-all duration-200 text-slate-500 hover:text-white ${color}`}
    >
      {displayIcon}
    </button>
  );
};

export default IconButton;
