import React, { useEffect, useState } from "react";
import ModalCreateBudget from "./ModalCreateBudget"; // Importa tu modal
import { cn } from "@/lib/utils";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { AlertTriangle, Edit3 } from "lucide-react";
import { Progress } from "@/components/ui/progress";

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
      <Card
        className={cn(
          "shadow-lg hover:shadow-xl transition-shadow duration-300",
          porcentaje > 100 && "border-destructive ring-2 ring-destructive/50"
        )}
      >
        <CardHeader>
          <div className="flex justify-between items-start">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <img src={icon} alt={budget.nameBudget} className="w-5 h-5" />
                <CardTitle className="font-headline text-lg">
                  {budget.nameBudget}
                </CardTitle>
              </div>
              <CardDescription>
                <div>{categoryString}</div>
                <div>{`${dateFrom} a ${dateTo}`}</div>
              </CardDescription>
            </div>
            {isFutureBudget && (
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8"
                onClick={() => handleEdit()}
              >
                <Edit3 className="h-4 w-4" />
                <span className="sr-only">Editar Presupuesto</span>
              </Button>
            )}
          </div>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="flex justify-between items-baseline">
            <span className="text-2xl font-bold">
              ${totalGastado.toFixed(2)}
            </span>
            <span className="text-sm text-muted-foreground">
              / ${budget.totalBudget.toFixed(2)}
            </span>
          </div>
          <Progress
            value={porcentaje}
            aria-label={`${categoryString} budget progress`}
            className={cn(porcentaje > 100 && "[&>div]:bg-destructive")}
          />
          {porcentaje > 100 && (
            <div className="flex items-center text-xs text-destructive">
              <AlertTriangle className="mr-1 h-3 w-3" />
              Presupuesto excedido en $
              {Math.abs(totalGastado - budget.totalBudget).toFixed(2)}
            </div>
          )}
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
                  <Progress
                    value={percentageCatSpent > 100 ? 100 : percentageCatSpent}
                    aria-label={`${percentageCatSpent} budget progress`}
                    className={cn(
                      percentageCatSpent > 100 && "[&>div]:bg-destructive"
                    )}
                  />
                </div>
              </div>
            );
          })}
        </CardContent>
        <CardFooter>
          <p
            className={cn(
              "text-sm",
              porcentaje > 100 ? "text-destructive" : "text-muted-foreground"
            )}
          >
            {porcentaje > 100
              ? `You are $${Math.abs(totalGastado - budget.totalBudget).toFixed(
                  2
                )} over budget.`
              : `$${(budget.totalBudget - totalGastado).toFixed(2)} remaining.`}
          </p>
        </CardFooter>
        {isModalOpen && (
          <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
            <ModalCreateBudget
              closeModal={() => closeModal()}
              initialBudget={budget}
            />
          </div>
        )}
      </Card>
    );
  }
}

export default BudgetCard;
