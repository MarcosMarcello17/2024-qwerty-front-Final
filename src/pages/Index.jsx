import { useState, useEffect, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import ModalForm from "../components/modals/AddTransactionModal";
import MonthlyGraphic from "./components/MonthlyGraphic";
import AchievementNotification from "./components/AchievementNotification";
import RecentTransactions from "./components/RecentTransactions";
import DetectedSubscriptions from "@/features/IndexPage/DetectedSubscriptions";
import { getApiTransacciones } from "../functions/getApiTransacciones";
import { createCatAPI } from "../functions/createCatAPI";
import { createPaymentMethodAPI } from "../functions/createPaymentMethodAPI";
import { deletePendingTransaction } from "../functions/deletePendingTransaction";
import { processRecurringTransactions } from "../functions/processRecurringTransactions";
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
import AlertPending from "./components/AlertPending";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import ConfirmationMessage from "@/components/ConfirmationMessage";
import ErrorMessage from "@/components/ErrorMessage";
import IndexSummary from "@/features/IndexPage/IndexSummary";

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

const MEDIOS_PAGO_DEFAULT = [
  { value: "Tarjeta de credito", label: "Tarjeta de credito" },
  { value: "Tarjeta de Debito", label: "Tarjeta de debito" },
  { value: "Efectivo", label: "Efectivo" },
];

const BACK_URL = import.meta.env.VITE_BACK_SERVER_URL;

function IndexPage() {
  const [transacciones, setTransacciones] = useState([]);
  const [showNotification, setShowNotification] = useState(false);
  const [edit, setEdit] = useState(false);
  const [tranPendiente, setTranPendiente] = useState({});

  const [payCategories, setPayCategories] = useState([]);
  const [transaccionesCargadas, setTransaccionesCargadas] = useState(false);
  const [achievementData, setAchievementData] = useState(0);
  const [payOptions, setPayOptions] = useState(MEDIOS_PAGO_DEFAULT);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [transaccionId, setTransaccionId] = useState(null);
  const navigate = useNavigate();
  const [categoriaSeleccionada, setCategoriaSeleccionada] = useState("Todas");
  const [categoriasConTodas, setCategoriasConTodas] = useState([]);
  const [isLoadingFilter, setIsLoadingFilter] = useState(true);
  const [pendTran, setPendTran] = useState(false);
  const [filtroMes, setFiltroMes] = useState("00");
  const [filtroAno, setFiltroAno] = useState("00");
  const [posibleSub, setPosibleSub] = useState([]);
  const [transaccionesSinFiltroCat, setTransaccionesSinFiltroCat] = useState(
    [],
  );
  const [showSubscriptions, setShowSubscriptions] = useState(false);

  // Tres canales distintos: un fallo de carga no es lo mismo que un fallo de
  // escritura, y ninguno de los dos es lo mismo que "no hay datos".
  const [actionError, setActionError] = useState(null);
  const [loadError, setLoadError] = useState(null);
  const [statusMessage, setStatusMessage] = useState(null);

  useEffect(() => {
    if (!statusMessage) return;
    const timer = setTimeout(() => setStatusMessage(null), 4000);
    return () => clearTimeout(timer);
  }, [statusMessage]);

  useEffect(() => {
    setIsLoadingFilter(true);
    getTransacciones(categoriaSeleccionada);
  }, [categoriaSeleccionada, filtroMes, filtroAno]);

  useEffect(() => {
    if (payCategories.length > 0) {
      setCategoriasConTodas([
        { value: "Todas", label: "Todas las Categorias" },
        ...payCategories,
      ]);
    }
  }, [payCategories]);

  useEffect(() => {
    fetchPersonalTipoGastos();
    processRecurringOnLoad();
  }, []);

  useEffect(() => {
    if (transacciones.length > 0) {
      setPosibleSub(detectRecurringTransactions(transacciones));
    }
  }, [transacciones]);

  const processRecurringOnLoad = async () => {
    try {
      const createdTransactions = await processRecurringTransactions();
      if (createdTransactions.length > 0) {
        const apiTransacciones = await getApiTransacciones();
        if (apiTransacciones && apiTransacciones.transacciones) {
          setTransacciones(apiTransacciones.transacciones);
          setTransaccionesSinFiltroCat(
            apiTransacciones.transacciones.filter(
              (transaccion) => transaccion.categoria !== "Ingreso de Dinero",
            ),
          );
        }
      }
    } catch (error) {
      console.error("Error al procesar transacciones recurrentes:", error);
    }
  };

  const showTransactionsPendientes = async () => {
    const token = localStorage.getItem("token");
    try {
      const response = await fetch(
        `${BACK_URL}/api/transaccionesPendientes/user`,
        {
          method: "GET",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        },
      );

      if (!response.ok) {
        throw new Error(`Error: ${response.status}`);
      }

      let data = await response.json();
      data = data.filter(
        (tran) => tran.id_reserva !== "Pago" && tran.id_reserva !== "Cobro",
      );
      if (data[0] !== null && data[0] !== undefined) {
        setTranPendiente(data[0]);
        setPendTran(true);
      }
    } catch (err) {
      console.error("Error fetching transactions:", err);
    }
  };

  const fetchPersonalTipoGastos = async () => {
    const token = localStorage.getItem("token");
    try {
      const response = await fetch(`${BACK_URL}/api/personal-tipo-gasto`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (response.ok) {
        const data = await response.json();
        const customOptions = data.map((tipo) => ({
          label: tipo.nombre,
          value: tipo.nombre,
        }));
        setPayOptions([...MEDIOS_PAGO_DEFAULT, ...customOptions]);
      }
    } catch (error) {
      console.error(
        "Error al obtener los tipos de gasto personalizados:",
        error,
      );
    }
  };

  const checkIfValidToken = async (token) => {
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
        return false;
      }
    } catch (error) {
      localStorage.removeItem("token");
      return false;
    }
  };

  const getTransacciones = async (filtrado = "Todas") => {
    const token = localStorage.getItem("token");
    setTransaccionesCargadas(false);
    if (await checkIfValidToken(token)) {
      try {
        const apiTransacciones = await getApiTransacciones(
          filtrado,
          filtroMes,
          filtroAno,
        );
        setTransacciones(apiTransacciones.transacciones);
        setTransaccionesSinFiltroCat(
          apiTransacciones.transaccionesSinFiltroCat,
        );
        setLoadError(null);
      } catch (err) {
        console.error("Error fetching transactions:", err);
        // Sin esto la pantalla diria "no hay transacciones" cuando en realidad
        // no las pudo traer, que es exactamente el mensaje opuesto.
        setLoadError(
          "No pudimos cargar tus transacciones. Esto no significa que no existan.",
        );
      } finally {
        setIsLoadingFilter(false);
        setTransaccionesCargadas(true);
      }
      fetchPersonalCategorias();
      showTransactionsPendientes();
    } else {
      navigate("/");
    }
  };

  const fetchPersonalCategorias = async () => {
    const token = localStorage.getItem("token");
    try {
      const response = await fetch(`${BACK_URL}/api/personal-categoria`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (response.ok) {
        const data = await response.json();
        const customOptions = data.map((cat) => ({
          label: cat.nombre,
          value: cat.nombre,
          iconPath: cat.iconPath,
        }));

        setPayCategories([
          {
            value: "Otros",
            label: "Otros",
            iconPath: "fa-solid fa-circle-dot",
          },
          {
            value: "Gasto Grupal",
            label: "Gasto Grupal",
            iconPath: "fa-solid fa-people-group",
          },
          ...customOptions,
        ]);
      }
    } catch (error) {
      console.error("Error al obtener las categorias personalizadas:", error);
    }
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setEdit(false);
  };

  const resetFilters = () => {
    setCategoriaSeleccionada("Todas");
    setFiltroAno("00");
    setFiltroMes("00");
  };

  const agregarTransaccionRecurrente = async (bodyTrans) => {
    try {
      const token = localStorage.getItem("token");
      const body = {
        motivo: bodyTrans.motivo,
        categoria: bodyTrans.categoria,
        tipoGasto: bodyTrans.tipoGasto,
        valor: bodyTrans.valor,
        frecuencia: "mensual",
      };
      const response = await fetch(`${BACK_URL}/api/recurrents`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(body),
      });
      if (!response.ok) {
        setActionError(
          "La transacción se guardó, pero no pudimos marcarla como recurrente.",
        );
      }
    } catch (err) {
      setActionError(
        "La transacción se guardó, pero no pudimos marcarla como recurrente.",
      );
    }
  };

  const checkTransaccionAchievment = async () => {
    const token = localStorage.getItem("token");
    try {
      const response = await fetch(`${BACK_URL}/api/users/userTransaction`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      });
      const data = await response.json();
      if (data === 1 || data === 5 || data === 10) {
        setAchievementData(data);
        setShowNotification(true);
      }
    } catch (error) {
      console.error("Error checking achievements:", error);
    }
  };

  const handleMotivoChange = (e) => {
    setMotivo(e.target.value);
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

  const aceptarTransaccion = async (transaccion, categoria, tipoGasto) => {
    const token = localStorage.getItem("token");
    setActionError(null);
    setTransaccionesCargadas(false);
    let url = `${BACK_URL}/api/transacciones`;
    if (transaccion.id_reserva === "Cobro") {
      url += "/crearPago/" + transaccion.sentByEmail;
      const motivo = transaccion.motivo;
      const valor = transaccion.valor;
      const fecha = transaccion.fecha;
      try {
        const response = await fetch(url, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ motivo, valor, fecha, categoria, tipoGasto }),
        });
        if (response.ok) {
          const data = await response.json();
          const updatedTransacciones = [...transacciones, data];
          updatedTransacciones.sort(
            (a, b) => new Date(b.fecha) - new Date(a.fecha),
          );
          setTransacciones(updatedTransacciones);
          setStatusMessage("Cobro registrado.");
        } else {
          console.error(
            "Error al crear pago:",
            response.status,
            response.statusText,
          );
          setActionError("No pudimos registrar el cobro. Volvé a intentar.");
        }
      } catch (err) {
        console.error("Error en la solicitud de cobro:", err);
        setActionError(
          "No hay conexión con el servidor. El cobro no se registró.",
        );
      } finally {
        setTransaccionesCargadas(true);
      }
    } else if (transaccion.id_reserva === "Pago") {
      setStatusMessage("Pago aprobado.");
      setTransaccionesCargadas(true);
    } else if (transaccion.id_reserva === "Grupo") {
      url = `${BACK_URL}/api/grupos/agregar-usuario`;
      const grupoId = transaccion.grupoId;
      try {
        const response = await fetch(url, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ grupo_id: grupoId }),
        });
        if (response.ok) {
          setStatusMessage("Te sumaste al grupo.");
        } else {
          console.error(
            "Error al agregar usuario al grupo:",
            response.status,
            response.statusText,
          );
          setActionError("No pudimos sumarte al grupo. Volvé a intentar.");
        }
      } catch (err) {
        console.error(
          "Error en la solicitud de agregar usuario al grupo:",
          err,
        );
        setActionError(
          "No hay conexión con el servidor. No te sumamos al grupo.",
        );
      } finally {
        setTransaccionesCargadas(true);
      }
    } else {
      const method = "POST";
      let motivo = transaccion.motivo;
      let valor = transaccion.valor;
      let fecha = transaccion.fecha;
      let categoriaTransaccion = categoria || "Clase";
      try {
        const response = await fetch(url, {
          method: method,
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            motivo,
            valor,
            fecha,
            categoria: categoriaTransaccion,
          }),
        });

        if (response.ok) {
          const data = await response.json();
          const updatedTransacciones = [...transacciones, data];
          updatedTransacciones.sort(
            (a, b) => new Date(b.fecha) - new Date(a.fecha),
          );
          setTransacciones(updatedTransacciones);
          setStatusMessage("Transacción aceptada.");
        } else {
          console.error(
            "Error al crear transaccion:",
            response.status,
            response.statusText,
          );
          setActionError(
            "No pudimos aceptar la transacción. Volvé a intentar.",
          );
        }
      } catch (err) {
        console.error("Error en la solicitud de transaccion:", err);
        setActionError(
          "No hay conexión con el servidor. La transacción no se aceptó.",
        );
      } finally {
        setTransaccionesCargadas(true);
      }
    }
  };

  const isAccepted = async (transaction, categoria, tipoGasto) => {
    await aceptarTransaccion(transaction, categoria, tipoGasto);
    eliminarTransaccionPendiente(transaction.id);
    if (
      transaction.id_reserva !== "Cobro" &&
      transaction.id_reserva !== "Pago"
    ) {
      enviarRespuesta("aceptada", transaction.id_reserva);
    }
    setPendTran(false);
  };

  const isRejected = (transaction) => {
    eliminarTransaccionPendiente(transaction.id);
    if (
      transaction.id_reserva !== "Cobro" &&
      transaction.id_reserva !== "Pago"
    ) {
      enviarRespuesta("rechazada", transaction.id_reserva);
    }
    setPendTran(false);
  };

  const enviarRespuesta = async (resp, id_reserva) => {
    const token = localStorage.getItem("token");
    setTransaccionesCargadas(false);
    const url = `${BACK_URL}/api/transaccionesPendientes/${resp}?id_reserva=${id_reserva}`;
    try {
      const response = await fetch(url, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        console.error(
          "Error al enviar respuesta:",
          response.status,
          response.statusText,
        );
        setActionError(
          "Registramos tu decisión localmente, pero no pudimos avisarle a la otra persona.",
        );
      }
    } catch (err) {
      console.error("Error en la solicitud de respuesta:", err);
      setActionError(
        "Registramos tu decisión localmente, pero no pudimos avisarle a la otra persona.",
      );
    } finally {
      setTransaccionesCargadas(true);
    }
  };

  const eliminarTransaccionPendiente = async (id) => {
    const tranEliminada = await deletePendingTransaction(id);
    if (tranEliminada) {
      showTransactionsPendientes();
    } else {
      setActionError("No pudimos cerrar la solicitud pendiente.");
    }
  };

  // Metricas del conjunto de transacciones actualmente filtrado.
  const summary = useMemo(() => {
    const expenses = transacciones.filter(
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
  }, [transacciones]);

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
    const updatedTransacciones = [...transacciones, newTransaction];
    updatedTransacciones.sort((a, b) => new Date(b.fecha) - new Date(a.fecha));
    setTransacciones(updatedTransacciones);
    setTransaccionesCargadas(true);
    if (!edit) {
      checkTransaccionAchievment();
    }
    console.log(newTransaction);
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
        {transaccionesCargadas && !loadError && transacciones.length > 0 && (
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
        ) : loadError ? (
          <div
            role="alert"
            className="flex flex-col items-center justify-center rounded-xl border border-border bg-card px-6 py-16 text-center"
          >
            <AlertTriangle className="mb-3 h-6 w-6 text-destructive" />
            <p className="mb-1 font-medium">{loadError}</p>
            <p className="mb-6 text-sm text-muted-foreground">
              Hubo un error en la carga de transacciones. Intente nuevamente
            </p>
            <Button
              variant="outline"
              onClick={() => {
                setIsLoadingFilter(true);
                getTransacciones(categoriaSeleccionada);
              }}
            >
              <RotateCw className="mr-1.5 h-4 w-4" /> Reintentar
            </Button>
          </div>
        ) : transacciones.length > 0 ? (
          <div className="space-y-6">
            <div className="grid w-full gap-6 md:grid-cols-2">
              <MonthlyGraphic
                type="categorias"
                transacciones={transacciones}
                payCategories={payCategories}
                filtroMes={filtroMes}
                filtroAno={filtroAno}
                filtroCategoria={categoriaSeleccionada}
                transaccionesSinFiltroCat={transaccionesSinFiltroCat}
              />
              <PaymentMethodGraphic
                type="tipoGasto"
                transacciones={transacciones}
                payCategories={payOptions}
                filtroMes={filtroMes}
                filtroAno={filtroAno}
                filtroCategoria={categoriaSeleccionada}
              />
            </div>
            <RecentTransactions transacciones={transacciones} />
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

      <ModalForm
        isModalOpen={isModalOpen}
        closeModal={closeModal}
        payOptions={payOptions}
        payCategories={payCategories}
        onNewTransaction={(data) => handleNewTransaction(data)}
      />
      <AlertPending
        isOpen={pendTran}
        pendingTransaction={tranPendiente}
        isAccepted={isAccepted}
        isRejected={isRejected}
        payCategories={payCategories}
      />
      {showNotification && (
        <AchievementNotification
          achievement={achievementData}
          onClose={() => setShowNotification(false)}
        />
      )}
    </AppLayout>
  );
}

export default IndexPage;
