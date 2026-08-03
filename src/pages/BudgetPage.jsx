import React, { useEffect, useState } from "react";
import BudgetCard from "./components/BudgetCard";
import ModalCreateBudget from "./components/ModalCreateBudget";
import { useNavigate } from "react-router-dom";
import AppLayout from "./AppLayout";
import {
  AlertTriangle,
  CalendarDays,
  Lightbulb,
  PlusCircle,
  Target,
} from "lucide-react";
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
  const [loadingPresupuestos, setLoadingPresupuestos] = useState(true);
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
        console.error(err);
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
    setLoadingPresupuestos(true);
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
    } finally {
      setLoadingPresupuestos(false);
    }
  };

  useEffect(() => {
    getPersonalPresupuestos();
  }, []);

  const filtrarPresupuestos = () => {
    const fechaActual = new Date();
    const mesActual = fechaActual.getMonth() + 1; // getMonth() devuelve 0-11, por eso sumamos 1
    const añoActual = fechaActual.getFullYear();
    const formatoMesActual = `${añoActual}-${mesActual
      .toString()
      .padStart(2, "0")}`;
    return presupuestos.filter((presupuesto) => {
      // Extraer solo año-mes del budgetMonth (formato: 2025-07-01T03:00:00.000 -> 2025-07)
      const budgetDate = new Date(presupuesto.budgetMonth);
      const budgetYear = budgetDate.getFullYear();
      const budgetMonth = budgetDate.getMonth() + 1; // getMonth() devuelve 0-11
      const formatoBudgetMonth = `${budgetYear}-${budgetMonth
        .toString()
        .padStart(2, "0")}`;

      if (filtro === "Todos") return true;
      if (filtro === "Pasados") return formatoBudgetMonth < formatoMesActual;
      if (filtro === "Actuales") return formatoBudgetMonth === formatoMesActual;
      if (filtro === "Futuros") return formatoBudgetMonth > formatoMesActual;

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

        <div>
          <div className="flex justify-between items-center mb-4">
            <Button
              variant="outline"
              onClick={() => openModal()}
              className="bg-primary text-black"
            >
              <PlusCircle className="mr-2 h-4 w-4" /> Agregar Presupuesto
            </Button>
          </div>
          {loadingPresupuestos ? (
            <Card className="text-center py-12">
              <CardHeader>
                <Target className="h-16 w-16 text-muted-foreground mx-auto mb-4 animate-pulse" />
                <CardTitle className="font-headline">
                  Cargando presupuestos...
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex justify-center">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                </div>
              </CardContent>
            </Card>
          ) : presupuestos.length === 0 ? (
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
              <div className="flex items-center">
                <h2 className="text-2xl font-semibold font-headline text-accent">
                  Sugerencias de Ahorro
                </h2>
              </div>
            </CardTitle>
            <div className="flex-1 flex justify-end">
              <Button
                variant="outline"
                className="justify-end"
                onClick={() => setShowSuggestions(!showSuggestions)}
              >
                <Lightbulb className="mr-2 h-4 w-4" />
                {showSuggestions
                  ? "Ocultar Sugerencias"
                  : "Mostrar Sugerencias"}
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {showSuggestions && (
                <Card className="bg-secondary/30 border-secondary">
                  <CardContent className="pt-6">
                    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                      {(() => {
                        const suggestions =
                          analyzeSpendingPatterns(transacciones);
                        const totalPages = Math.ceil(
                          suggestions.length / itemsPerPage
                        );
                        const currentSuggestions = suggestions.slice(
                          currentSlide * itemsPerPage,
                          currentSlide * itemsPerPage + itemsPerPage
                        );
                        if (suggestions.length !== 0) {
                          return (
                            <div className="w-full">
                              <div className="flex justify-between items-center">
                                <div className="flex justify-center flex-1 space-x-6">
                                  {currentSuggestions.map(
                                    (suggestion, index) => (
                                      <div
                                        key={index}
                                        className="flex-1 max-w-xs p-6 bg-gray-700 text-center rounded shadow-md"
                                      >
                                        <p className="text-lg font-semibold">
                                          {suggestion.message}
                                        </p>
                                      </div>
                                    )
                                  )}
                                </div>
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
                  </CardContent>
                </Card>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </AppLayout>
  );
}

export default BudgetPage;
