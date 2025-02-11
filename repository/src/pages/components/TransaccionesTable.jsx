import React, { useState } from "react";
import { fas } from "@fortawesome/free-solid-svg-icons";
import { library } from "@fortawesome/fontawesome-svg-core";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";

const TransaccionesTable = ({
  transactions = [],
  editRow,
  deleteRow,
  onTableEmpty,
  onTransactions,
}) => {
  library.add(fas);

  const [sortConfig, setSortConfig] = useState({ key: null, direction: "asc" });

  const sortedTransactions = React.useMemo(() => {
    if (sortConfig.key) {
      const sorted = [...transactions].sort((a, b) => {
        const aValue = a[sortConfig.key];
        const bValue = b[sortConfig.key];

        if (aValue < bValue) {
          return sortConfig.direction === "asc" ? -1 : 1;
        }
        if (aValue > bValue) {
          return sortConfig.direction === "asc" ? 1 : -1;
        }
        return 0;
      });
      return sorted;
    }
    return transactions;
  }, [transactions, sortConfig]);

  const handleSort = (key) => {
    setSortConfig((prevConfig) => ({
      key,
      direction: prevConfig.key === key && prevConfig.direction === "asc" ? "desc" : "asc",
    }));
  };

  if (transactions.length === 0) {
    onTableEmpty();
  } else {
    onTransactions();
    return (
      <div className="w-full p-4 border-4 border-[#001d3d] bg-[#000814] text-white rounded-lg">
        <h2 className="text-xl md:text-2xl py-2 font-bold text-gray-100">
          Historial de Transacciones
        </h2>

        {/* Contenedor de la tabla */}
        <div className="overflow-x-auto">
          <table className="w-full table-auto hidden md:table">
            <thead>
              <tr className="text-left border-b border-gray-700">
                <th className="py-2 cursor-pointer text-white" onClick={() => handleSort("fecha")}>
                  Fecha {sortConfig.key === "fecha" && (sortConfig.direction === "asc" ? "▲" : "▼")}
                </th>
                <th className="py-2 cursor-pointer text-white" onClick={() => handleSort("motivo")}>
                  Motivo {sortConfig.key === "motivo" && (sortConfig.direction === "asc" ? "▲" : "▼")}
                </th>
                <th className="py-2 cursor-pointer text-white" onClick={() => handleSort("valor")}>
                  Valor {sortConfig.key === "valor" && (sortConfig.direction === "asc" ? "▲" : "▼")}
                </th>
                <th className="py-2 text-white">
                  Categoria 
                </th>
                <th className="py-2 text-white">
                  Medio de Pago
                </th>
                <th className="py-2"></th>
              </tr>
            </thead>
            <tbody>
              {sortedTransactions.map((transaction, index) => (
                <tr
                  key={index}
                  className="border-b border-gray-700 hover:bg-gray-800 bg-[#001d3d]"
                >
                  <td className="py-2">{transaction.fecha}</td>
                  <td className="py-2">{transaction.motivo}</td>
                  <td className="py-2">{transaction.valor}</td>
                  <td className="py-2">{transaction.categoria}</td>
                  <td className="py-2">{transaction.tipoGasto}</td>
                  <td className="py-2 flex space-x-2">
                    <button
                      className="p-1 bg-yellow-500 rounded hover:bg-yellow-700"
                      onClick={() => editRow(transaction)}
                    >
                      <FontAwesomeIcon
                        icon="fa-solid fa-pen-to-square"
                        style={{ color: "#000000" }}
                        size="lg"
                      />
                    </button>
                    <button
                      className="p-1 bg-red-600 rounded hover:bg-red-700"
                      onClick={() => deleteRow(transaction.id)}
                    >
                      <FontAwesomeIcon
                        icon="fa-solid fa-trash"
                        style={{ color: "#000000" }}
                        size="lg"
                      />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

      {/* Vista responsiva: tarjetas */}
      <div className="space-y-4 md:hidden">
        {transactions.map((transaction, index) => (
          <div
            key={index}
            className="p-4 bg-[#001d3d] rounded-md shadow-md"
          >
            <div className="flex justify-between mb-2">
              <span className="font-semibold text-sm">Date:</span>
              <span>{transaction.fecha}</span>
            </div>
            <div className="flex justify-between mb-2">
              <span className="font-semibold text-sm mr-2">Description:</span>
              <span className="truncate">{transaction.motivo}</span>
            </div>
            <div className="flex justify-between mb-2">
              <span className="font-semibold text-sm">Amount:</span>
              <span>{transaction.valor}</span>
            </div>
            <div className="flex justify-between items-center mb-2">
              <span className="font-semibold text-sm">Status:</span>
              <span className={`px-2 py-1 rounded-md text-s`}>
                {transaction.categoria}
              </span>
            </div>
            <div className="flex space-x-2">
              <button className="p-1 bg-gray-700 rounded hover:bg-gray-600">
                🔍
              </button>
              <button className="p-1 bg-gray-700 rounded hover:bg-gray-600">
                🗑️
              </button>
            </div>
          </div>
        ))}
      </div>
      </div>
    );
  }
};

export default TransaccionesTable;
