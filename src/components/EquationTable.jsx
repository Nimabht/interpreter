import React from "react";

const EquationTable = ({ equations }) => {
  return (
    <div className="text-center overflow-y-auto px-9">
      <h2 className="text-2xl font-bold mb-3">STACK</h2>
      <table className="min-w-full bg-white border border-gray-300  rounded overflow-hidden">
        <thead>
          <tr>
            <th className="py-2 px-4 border-b">Equation Name</th>
            <th className="py-2 px-4 border-b">Expression</th>
          </tr>
        </thead>
        <tbody>
          {Object.entries(equations).map(([name, expression]) => (
            <tr key={name}>
              <td className="py-2 px-4 border-b">{name}</td>
              <td className="py-2 px-4 border-b">{expression}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default EquationTable;
