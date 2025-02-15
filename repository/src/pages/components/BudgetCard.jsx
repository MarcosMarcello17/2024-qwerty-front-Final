import React, { useEffect, useState } from "react";
import ModalCreateBudget from "./ModalCreateBudget"; // Importa tu modal

function BudgetCard({
  budget,
  transacciones,
  onDelete,
  onEdit,
  widget = false,
}) {
  const icon = "https://cdn-icons-png.freepik.com/256/781/781760.png";
  const [budgetTransactions, setBudgetTransactions] = useState([]);
  const [totalGastado, setTotalGastado] = useState(0);
  const [porcentaje, setPorcentaje] = useState(0);
  const [remainingByCategory, setRemainingByCategory] = useState({});
  const [isFutureBudget, setIsFutureBudget] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const checkIfFutureBudget = (budgetYear, budgetMonth) => {
    const currentDate = new Date();
    const currentYear = currentDate.getFullYear();
    const currentMonth = currentDate.getMonth() + 1;

    setIsFutureBudget(
      budgetYear > currentYear ||
        (budgetYear === currentYear && budgetMonth > currentMonth)
    );
  };

  useEffect(() => {
    const [budgetYear, budgetMonth] = budget.budgetMonth.split("-").map(Number);
    checkIfFutureBudget(budgetYear, budgetMonth);

    const totalCategoryBudget = Object.values(budget.categoryBudgets).reduce(
      (sum, value) => sum + value,
      0
    );

    const filteredTransactions = transacciones.filter((transaccion) => {
      const transactionDate = new Date(transaccion.fecha);
      const transactionYear = transactionDate.getFullYear();
      const transactionMonth = transactionDate.getMonth() + 1;
      const isSameMonth =
        transactionYear === budgetYear && transactionMonth === budgetMonth;

      let isCategoryValid = 1;
      if (transaccion.categoria == "Ingreso de Dinero") {
        isCategoryValid = 0;
      }

      return isSameMonth && isCategoryValid;
    });

    setBudgetTransactions(filteredTransactions);

    const total = filteredTransactions.reduce(
      (acc, transaccion) => acc + transaccion.valor,
      0
    );
    setTotalGastado(total);

    setPorcentaje((total / Number(budget.totalBudget)) * 100);

    const remaining = {};
    for (const [category, allocatedBudget] of Object.entries(
      budget.categoryBudgets
    )) {
      const spentInCategory = filteredTransactions
        .filter((transaccion) => transaccion.categoria === category)
        .reduce((acc, transaccion) => acc + transaccion.valor, 0);
      remaining[category] = allocatedBudget - spentInCategory;
    }
    setRemainingByCategory(remaining);
  }, []);

  function getFirstAndLastDayOfMonth(monthString) {
    const [year, month] = monthString.split("-").map(Number);
    const firstDay = new Date(year, month - 1, 1);
    const lastDay = new Date(year, month, 0);
    return {
      dateFrom: firstDay.toISOString().split("T")[0],
      dateTo: lastDay.toISOString().split("T")[0],
    };
  }

  function handleEdit() {
    setIsModalOpen(true);
  }

  function closeModal() {
    setIsModalOpen(false);
    onEdit();
  }

  const { dateFrom, dateTo } = getFirstAndLastDayOfMonth(budget.budgetMonth);
  const categoryNames = Object.keys(budget.categoryBudgets);
  const categoryString = categoryNames.join(", ");

  function handleDelete() {
    if (
      window.confirm("¿Estás seguro de que deseas eliminar este presupuesto?")
    ) {
      onDelete(budget);
    }
  }

  if (widget) {
    return (
      <div className="card shadow-lg rounded-lg bg-[#001d3d] p-4 text-white mb-4">
        <div className="flex items-center gap-4 mb-2">
          <img src={icon} alt={budget.nameBudget} className="w-10 h-10" />
          <div className="flex-1">
            <div className="text-xl font-semibold">{budget.nameBudget}</div>
            <div className="text-sm text-white">{categoryString}</div>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <div className="w-full bg-gray-100 rounded-full h-4 relative">
            <div
              style={{ width: `${porcentaje > 100 ? 100 : porcentaje}%` }}
              className={`absolute top-0 left-0 h-full rounded-full transition-all ${
                porcentaje < 50
                  ? "bg-green-400"
                  : porcentaje <= 90
                  ? "bg-yellow-400"
                  : "bg-red-700"
              }`}
            />
          </div>
          <div className="text-sm font-semibold">{porcentaje.toFixed(1)}%</div>
        </div>

        <div className="flex justify-between mt-2 text-sm">
          <span>$0</span>
          <span>Gastado: ${totalGastado}</span>
          <span>${budget.totalBudget}</span>
        </div>
      </div>
    );
  } else {
    return (
      <div className="card shadow-lg rounded-lg bg-[#001d3d] p-4 text-white">
        <div className="flex items-center gap-4 mb-2">
          <img src={icon} alt={budget.nameBudget} className="w-10 h-10" />
          <div className="flex-1">
            <div className="text-xl font-semibold">{budget.nameBudget}</div>
            <div className="text-sm text-white">{categoryString}</div>
            <div className="text-sm text-white">{`${dateFrom} a ${dateTo}`}</div>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <div className="w-full bg-gray-100 rounded-full h-4 relative">
            <div
              style={{ width: `${porcentaje > 100 ? 100 : porcentaje}%` }}
              className={`absolute top-0 left-0 h-full rounded-full transition-all ${
                porcentaje < 50
                  ? "bg-green-400"
                  : porcentaje <= 90
                  ? "bg-yellow-400"
                  : "bg-red-700"
              }`}
            />
          </div>
          <div className="text-sm font-semibold">
            {(porcentaje > 100 ? 100 : porcentaje).toFixed(1)}%
          </div>
        </div>

        <div className="flex justify-between mt-2 text-sm">
          <span>$0</span>
          <span>Gastado: ${totalGastado}</span>
          <span>${budget.totalBudget}</span>
        </div>

        <div className="mt-4">
          <span className="text-sm font-semibold text-white">
            {`Monto restante: $ ${
              budget.totalBudget - totalGastado < 0
                ? 0
                : budget.totalBudget - totalGastado
            }` +
              (budget.totalBudget - totalGastado < 0
                ? " ($ " + (totalGastado - budget.totalBudget) + " por encima)"
                : "")}
          </span>
          {Object.entries(remainingByCategory).map(([category, remaining]) => {
            const totalCatBudget = budget.categoryBudgets[category];
            const percentageCatSpent =
              ((totalCatBudget - remaining) / totalCatBudget) * 100;

            return (
              <div key={category} className="mt-2">
                <div className="flex justify-between items-center">
                  <span className="text-sm font-semibold text-white">
                    {category}: $
                    {totalCatBudget - remaining > totalCatBudget
                      ? totalCatBudget
                      : totalCatBudget - remaining}{" "}
                    / ${totalCatBudget} ({percentageCatSpent.toFixed(1)}%)
                  </span>
                  <div className="w-1/3 bg-gray-100 rounded-full h-2 relative ml-2">
                    <div
                      style={{
                        width: `${
                          percentageCatSpent > 100 ? 100 : percentageCatSpent
                        }%`,
                      }}
                      className={`absolute top-0 left-0 h-full rounded-full transition-all ${
                        percentageCatSpent < 50
                          ? "bg-green-400"
                          : percentageCatSpent <= 90
                          ? "bg-yellow-400"
                          : "bg-red-700"
                      }`}
                    />
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {isFutureBudget && (
          <div className="flex gap-2 mt-4">
            <button
              className="btn btn-sm border-[#ffc300] hover:border-[#ffc300] bg-[#001d3d] text-[#ffc300] hover:bg-[#ffc300] hover:text-[#001d3d]"
              onClick={handleEdit}
            >
              Edit
            </button>
            <button
              className="btn btn-sm btn-outline btn-error"
              onClick={handleDelete}
            >
              Delete
            </button>
          </div>
        )}

        {isModalOpen && (
          <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
            <ModalCreateBudget
              closeModal={() => closeModal()}
              initialBudget={budget}
            />
          </div>
        )}
      </div>
    );
  }
}

export default BudgetCard;
