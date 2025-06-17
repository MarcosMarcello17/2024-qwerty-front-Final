import React, { useEffect, useState } from "react";
import BudgetCard from "./components/BudgetCard";
import ModalCreateBudget from "./components/ModalCreateBudget";
import { useNavigate } from "react-router-dom";

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
    <div className="min-h-screen bg-[#000814] text-white">
      <div className="container mx-auto p-4">
        <div className="flex flex-col sm:flex-row justify-between items-center mb-6">
          <button
            className="btn bg-[#ffd60a] border-[#ffd60a] hover:bg-[#ffc300] hover:border-[#ffc300] text-black mb-4 mr-2 sm:mb-0 sm:order-1"
            onClick={() => navigate("/")}
          >
            HomePage
          </button>
          <div className="text-2xl font-semibold justify-start sm:flex-1">
            Presupuestos Mensuales
          </div>
          <div className="mt-4 sm:mt-0 sm:order-2">
            <select
              className="select select-bordered w-full max-w-xs bg-[#ffd60a] border-[#ffd60a] hover:bg-[#ffd60a] hover:border-[#ffd60a] text-black"
              value={filtro}
              onChange={(e) => setFiltro(e.target.value)}
            >
              <option value="Todos">Mostrar Todos</option>
              <option value="Pasados">Pasados</option>
              <option value="Actuales">Actuales</option>
              <option value="Futuros">Futuros</option>
            </select>
          </div>
        </div>

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
                const totalPages = Math.ceil(suggestions.length / itemsPerPage);

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

        {loading ? (
          <div className="text-center mt-5">
            <span className="loading loading-spinner loading-lg"></span>{" "}
            Cargando presupuestos...
          </div>
        ) : presupuestos.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-64">
            <button
              className="btn bg-[#ffd60a] border-[#ffd60a] hover:bg-[#ffc300] hover:border-[#ffc300] text-black text-xl w-64 h-10"
              onClick={openModal}
            >
              Agregar Presupuesto
            </button>
            <p className="text-lg mt-4 text-red-600 font-bold">
              No tienes presupuestos aún.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-6 mt-5">
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

        <div className="fixed bottom-6 right-6">
          <button
            className="btn bg-[#ffd60a] border-[#ffd60a] hover:bg-[#ffc300] hover:border-[#ffc300] text-black"
            onClick={openModal}
          >
            Agregar Presupuesto
          </button>
        </div>
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
          <ModalCreateBudget closeModal={closeModal} />
        </div>
      )}
    </div>
  );
}

export default BudgetPage;
