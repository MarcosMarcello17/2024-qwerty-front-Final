import { useState, useEffect, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import MonthlyGraphic from "./components/MonthlyGraphic";
import RecentTransactions from "./components/RecentTransactions";
import DetectedSubscriptions from "@/features/IndexPage/DetectedSubscriptions";
import { getApiTransacciones } from "../functions/getApiTransacciones";
import { formatARS } from "@/lib/format";
import {
  AlertTriangle,
  Filter,
  PlusCircle,
  RotateCw,
  X,
  XCircle,
  ChevronDown,
  ChevronUp,
} from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import PaymentMethodGraphic from "./components/PaymentMethodGraphic";
import AppLayout from "./AppLayout";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import ConfirmationMessage from "@/components/ConfirmationMessage";
import ErrorMessage from "@/components/ErrorMessage";
import IndexSummary from "@/features/IndexPage/IndexSummary";
import AddTransactionModal from "@/components/modals/AddTransactionModal";
import { useQuery } from "@tanstack/react-query";
import { getPersonalCategorias } from "@/functions/getPersonalCategorias";
import { useTransaccionesFilters } from "@/store/useTransaccionesFilters";
import getPersonalTipoGastos from "@/functions/getPersonalTipoGastos";

const months = [
  { value: "00", label: "Todos" },
  { value: "01", label: "Enero" },
  { value: "02", label: "Febrero" },
  { value: "03", label: "Marzo" },
  { value: "04", label: "Abril" },
  { value: "05", label: "Mayo" },
  { value: "06", label: "Junio" },
  { value: "07", label: "Julio" },
  { value: "08", label: "Agosto" },
  { value: "09", label: "Septiembre" },
  { value: "10", label: "Octubre" },
  { value: "11", label: "Noviembre" },
  { value: "12", label: "Diciembre" },
];

// Generado desde el primer año con datos hasta el año en curso: una lista fija
// hace desaparecer el año siguiente del filtro sin aviso.
const FIRST_YEAR = 2021;
const years = [
  { value: "00", label: "Todos los años" },
  ...Array.from(
    { length: Math.max(new Date().getFullYear() - FIRST_YEAR + 1, 1) },
    (_, i) => {
      const year = String(new Date().getFullYear() - i);
      return { value: year, label: year };
    },
  ),
];

const BACK_URL = import.meta.env.VITE_BACK_SERVER_URL;

function IndexPage() {
  const [edit, setEdit] = useState(false);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const navigate = useNavigate();
  const [categoriaSeleccionada, setCategoriaSeleccionada] = useState("Todas");
  const [categoriasConTodas, setCategoriasConTodas] = useState([]);
  const [filtroMes, setFiltroMes] = useState("00");
  const [filtroAno, setFiltroAno] = useState("00");
  const [posibleSub, setPosibleSub] = useState([]);
  const [showSubscriptions, setShowSubscriptions] = useState(false);

  // Tres canales distintos: un fallo de carga no es lo mismo que un fallo de
  // escritura, y ninguno de los dos es lo mismo que "no hay datos".
  const [actionError, setActionError] = useState(null);
  const [statusMessage, setStatusMessage] = useState(null);
  const { filters, setFilters } = useTransaccionesFilters();

  const { data: payCategories = [], error: personalCategoriasError } = useQuery(
    getPersonalCategorias(),
  );

  if (personalCategoriasError) {
    console.log("Fallo la obtencion de categorias: ", personalCategoriasError);
  }

  const {
    data: transaccionesApi = {
      transacciones: [],
      transaccionesSinFiltroCat: [],
    },
    error: transaccionesApiError,
    isLoading: isLoadingFilter,
  } = useQuery(getApiTransacciones(filters));

  if (transaccionesApiError) {
    console.error("Error al obtener transacciones: ", transaccionesApiError);
  }

  const { data: payOptions = [] } = useQuery(getPersonalTipoGastos());

  useEffect(() => {
    if (!statusMessage) return;
    const timer = setTimeout(() => setStatusMessage(null), 4000);
    return () => clearTimeout(timer);
  }, [statusMessage]);

  useEffect(() => {
    setFilters({
      categoria: categoriaSeleccionada,
      mes: filtroMes,
      ano: filtroAno,
    });
  }, [categoriaSeleccionada, filtroMes, filtroAno, setFilters]);

  useEffect(() => {
    if (payCategories.length > 0) {
      setCategoriasConTodas([
        { value: "Todas", label: "Todas las Categorias" },
        ...payCategories,
      ]);
    }
  }, [payCategories]);

  useEffect(() => {
    if (transaccionesApi.transacciones.length > 0) {
      setPosibleSub(
        detectRecurringTransactions(transaccionesApi.transacciones),
      );
    }
  }, [transaccionesApi.transacciones]);

  useEffect(() => {
    const checkIfValidToken = async () => {
      const token = localStorage.getItem("token");
      try {
        const response = await fetch(`${BACK_URL}/api/transacciones/userTest`, {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        });
        if (response.ok) {
          return true;
        } else {
          localStorage.removeItem("token");
          navigate("/");
        }
      } catch (error) {
        console.error("Error al leer el token: ", error);
        localStorage.removeItem("token");
        return false;
      }
    };

    checkIfValidToken();
  }, [navigate]);

  const closeModal = () => {
    setIsModalOpen(false);
    setEdit(false);
  };

  const resetFilters = () => {
    setCategoriaSeleccionada("Todas");
    setFiltroAno("00");
    setFiltroMes("00");
    setFilters(undefined);
  };

  const detectRecurringTransactions = (transacciones) => {
    const today = new Date();
    const threeMonthsAgo = new Date(
      today.getFullYear(),
      today.getMonth() - 2,
      1,
    );

    const monthlyTransactions = transacciones.reduce((acc, transaction) => {
      const transactionDate = new Date(transaction.fecha);
      if (transactionDate >= threeMonthsAgo) {
        const monthKey = `${transactionDate.getUTCFullYear()}-${transactionDate.getUTCMonth()}`;
        if (!acc[transaction.motivo]) {
          acc[transaction.motivo] = {};
        }
        if (!acc[transaction.motivo][monthKey]) {
          acc[transaction.motivo][monthKey] = [];
        }
        acc[transaction.motivo][monthKey].push(transaction);
      }
      return acc;
    }, {});
    return Object.entries(monthlyTransactions)
      .map(([descripcion, months]) => {
        const monthKeys = Object.keys(months).sort();
        const lastThreeMonths = Array.from({ length: 3 }, (_, index) => {
          const date = new Date(
            today.getFullYear(),
            today.getMonth() - index,
            1,
          );
          return `${date.getUTCFullYear()}-${date.getUTCMonth()}`;
        });

        const hasTransactionsInEachMonth = lastThreeMonths.every((monthKey) =>
          monthKeys.includes(monthKey),
        );

        if (hasTransactionsInEachMonth) {
          return {
            descripcion,
            meses: lastThreeMonths,
            transacciones: lastThreeMonths.flatMap(
              (monthKey) => months[monthKey] || [],
            ),
          };
        }
        return null;
      })
      .filter((result) => result !== null);
  };

  // Metricas del conjunto de transacciones actualmente filtrado.
  const summary = useMemo(() => {
    const expenses = transaccionesApi.transacciones.filter(
      (t) => t.categoria !== "Ingreso de Dinero",
    );
    const totalSpent = expenses.reduce((sum, t) => sum + (t.valor || 0), 0);
    const count = expenses.length;

    const categoryTotals = expenses.reduce((acc, t) => {
      acc[t.categoria] = (acc[t.categoria] || 0) + t.valor;
      return acc;
    }, {});
    const sorted = Object.entries(categoryTotals).sort((a, b) => b[1] - a[1]);

    return {
      totalSpent,
      count,
      topCategory: sorted[0]?.[0] || null,
      topCategoryTotal: sorted[0]?.[1] || 0,
    };
  }, [transaccionesApi.transacciones]);

  const periodLabel = useMemo(() => {
    const mesLabel =
      filtroMes === "00"
        ? null
        : months.find((m) => m.value === filtroMes)?.label;
    const anoLabel = filtroAno === "00" ? null : filtroAno;
    if (mesLabel && anoLabel) return `${mesLabel} ${anoLabel}`;
    if (mesLabel) return `${mesLabel}, todos los años`;
    if (anoLabel) return anoLabel;
    return "Todo el período";
  }, [filtroMes, filtroAno]);

  const activeFilters = [];
  if (categoriaSeleccionada !== "Todas") {
    activeFilters.push({
      key: "categoria",
      label: categoriaSeleccionada,
      clear: () => setCategoriaSeleccionada("Todas"),
    });
  }
  if (filtroMes !== "00") {
    activeFilters.push({
      key: "mes",
      label: months.find((m) => m.value === filtroMes)?.label,
      clear: () => setFiltroMes("00"),
    });
  }
  if (filtroAno !== "00") {
    activeFilters.push({
      key: "ano",
      label: filtroAno,
      clear: () => setFiltroAno("00"),
    });
  }
  const hasActiveFilters = activeFilters.length > 0;

  const chartSkeleton = (
    <div className="rounded-xl border border-border bg-card p-6">
      <div className="animate-pulse space-y-4">
        <div className="h-4 w-40 rounded bg-secondary" />
        <div className="h-3 w-52 rounded bg-secondary/60" />
        <div className="h-75 rounded-lg bg-secondary/30" />
      </div>
    </div>
  );

  const handleNewTransaction = (newTransaction) => {
    setFilters({
      categoria: categoriaSeleccionada,
      mes: filtroMes,
      ano: filtroAno,
    });
    setStatusMessage(
      `Transacción registrada: ${newTransaction.motivo} · ${formatARS(newTransaction.valor)}`,
    );
  };

  return (
    <AppLayout>
      <div className="min-h-full min-w-full space-y-6">
        {/* Page header */}
        <div className="flex flex-col items-start justify-between gap-3 sm:flex-row sm:items-center">
          <h1 className="font-headline text-[1.25rem] font-semibold leading-tight">
            Dashboard
          </h1>
          <div className="flex w-full gap-2 sm:w-auto">
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  aria-label={
                    hasActiveFilters
                      ? `Filtrar. ${activeFilters.length} filtros activos: ${activeFilters
                          .map((f) => f.label)
                          .join(", ")}`
                      : "Filtrar transacciones"
                  }
                  className={hasActiveFilters ? "border-primary/50" : ""}
                >
                  <Filter className="mr-2 h-4 w-4" />
                  Filtrar
                  {hasActiveFilters && (
                    <span className="ml-1.5 inline-flex h-5 min-w-5 items-center justify-center rounded-full bg-primary px-1 text-[0.8rem] font-semibold leading-none text-primary-foreground">
                      {activeFilters.length}
                    </span>
                  )}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-80 bg-card" align="end">
                <div className="grid gap-4">
                  <div className="space-y-1">
                    <h4 className="font-headline text-sm font-medium leading-none">
                      Filtros
                    </h4>
                    <p className="text-xs text-muted-foreground">
                      Filtra las transacciones por categoría y fecha.
                    </p>
                  </div>
                  <div className="grid gap-2">
                    <Select
                      value={categoriaSeleccionada}
                      onValueChange={setCategoriaSeleccionada}
                    >
                      <SelectTrigger aria-label="Categoría">
                        <SelectValue placeholder="Seleccionar categoría" />
                      </SelectTrigger>
                      <SelectContent>
                        {categoriasConTodas.map((cat) => (
                          <SelectItem key={cat.value} value={cat.value}>
                            {cat.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <Select value={filtroMes} onValueChange={setFiltroMes}>
                      <SelectTrigger aria-label="Mes">
                        <SelectValue placeholder="Seleccionar mes" />
                      </SelectTrigger>
                      <SelectContent>
                        {months.map((month) => (
                          <SelectItem key={month.value} value={month.value}>
                            {month.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <Select value={filtroAno} onValueChange={setFiltroAno}>
                      <SelectTrigger aria-label="Año">
                        <SelectValue placeholder="Seleccionar año" />
                      </SelectTrigger>
                      <SelectContent>
                        {years.map((year) => (
                          <SelectItem key={year.value} value={year.value}>
                            {year.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  {hasActiveFilters && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={resetFilters}
                      className="text-muted-foreground hover:text-foreground"
                    >
                      <XCircle className="mr-2 h-3.5 w-3.5" /> Limpiar filtros
                    </Button>
                  )}
                </div>
              </PopoverContent>
            </Popover>
            <Button
              onClick={() => setIsModalOpen(true)}
              className="w-full sm:w-auto"
            >
              <PlusCircle className="mr-1.5 h-4 w-4" /> Agregar transacción
            </Button>
          </div>
        </div>

        {/* Filtros activos, en palabras */}
        {hasActiveFilters && (
          <div className="flex flex-wrap items-center gap-2">
            {activeFilters.map((filter) => (
              <button
                key={filter.key}
                type="button"
                onClick={filter.clear}
                aria-label={`Quitar filtro ${filter.label}`}
                className="inline-flex items-center gap-1.5 rounded-lg border border-border bg-secondary/40 py-1 pl-2.5 pr-1.5 text-[0.8rem] font-medium transition-colors hover:border-primary/50 hover:bg-secondary"
              >
                {filter.label}
                <X className="h-3.5 w-3.5 text-muted-foreground" />
              </button>
            ))}
            <button
              type="button"
              onClick={resetFilters}
              className="text-[0.8rem] text-muted-foreground underline-offset-4 transition-colors hover:text-foreground hover:underline"
            >
              Limpiar todo
            </button>
          </div>
        )}

        <ConfirmationMessage statusMessage={statusMessage} />
        <ErrorMessage
          actionError={actionError}
          onDismiss={() => setActionError(null)}
        />

        {/* Summary strip */}
        {!isLoadingFilter &&
          !transaccionesApiError &&
          transaccionesApi.transacciones.length > 0 && (
            <IndexSummary periodLabel={periodLabel} summary={summary} />
          )}

        {/* Subscriptions - collapsible */}
        <div>
          <button
            type="button"
            onClick={() => setShowSubscriptions((prev) => !prev)}
            aria-expanded={showSubscriptions}
            aria-controls="panel-suscripciones"
            className="flex items-center gap-1.5 text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
          >
            {showSubscriptions ? (
              <ChevronUp className="h-4 w-4" />
            ) : (
              <ChevronDown className="h-4 w-4" />
            )}
            Suscripciones y recurrentes
          </button>
          {showSubscriptions && (
            <DetectedSubscriptions subs={posibleSub || []} />
          )}
        </div>

        {/* Contenido principal: cargando / error de carga / datos / vacío */}
        {isLoadingFilter ? (
          <div
            role="status"
            aria-live="polite"
            aria-label="Cargando transacciones"
            className="grid gap-6 md:grid-cols-2"
          >
            <div className="space-y-6">
              {chartSkeleton}
              {chartSkeleton}
            </div>
            {chartSkeleton}
          </div>
        ) : transaccionesApiError ? (
          <div
            role="alert"
            className="flex flex-col items-center justify-center rounded-xl border border-border bg-card px-6 py-16 text-center"
          >
            <AlertTriangle className="mb-3 h-6 w-6 text-destructive" />
            <p className="mb-1 font-medium">{transaccionesApiError}</p>
            <p className="mb-6 text-sm text-muted-foreground">
              Hubo un error en la carga de transacciones. Intente nuevamente
            </p>
            <Button
              variant="outline"
              onClick={() => {
                setFilters({
                  categoria: categoriaSeleccionada,
                  mes: filtroMes,
                  ano: filtroAno,
                });
              }}
            >
              <RotateCw className="mr-1.5 h-4 w-4" /> Reintentar
            </Button>
          </div>
        ) : transaccionesApi.transacciones.length > 0 ? (
          <div className="space-y-6">
            <div className="grid w-full gap-6 md:grid-cols-2">
              <MonthlyGraphic
                type="categorias"
                transacciones={transaccionesApi.transacciones}
                payCategories={payCategories}
                filtroMes={filtroMes}
                filtroAno={filtroAno}
                filtroCategoria={categoriaSeleccionada}
                transaccionesSinFiltroCat={
                  transaccionesApi.transaccionesSinFiltroCat
                }
              />
              <PaymentMethodGraphic
                type="tipoGasto"
                transacciones={transaccionesApi.transacciones}
                payCategories={payOptions}
                filtroMes={filtroMes}
                filtroAno={filtroAno}
                filtroCategoria={categoriaSeleccionada}
              />
            </div>
            <RecentTransactions
              transacciones={transaccionesApi.transacciones}
            />
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center py-16 text-center">
            <p className="mb-1 text-muted-foreground">
              No hay transacciones en {periodLabel.toLowerCase()}.
            </p>
            <p className="mb-6 text-sm text-muted-foreground/70">
              {hasActiveFilters
                ? "Prueba ajustando los filtros o registra una nueva transacción."
                : "Registra tu primera transacción para ver tus gastos."}
            </p>
            <Button onClick={() => setIsModalOpen(true)}>
              <PlusCircle className="mr-1.5 h-4 w-4" /> Agregar transacción
            </Button>
          </div>
        )}
      </div>

      <AddTransactionModal
        edit={edit}
        isModalOpen={isModalOpen}
        closeModal={closeModal}
        payOptions={payOptions}
        payCategories={payCategories}
        onNewTransaction={(data) => handleNewTransaction(data)}
      />
    </AppLayout>
  );
}

export default IndexPage;
