import React, { useEffect, useState } from "react";
import BudgetCard from "./components/BudgetCard";
import ModalCreateBudget from "./components/ModalCreateBudget";
import { useNavigate } from "react-router-dom";
import AppLayout from "./AppLayout";
import { AlertTriangle, CalendarDays, PlusCircle, Target } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

function BudgetPage() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [presupuestos, setPresupuestos] = useState([]);
  const [transacciones, setTransacciones] = useState([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const [filtro, setFiltro] = useState("Todos");
  const [currentSlide, setCurrentSlide] = useState(0);

  const itemsPerPage = 3; // Número de elementos por página

  const onEdit = () => {
    setPresupuestos([]);
    getPersonalPresupuestos();
  };

  useEffect(() => {
    const token = localStorage.getItem("token");
    fetch(
      "https://two024-qwerty-back-final-marcello.onrender.com/api/transacciones/user",
      {
        method: "GET",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    )
      .then((response) => response.json())
      .then((data) => {
        setTransacciones(data);
      })
      .catch((err) => {
        console.log(err);
      })
      .finally(() => {
        setLoading(false);
      });
  }, []);

  const analyzeSpendingPatterns = (transacciones) => {
    const currentMonth = new Date().getMonth();
    const currentYear = new Date().getFullYear();

    const previousMonth = currentMonth === 0 ? 11 : currentMonth - 1; // Manejar cambio de año
    const previousYear = currentMonth === 0 ? currentYear - 1 : currentYear;

    const currentMonthTransactions = transacciones.filter((transaction) => {
      const transDate = new Date(transaction.fecha);
      return (
        transDate.getMonth() === currentMonth &&
        transDate.getFullYear() === currentYear
      );
    });

    const previousMonthTransactions = transacciones.filter((transaction) => {
      const transDate = new Date(transaction.fecha);
      return (
        transDate.getMonth() === previousMonth &&
        transDate.getFullYear() === previousYear
      );
    });

    const currentMonthByCategory = currentMonthTransactions.reduce(
      (acc, trans) => {
        acc[trans.categoria] = (acc[trans.categoria] || 0) + trans.valor;
        return acc;
      },
      {}
    );

    const previousMonthByCategory = previousMonthTransactions.reduce(
      (acc, trans) => {
        acc[trans.categoria] = (acc[trans.categoria] || 0) + trans.valor;
        return acc;
      },
      {}
    );

    const suggestions = [];
    for (const category in currentMonthByCategory) {
      const currentAmount = currentMonthByCategory[category];
      const previousAmount = previousMonthByCategory[category] || 0;

      const difference =
        previousAmount === 0
          ? 100
          : ((currentAmount - previousAmount) / previousAmount) * 100;

      if (difference > 20) {
        suggestions.push({
          category,
          message: `Has aumentado tu gasto en ${category} un ${difference.toFixed(
            1
          )}% respecto al mes anterior`,
        });
      }
    }
    return suggestions;
  };

  const handleNextSlide = (totalPages) => {
    setCurrentSlide((prevSlide) => (prevSlide + 1) % totalPages);
  };

  const handlePrevSlide = (totalPages) => {
    setCurrentSlide((prevSlide) =>
      prevSlide === 0 ? totalPages - 1 : prevSlide - 1
    );
  };

  const handleDelete = async (budget) => {
    const token = localStorage.getItem("token");
    try {
      const response = await fetch(
        `https://two024-qwerty-back-final-marcello.onrender.com/api/presupuesto/${budget.id}`,
        {
          method: "DELETE",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (response.ok) {
        setPresupuestos(presupuestos.filter((t) => t.id !== budget.id));
      } else {
        console.error("Error al eliminar el presupuesto");
      }
    } catch (err) {
      console.error("Ocurrió un error. Intenta nuevamente: ", err);
    } finally {
      setPresupuestos([]);
      getPersonalPresupuestos();
    }
  };

  const openModal = () => setIsModalOpen(true);
  const closeModal = () => {
    setIsModalOpen(false);
    getPersonalPresupuestos();
  };

  const getPersonalPresupuestos = async () => {
    const token = localStorage.getItem("token");
    try {
      const response = await fetch(
        "https://two024-qwerty-back-final-marcello.onrender.com/api/presupuesto",
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (response.ok) {
        const data = await response.json();
        setPresupuestos(data);
      }
    } catch (error) {
      console.error("Error al obtener las categorías personalizadas:", error);
    }
  };

  useEffect(() => {
    getPersonalPresupuestos();
  }, []);

  const filtrarPresupuestos = () => {
    const fechaActual = new Date();
    const mesActual = fechaActual.getMonth() + 1;
    const añoActual = fechaActual.getFullYear();
    const formatoMesActual = `${añoActual}-${mesActual
      .toString()
      .padStart(2, "0")}`;

    return presupuestos.filter((presupuesto) => {
      const budgetMonth = presupuesto.budgetMonth;

      if (filtro === "Todos") return true;
      if (filtro === "Pasados") return budgetMonth < formatoMesActual;
      if (filtro === "Actuales") return budgetMonth === formatoMesActual;
      if (filtro === "Futuros") return budgetMonth > formatoMesActual;

      return true;
    });
  };

  return (
    <AppLayout>
      <div className="space-y-8">
        <div className="flex flex-col sm:flex-row justify-between items-center space-y-4 sm:space-y-0">
          <div className="flex items-center space-x-2">
            <Target className="h-8 w-8 text-primary" />
            <h1 className="text-3xl font-bold font-headline text-white">
              Presupuestos
            </h1>
          </div>
          <div className="flex items-center space-x-2">
            <Select value={filtro} onValueChange={setFiltro}>
              <SelectTrigger className="w-[200px] bg-card hover:bg-background">
                <CalendarDays className="mr-2 h-4 w-4 text-muted-foreground" />
                <SelectValue placeholder="Mostrar Todos" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem key="Todos" value="Todos">
                  Mostrar Todos
                </SelectItem>
                <SelectItem key="Pasados" value="Pasados">
                  Pasados
                </SelectItem>
                <SelectItem key="Actuales" value="Actuales">
                  Actuales
                </SelectItem>
                <SelectItem key="Futuros" value="Futuros">
                  Futuros
                </SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        {isModalOpen && (
          <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
            <ModalCreateBudget closeModal={closeModal} />
          </div>
        )}

        {/* Category Budgets Section */}
        <div>
          <div className="flex justify-between items-center mb-4">
            <Button variant="outline" onClick={() => openModal()}>
              <PlusCircle className="mr-2 h-4 w-4" /> Agregar Presupuesto
            </Button>
          </div>
          {presupuestos.length === 0 ? (
            <Card className="text-center py-12">
              <CardHeader>
                <Target className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
                <CardTitle className="font-headline">
                  No hay presupuestos
                </CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription>
                  Cuando crees un prespuesto se va a mostrar aca
                </CardDescription>
              </CardContent>
            </Card>
          ) : (
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {filtrarPresupuestos().map((budget) => (
                <BudgetCard
                  key={budget.id}
                  budget={budget}
                  transacciones={transacciones}
                  onDelete={handleDelete}
                  onEdit={onEdit}
                />
              ))}
            </div>
          )}
        </div>
        <Card className="mt-8 bg-secondary/50 border-secondary">
          <CardHeader className="flex flex-row items-center gap-3">
            <AlertTriangle className="h-6 w-6 text-accent" />
            <CardTitle className="font-headline text-accent">
              Sugerencia de Ahorro
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col items-center justify-center my-5">
              <button
                className="btn bg-[#ffd60a] border-[#ffd60a] hover:bg-[#ffc300] hover:border-[#ffc300] text-black w-64 h-10"
                onClick={() => setShowSuggestions(!showSuggestions)}
              >
                Mostrar sugerencias de Ahorro
              </button>
            </div>

            {showSuggestions && (
              <div className="carousel w-full">
                <div className="carousel-item relative w-full">
                  {(() => {
                    const suggestions = analyzeSpendingPatterns(transacciones);
                    const totalPages = Math.ceil(
                      suggestions.length / itemsPerPage
                    );

                    // Obtener elementos de la página actual
                    const currentSuggestions = suggestions.slice(
                      currentSlide * itemsPerPage,
                      currentSlide * itemsPerPage + itemsPerPage
                    );
                    if (suggestions.length !== 0) {
                      return (
                        <div className="w-full">
                          <div className="flex justify-between items-center">
                            {/* Flecha Izquierda */}
                            <button
                              className="btn btn-circle bg-yellow-400 text-black"
                              onClick={() => handlePrevSlide(totalPages)}
                            >
                              ❮
                            </button>

                            {/* Contenedor de Sugerencias */}
                            <div className="flex justify-center flex-1 space-x-6">
                              {currentSuggestions.map((suggestion, index) => (
                                <div
                                  key={index}
                                  className="flex-1 max-w-xs p-6 bg-gray-700 text-center rounded shadow-md"
                                >
                                  <p className="text-lg font-semibold">
                                    {suggestion.message}
                                  </p>
                                </div>
                              ))}
                            </div>

                            {/* Flecha Derecha */}
                            <button
                              className="btn btn-circle bg-yellow-400 text-black"
                              onClick={() => handleNextSlide(totalPages)}
                            >
                              ❯
                            </button>
                          </div>
                        </div>
                      );
                    } else {
                      return (
                        <div className="w-full">
                          <div className="flex justify-between items-center text-center">
                            No hay sugerencias disponibles
                          </div>
                        </div>
                      );
                    }
                  })()}
                </div>
              </div>
            )}
            <CardDescription className="text-secondary-foreground">
              Future budgets can be edited to plan ahead. Current and past month
              budgets are locked to maintain historical accuracy. Review your
              spending regularly and adjust future budgets as needed to meet
              your financial goals!
            </CardDescription>
          </CardContent>
        </Card>
      </div>
    </AppLayout>
  );
}

export default BudgetPage;
