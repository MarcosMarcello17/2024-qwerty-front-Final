import { useState, useEffect, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import ModalForm from "./components/ModalForm";
import MonthlyGraphic from "./components/MonthlyGraphic";
import AchievementNotification from "./components/AchievementNotification";
import DetectedSubscriptions from "../components/DetectedSubscriptions";
import { getApiTransacciones } from "../functions/getApiTransacciones";
import { createCatAPI } from "../functions/createCatAPI";
import { createPaymentMethodAPI } from "../functions/createPaymentMethodAPI";
import { deletePendingTransaction } from "../functions/deletePendingTransaction";
import { processRecurringTransactions } from "../functions/processRecurringTransactions";
import {
  Filter,
  Loader2,
  PlusCircle,
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

const years = [
  { value: "00", label: "Todos los años" },
  { value: "2021", label: "2021" },
  { value: "2022", label: "2022" },
  { value: "2023", label: "2023" },
  { value: "2024", label: "2024" },
  { value: "2025", label: "2025" },
  { value: "2026", label: "2026" },
];

const BACK_URL = import.meta.env.VITE_BACK_SERVER_URL;

function HomePage() {
  const [transacciones, setTransacciones] = useState([]);
  const [showNotification, setShowNotification] = useState(false);
  const [motivo, setMotivo] = useState("");
  const [showNoTransactions, setShowNoTransactions] = useState(false);
  const [valor, setValor] = useState("");
  const [fecha, setFecha] = useState(new Date().toISOString().split("T")[0]);
  const [error, setError] = useState(null);
  const [edit, setEdit] = useState(false);
  const [tipoGasto, setTipoGasto] = useState("Efectivo");
  const [tranPendiente, setTranPendiente] = useState({});
  const [categoria, setCategoria] = useState("");
  const [payCategories, setPayCategories] = useState([]);
  const [transaccionesCargadas, setTransaccionesCargadas] = useState(false);
  const [achievementData, setAchievementData] = useState(0);
  const [payCategoriesDefault, setPayCategoriesDefault] = useState([
    {
      value: "Impuestos y Servicios",
      label: "Impuestos y Servicios",
      iconPath: "fa-solid fa-file-invoice-dollar",
    },
    {
      value: "Entretenimiento y Ocio",
      label: "Entretenimiento y Ocio",
      iconPath: "fa-solid fa-ticket",
    },
    {
      value: "Hogar y Mercado",
      label: "Hogar y Mercado",
      iconPath: "fa-solid fa-house",
    },
    { value: "Antojos", label: "Antojos", iconPath: "fa-solid fa-candy-cane" },
    {
      value: "Electrodomesticos",
      label: "Electrodomesticos",
      iconPath: "fa-solid fa-blender",
    },
    { value: "Clase", label: "Clase", iconPath: "fa-solid fa-chalkboard-user" },
    {
      value: "Ingreso de Dinero",
      label: "Ingreso de Dinero",
      iconPath: "fa-solid fa-money-bill",
    },
  ]);
  const [payOptions, setPayOptions] = useState([
    { value: "Tarjeta de credito", label: "Tarjeta de credito" },
    { value: "Tarjeta de Debito", label: "Tarjeta de debito" },
    { value: "Efectivo", label: "Efectivo" },
  ]);
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [selectedPayMethod, setSelectedPayMethod] = useState({
    value: "Efectivo",
    label: "Efectivo",
  });
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [transaccionId, setTransaccionId] = useState(null);
  const navigate = useNavigate();
  const [categoriaSeleccionada, setCategoriaSeleccionada] = useState("Todas");
  const [categoriasConTodas, setCategoriasConTodas] = useState([]);
  const [isLoadingFilter, setIsLoadingFilter] = useState(true);
  const [pendTran, setPendTran] = useState(false);
  const [filtroMes, setFiltroMes] = useState("00");
  const [filtroAno, setFiltroAno] = useState("00");
  const [filterEmpty, setFilterEmpty] = useState(false);
  const [loadGraphic, setLoadGraphic] = useState(true);
  const [grupos, setGrupos] = useState([]);
  const [selectedGroup, setSelectedGroup] = useState(null);
  const [posibleSub, setPosibleSub] = useState([]);
  const [transaccionesSinFiltroCat, setTransaccionesSinFiltroCat] = useState(
    [],
  );
  const [isLoading, setIsLoading] = useState(true);
  const [showSubscriptions, setShowSubscriptions] = useState(false);
  const [isLoadingSubscriptions, setIsLoadingSubscriptions] = useState(false);
  const [periodoSeleccionado, setPeriodoSeleccionado] = useState("all_time");

  const handleGroupChange = (selectedOption) => {
    if (selectedOption && selectedOption.value === null) {
      setSelectedGroup(null);
    } else {
      setSelectedGroup(selectedOption);
    }
  };

  const getTransaccionesFiltradas = () => {
    const hoy = new Date();
    let desde;
    let filtradas = [];

    switch (periodoSeleccionado) {
      case "monthly":
        desde = new Date(hoy.getFullYear(), hoy.getMonth(), 1);
        filtradas = transacciones.filter((t) => new Date(t.fecha) >= desde);
        break;
      case "quarterly":
        desde = new Date(hoy.getFullYear(), hoy.getMonth() - 2, 1);
        filtradas = transacciones.filter((t) => new Date(t.fecha) >= desde);
        break;
      case "yearly":
        desde = new Date(hoy.getFullYear(), 0, 1);
        filtradas = transacciones.filter((t) => new Date(t.fecha) >= desde);
        break;
      case "all_time":
      default:
        filtradas = transacciones;
    }

    if (categoriaSeleccionada && categoriaSeleccionada !== "Todas") {
      filtradas = filtradas.filter(
        (t) => t.categoria === categoriaSeleccionada,
      );
    }

    return filtradas;
  };

  useEffect(() => {
    setIsLoadingFilter(true);
    getTransacciones(categoriaSeleccionada);
    setLoadGraphic(false);
  }, [categoriaSeleccionada, filtroMes, filtroAno]);
  useEffect(() => {
    if (payCategories.length > 0) {
      setCategoriasConTodas([
        { value: "Todas", label: "Todas las Categorias" },
        ...payCategories,
      ]);
    }
    setIsLoading(false);
  }, [payCategories]);
  useEffect(() => {
    fetchPersonalTipoGastos();
    fetchGrupos();
    processRecurringOnLoad();
  }, []);

  useEffect(() => {
    if (transacciones.length > 0) {
      const recurringTransactions = detectRecurringTransactions(transacciones);
      setPosibleSub(recurringTransactions);
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

  const fetchGrupos = async () => {
    setIsLoading(true);
    const token = localStorage.getItem("token");
    try {
      const response = await fetch(`${BACK_URL}/api/grupos/mis-grupos`, {
        method: "GET",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error("Error al obtener los grupos.");
      }

      const data = await response.json();
      setGrupos(data);
    } catch (error) {
      setError("Ocurrio un error al obtener los grupos.");
    } finally {
      setIsLoading(false);
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
    } finally {
      setIsLoadingFilter(false);
    }
  };

  const fetchPersonalTipoGastos = async () => {
    setIsLoading(true);
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
        setPayOptions([...payOptions, ...customOptions]);
      }
    } catch (error) {
      console.error(
        "Error al obtener los tipos de gasto personalizados:",
        error,
      );
    } finally {
      setIsLoading(false);
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
    setIsLoading(true);
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
      } catch (err) {
        console.error("Error fetching transactions:", err);
      } finally {
        setIsLoadingFilter(false);
        setTransaccionesCargadas(true);
      }
      fetchPersonalCategorias();
      showTransactionsPendientes();
    } else {
      navigate("/");
    }
    setIsLoading(false);
  };

  const fetchPersonalCategorias = async () => {
    setIsLoading(true);
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
          ...payCategoriesDefault,
          ...customOptions,
        ]);
      }
    } catch (error) {
      console.error("Error al obtener las categorias personalizadas:", error);
    }
  };

  const openModal = () => {
    fetchGrupos();
    setIsModalOpen(true);
  };
  const closeModal = () => {
    setIsModalOpen(false);
    clearForm();
    setEdit(false);
  };

  const resetFilters = () => {
    setIsLoadingFilter(true);
    setCategoriaSeleccionada("Todas");
    setFiltroAno("00");
    setFiltroMes("00");
    setIsLoadingFilter(false);
  };

  const clearForm = () => {
    setMotivo("");
    setValor("");
    setFecha(new Date().toISOString().split("T")[0]);
    setSelectedCategory(null);
    setTipoGasto("Efectivo");
    setSelectedPayMethod({
      value: "Efectivo",
      label: "Efectivo",
    });
  };

  const agregarTransaccion = async (e, categoria, isRecurrent = false) => {
    e.preventDefault();
    const token = localStorage.getItem("token");
    let bodyJson = "";
    let url = "";
    setTransaccionesCargadas(false);
    if (selectedGroup === null) {
      bodyJson = JSON.stringify({ motivo, valor, fecha, categoria, tipoGasto });
      url = edit
        ? `${BACK_URL}/api/transacciones/${transaccionId}`
        : `${BACK_URL}/api/transacciones`;
    } else {
      const grupo = selectedGroup.value;
      bodyJson = JSON.stringify({
        motivo,
        valor,
        fecha,
        categoria,
        tipoGasto,
        grupo,
      });
      url = edit
        ? `${BACK_URL}/api/grupos/transaccion/${transaccionId}`
        : `${BACK_URL}/api/grupos/transaccion`;
    }
    const method = edit ? "PUT" : "POST";
    try {
      const response = await fetch(url, {
        method: method,
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: bodyJson,
      });
      if (response.ok) {
        const data = await response.json();
        if (selectedGroup === null) {
          if (edit) {
            const updatedTransacciones = transacciones.map((t) =>
              t.id === data.id ? data : t,
            );
            setTransacciones(updatedTransacciones);
          } else {
            const updatedTransacciones = [...transacciones, data];
            updatedTransacciones.sort(
              (a, b) => new Date(b.fecha) - new Date(a.fecha),
            );
            setTransacciones(updatedTransacciones);
          }
        }
        closeModal();
        setSelectedGroup(null);
        setShowSubscriptions(false);
        if (isRecurrent) {
          await agregarTransaccionRecurrente({
            motivo,
            valor,
            fecha,
            categoria,
            tipoGasto,
          });
        }
      } else {
        console.error(
          "Error al crear transaccion:",
          response.status,
          response.statusText,
        );
        setError("Error al procesar la transaccion.");
      }
    } catch (err) {
      console.error("Error en la solicitud:", err);
      setError("Error de red al procesar la transaccion.");
    } finally {
      setTransaccionesCargadas(true);
      if (!edit) {
        checkTransaccionAchievment();
      }
    }
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
      if (response.ok) {
        console.log("Transaccion Recurrente creada");
      } else {
        setError("Error al crear la transaccion recurrente.");
      }
    } catch (err) {
      setError("Error de red.");
    }
  };

  const checkTransaccionAchievment = async () => {
    const token = localStorage.getItem("token");
    fetch(`${BACK_URL}/api/users/userTransaction`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
    })
      .then((response) => response.json())
      .then((data) => {
        if (data === 1 || data === 5 || data === 10) {
          setAchievementData(data);
          setShowNotification(true);
        } else {
          console.log(data);
        }
      })
      .catch((error) => {
        console.error("Error checking achievements:", error);
      });
  };

  const handleMotivoChange = (e) => {
    setMotivo(e.target.value);
  };
  const handleCategoryChange = (value) => {
    setCategoria(value ? value.value : "");
    setSelectedCategory(value);
  };
  const handlePayChange = (value) => {
    setTipoGasto(value ? value.value : "");
    setSelectedPayMethod(value);
  };
  const handleCreateTP = async (inputValue) => {
    const newOption = createPaymentMethodAPI(inputValue);
    setPayOptions((prevOptions) => [...prevOptions, newOption]);
    setSelectedPayMethod(newOption);
    setTipoGasto(newOption.label);
  };
  const handleCreateCat = async (nombre, icono) => {
    const ret = await createCatAPI(nombre, icono);
    if (ret.newCat != null) {
      setPayCategories((prevOptions) => [...prevOptions, ret.newCat]);
      setSelectedCategory(ret.newCat);
      setCategoria(ret.newCat.value);
    }
    return ret.error;
  };
  const handleChange = (value) => {
    setPeriodoSeleccionado(value);
    setIsLoadingFilter(true);
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

  const transaccionesFiltradas = getTransaccionesFiltradas();

  const aceptarTransaccion = async (transaccion, categoria, tipoGasto) => {
    const token = localStorage.getItem("token");
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
        } else {
          console.error(
            "Error al crear pago:",
            response.status,
            response.statusText,
          );
          setError("Error al procesar la transaccion de cobro.");
        }
      } catch (err) {
        console.error("Error en la solicitud de cobro:", err);
        setError("Error de red al procesar la transaccion.");
      } finally {
        setTransaccionesCargadas(true);
      }
    } else if (transaccion.id_reserva === "Pago") {
      console.log("Transaccion Aprobada");
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
          console.log("Usuario agregado al grupo exitosamente.");
        } else {
          console.error(
            "Error al agregar usuario al grupo:",
            response.status,
            response.statusText,
          );
          setError("Hubo un problema al agregar el usuario al grupo.");
        }
      } catch (err) {
        console.error(
          "Error en la solicitud de agregar usuario al grupo:",
          err,
        );
        setError("Error de red al procesar la solicitud de grupo.");
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
        } else {
          console.error(
            "Error al crear transaccion:",
            response.status,
            response.statusText,
          );
          setError("Error al procesar la transaccion.");
        }
      } catch (err) {
        console.error("Error en la solicitud de transaccion:", err);
        setError("Error de red al procesar la transaccion.");
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
    const method = "POST";
    try {
      const response = await fetch(url, {
        method: method,
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      });

      if (response.ok) {
        console.log("Respuesta enviada exitosamente");
      } else {
        console.error(
          "Error al enviar respuesta:",
          response.status,
          response.statusText,
        );
        setError("Error al enviar la respuesta.");
      }
    } catch (err) {
      console.error("Error en la solicitud de respuesta:", err);
      setError("Error de red al enviar la respuesta.");
    } finally {
      setTransaccionesCargadas(true);
    }
  };

  const eliminarTransaccionPendiente = async (id) => {
    const tranEliminada = await deletePendingTransaction(id);
    tranEliminada ? showTransactionsPendientes() : console.error("Error");
  };

  // Summary metrics computed from current transaction set
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
    const topCategory = sorted[0]?.[0] || null;

    return { totalSpent, count, topCategory };
  }, [transacciones]);

  const hasActiveFilters =
    categoriaSeleccionada !== "Todas" ||
    filtroMes !== "00" ||
    filtroAno !== "00";

  return (
    <AppLayout>
      <div className="space-y-6 min-h-full min-w-full">
        {/* Page header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
          <h1 className="text-[2rem] font-bold font-headline leading-tight">
            Dashboard
          </h1>
          <div className="flex gap-2 w-full sm:w-auto">
            <Popover>
              <PopoverTrigger asChild>
                <Button variant="outline" className={hasActiveFilters ? "border-primary/50" : ""}>
                  <Filter className="mr-2 h-4 w-4" />
                  Filtrar
                  {hasActiveFilters && (
                    <span className="ml-1.5 inline-flex h-4 w-4 items-center justify-center rounded-full bg-primary text-[0.625rem] font-semibold text-primary-foreground">
                      !
                    </span>
                  )}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-80 bg-card" align="end">
                <div className="grid gap-4">
                  <div className="space-y-1">
                    <h4 className="font-medium leading-none font-headline text-sm">
                      Filtros
                    </h4>
                    <p className="text-xs text-muted-foreground">
                      Filtra las transacciones por categoría y fecha.
                    </p>
                  </div>
                  <div className="grid gap-2">
                    <Select
                      value={categoriaSeleccionada}
                      onValueChange={(value) => {
                        setIsLoadingFilter(true);
                        setCategoriaSeleccionada(value);
                      }}
                    >
                      <SelectTrigger>
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
                    <Select
                      value={filtroMes}
                      onValueChange={(value) => {
                        setIsLoadingFilter(true);
                        setFiltroMes(value);
                      }}
                    >
                      <SelectTrigger>
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
                    <Select
                      value={filtroAno}
                      onValueChange={(value) => {
                        setIsLoadingFilter(true);
                        setFiltroAno(value);
                      }}
                    >
                      <SelectTrigger>
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
              onClick={openModal}
              className="w-full sm:w-auto"
            >
              <PlusCircle className="mr-1.5 h-4 w-4" /> Agregar transacción
            </Button>
          </div>
        </div>

        {/* Summary strip */}
        {transaccionesCargadas && transacciones.length > 0 && (
          <div className="flex flex-wrap gap-x-10 gap-y-3 pb-4 border-b border-border">
            <div>
              <span className="text-[0.7rem] font-medium text-muted-foreground uppercase tracking-[0.05em]">
                Total gastado
              </span>
              <p className="text-xl font-semibold tabular-nums leading-tight">
                ${summary.totalSpent.toLocaleString("es-AR", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </p>
            </div>
            <div>
              <span className="text-[0.7rem] font-medium text-muted-foreground uppercase tracking-[0.05em]">
                Transacciones
              </span>
              <p className="text-xl font-semibold tabular-nums leading-tight">
                {summary.count}
              </p>
            </div>
            {summary.topCategory && (
              <div>
                <span className="text-[0.7rem] font-medium text-muted-foreground uppercase tracking-[0.05em]">
                  Mayor gasto
                </span>
                <p className="text-xl font-semibold leading-tight">
                  {summary.topCategory}
                </p>
              </div>
            )}
          </div>
        )}

        {/* Subscriptions - collapsible */}
        <div>
          <button
            type="button"
            onClick={() => {
              if (!showSubscriptions) {
                setIsLoadingSubscriptions(true);
                setTimeout(() => {
                  setShowSubscriptions(true);
                  setIsLoadingSubscriptions(false);
                }, 300);
              } else {
                setShowSubscriptions(false);
              }
            }}
            className="flex items-center gap-1.5 text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
          >
            {showSubscriptions ? (
              <ChevronUp className="h-4 w-4" />
            ) : (
              <ChevronDown className="h-4 w-4" />
            )}
            Suscripciones y recurrentes
          </button>
          {isLoadingSubscriptions && (
            <div className="flex items-center gap-2 py-4">
              <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
              <span className="text-sm text-muted-foreground">
                Cargando...
              </span>
            </div>
          )}
          {showSubscriptions && !isLoadingSubscriptions && (
            <div className="mt-3">
              <DetectedSubscriptions subs={posibleSub || []} />
            </div>
          )}
        </div>

        {/* Main content: charts or loading skeleton or empty state */}
        {isLoadingFilter ? (
          <div className="grid gap-6 md:grid-cols-2">
            <div className="rounded-xl bg-card border border-border p-6">
              <div className="animate-pulse space-y-4">
                <div className="h-4 w-36 bg-secondary rounded" />
                <div className="h-3 w-56 bg-secondary/60 rounded" />
                <div className="h-[280px] bg-secondary/30 rounded-lg" />
              </div>
            </div>
            <div className="rounded-xl bg-card border border-border p-6">
              <div className="animate-pulse space-y-4">
                <div className="h-4 w-40 bg-secondary rounded" />
                <div className="h-3 w-48 bg-secondary/60 rounded" />
                <div className="h-[280px] bg-secondary/30 rounded-lg" />
              </div>
            </div>
            <div className="rounded-xl bg-card border border-border p-6">
              <div className="animate-pulse space-y-4">
                <div className="h-4 w-44 bg-secondary rounded" />
                <div className="h-3 w-52 bg-secondary/60 rounded" />
                <div className="h-[280px] bg-secondary/30 rounded-lg" />
              </div>
            </div>
          </div>
        ) : transacciones.length > 0 ? (
          <div className="grid gap-6 md:grid-cols-2 w-full">
            {transacciones && !loadGraphic && transacciones.length > 0 && (
              <MonthlyGraphic
                type="categorias"
                transacciones={transacciones}
                payCategories={payCategories}
                filtroMes={filtroMes}
                filtroAno={filtroAno}
                filtroCategoria={categoriaSeleccionada}
                loading={loadGraphic}
                transaccionesSinFiltroCat={transaccionesSinFiltroCat}
              />
            )}

            {transaccionesCargadas &&
              !loadGraphic &&
              transacciones.length > 0 && (
                <PaymentMethodGraphic
                  type="tipoGasto"
                  transacciones={transacciones}
                  payCategories={payOptions}
                  loading={loadGraphic}
                  filtroMes={filtroMes}
                  filtroAno={filtroAno}
                  filtroCategoria={categoriaSeleccionada}
                />
              )}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center py-16 text-center">
            <p className="text-muted-foreground mb-1">
              No hay transacciones en este período.
            </p>
            <p className="text-sm text-muted-foreground/70 mb-6">
              {hasActiveFilters
                ? "Prueba ajustando los filtros o registra una nueva transacción."
                : "Registra tu primera transacción para ver tus gastos."}
            </p>
            <Button onClick={openModal}>
              <PlusCircle className="mr-1.5 h-4 w-4" /> Agregar transacción
            </Button>
          </div>
        )}
      </div>

      <ModalForm
        isModalOpen={isModalOpen}
        closeModal={closeModal}
        agregarTransaccion={agregarTransaccion}
        edit={edit}
        motivo={motivo}
        valor={valor}
        fecha={fecha}
        handleMotivoChange={handleMotivoChange}
        setValor={setValor}
        selectedCategory={selectedCategory}
        payCategories={payCategories}
        handleCategoryChange={handleCategoryChange}
        handleCreateCat={handleCreateCat}
        setFecha={setFecha}
        handlePayChange={handlePayChange}
        selectedPayMethod={selectedPayMethod}
        payOptions={payOptions}
        handleCreateTP={handleCreateTP}
        handleGroupChange={handleGroupChange}
        selectedGroup={selectedGroup}
        grupos={grupos}
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

export default HomePage;
