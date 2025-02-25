const IconButton = ({ onClick, icon, color }) => {
  return (
    <button
      onClick={onClick}
      className={`p-2 rounded-full  t200e text-slate-500 hover:text-white ${color}`}
    >
      {icon}
    </button>
  );
};

export default IconButton;
