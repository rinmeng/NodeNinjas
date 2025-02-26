import React from "react";
import { Check } from "lucide-react";

const TickCheckbox = ({ checked, onChange, label, name }) => {
  return (
    <label className="flex items-center cursor-pointer">
      <div className="relative items-center">
        <input
          type="checkbox"
          name={name}
          className="items-center flex justify-center cursor-pointer
                  h-6 w-6 border-2 peer checked:border-blue-500 appearance-none 
                  rounded-md border-slate-400 t200e"
          checked={checked}
          onChange={onChange}
        />
        <Check
          className="absolute top-1/2 left-1/2 
                  ml-auto mr-auto
                  -translate-x-3
                  -translate-y-4 w-7 h-7 
                  pointer-events-none opacity-0 peer-checked:opacity-100 
                  transition-opacity duration-200"
        />
      </div>
      <h1 className="ml-2 font-semibold">{label}</h1>
    </label>
  );
};

export default TickCheckbox;
