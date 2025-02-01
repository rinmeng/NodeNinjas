import React from "react";

const DBTable = ({ columns, data, loading }) => {
  if (loading) {
    return <p className="text-lg">Loading...</p>;
  }

  if (!data || data.length === 0) {
    return (
      <div className="grid grid-cols-1 gap-4 bg-slate-800 rounded-xl mp5 max-w-3xl mx-auto">
        <p className="text-lg col-span-1 p-4 text-center">
          Database found, but no data was in it.
        </p>
      </div>
    );
  }

  return (
    <div
      className="grid gap-4 bg-slate-800 rounded-xl mp5 max-w-7xl mx-auto"
      style={{
        gridTemplateColumns: `repeat(${columns.length}, minmax(0, 1fr))`,
      }}
    >
      {/* Header Row */}
      {columns.map((column, index) => (
        <div
          key={index}
          className="font-bold p-2 text-center border-b-2 border-gray-600"
        >
          {column.header}
        </div>
      ))}

      {/* Data Rows */}
      {data.map((item, rowIndex) => (
        <React.Fragment key={rowIndex}>
          {columns.map((column, colIndex) => (
            <div
              key={`${rowIndex}-${colIndex}`}
              className="p-2 text-center border-b border-gray-700"
            >
              {item[column.key]}
            </div>
          ))}
        </React.Fragment>
      ))}
    </div>
  );
};

export default DBTable;
