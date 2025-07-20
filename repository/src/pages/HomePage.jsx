import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import ModalForm from "./components/ModalForm";
import "./styles/HomePage.css";
import MonthlyGraphic from "./components/MonthlyGraphic";
import AchievementNotification from "./components/AchievementNotification";
import DetectedSubscriptions from "../components/DetectedSubscriptions";
import { getApiTransacciones } from "../functions/getApiTransacciones";
import { createCatAPI } from "../functions/createCatAPI";
import { createPaymentMethodAPI } from "../functions/createPaymentMethodAPI";
import {
  Filter,
  LayoutDashboard,
  Loader2,
  PlusCircle,
  XCircle,
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
  const [filtroMes, setFiltroMes] = useState(""); // Ej: "10" para octubre
  const [filtroAno, setFiltroAno] = useState(""); //
  const [filterEmpty, setFilterEmpty] = useState(false);
  const [loadGraphic, setLoadGraphic] = useState(true);
  const [grupos, setGrupos] = useState([]);
  const [selectedGroup, setSelectedGroup] = useState(null);
  const [posibleSub, setPosibleSub] = useState([]);
  const [transaccionesSinFiltroCat, setTransaccionesSinFiltroCat] = useState(
    []
  );
  const [isLoading, setIsLoading] = useState(true);
  const handleGroupChange = (selectedOption) => {
    if (selectedOption && selectedOption.value === null) {
      setSelectedGroup(null); // Restablecer a null si se selecciona "Personal"
    } else {
      setSelectedGroup(selectedOption); // Asignar el grupo seleccionado
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

    // Filtrar por categoría si no es "Todas"
    if (categoriaSeleccionada && categoriaSeleccionada !== "Todas") {
      filtradas = filtradas.filter(
        (t) => t.categoria === categoriaSeleccionada
      );
    }

    return filtradas;
  };

  useEffect(() => {
    getTransacciones(categoriaSeleccionada); //aplicar un filtro local
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
  }, []);

  useEffect(() => {
    if (transacciones.length > 0) {
      const recurringTransactions = detectRecurringTransactions(transacciones);
      setPosibleSub(recurringTransactions);
    }
  }, [transacciones]); // Se ejecuta cuando transacciones cambia

  const fetchGrupos = async () => {
    setIsLoading(true);
    const token = localStorage.getItem("token");
    try {
      const response = await fetch(
        "https://two024-qwerty-back-final-marcello.onrender.com/api/grupos/mis-grupos",
        {
          method: "GET",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (!response.ok) {
        throw new Error("Error al obtener los grupos.");
      }

      const data = await response.json();
      setGrupos(data); // Guardar los grupos en el estado
    } catch (error) {
      setError("Ocurrió un error al obtener los grupos.");
    } finally {
      setIsLoading(false);
    }
  };

  const showTransactionsPendientes = async () => {
    const token = localStorage.getItem("token");
    try {
      const response = await fetch(
        "https://two024-qwerty-back-final-marcello.onrender.com/api/transaccionesPendientes/user",
        {
          method: "GET",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (!response.ok) {
        throw new Error(`Error: ${response.status}`);
      }

      let data = await response.json();
      data = data.filter(
        (tran) => tran.id_reserva !== "Pago" && tran.id_reserva !== "Cobro"
      );
      if (data[0] != null) {
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
      const response = await fetch(
        "https://two024-qwerty-back-final-marcello.onrender.com/api/personal-tipo-gasto",
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

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
        error
      );
    } finally {
      setIsLoading(false);
    }
  };
  const checkIfValidToken = async (token) => {
    try {
      const response = await fetch(
        "https://two024-qwerty-back-final-marcello.onrender.com/api/transacciones/userTest",
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );
      if (response.ok) {
        //entra aca si pasa la autenticacion
        return true; //si esta activo tengo que devolver true
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
          filtroAno
        );
        setTransacciones(apiTransacciones.transacciones);
        setTransaccionesSinFiltroCat(
          apiTransacciones.transaccionesSinFiltroCat
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
      const response = await fetch(
        "https://two024-qwerty-back-final-marcello.onrender.com/api/personal-categoria",
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

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
      console.error("Error al obtener las categorías personalizadas:", error);
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
    setCategoriaSeleccionada("Todas");
    setFiltroAno("2025");
    setFiltroMes("");
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

  const agregarTransaccion = async (e, categoria) => {
    e.preventDefault();
    const token = localStorage.getItem("token");
    let bodyJson = "";
    let url = "";
    setTransaccionesCargadas(false);
    if (selectedGroup == null) {
      bodyJson = JSON.stringify({ motivo, valor, fecha, categoria, tipoGasto });
      url = edit
        ? `https://two024-qwerty-back-final-marcello.onrender.com/api/transacciones/${transaccionId}`
        : "https://two024-qwerty-back-final-marcello.onrender.com/api/transacciones";
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
        ? `https://two024-qwerty-back-final-marcello.onrender.com/api/grupos/transaccion/${transaccionId}`
        : "https://two024-qwerty-back-final-marcello.onrender.com/api/grupos/transaccion";
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
        if (selectedGroup == null) {
          if (edit) {
            const updatedTransacciones = transacciones.map((t) =>
              t.id === data.id ? data : t
            );
            setTransacciones(updatedTransacciones);
          } else {
            const updatedTransacciones = [...transacciones, data];
            updatedTransacciones.sort(
              (a, b) => new Date(b.fecha) - new Date(a.fecha)
            );
            setTransacciones(updatedTransacciones);
          }
        }
        closeModal();
        setSelectedGroup(null);
      } else {
        console.log("la respuesta no fue ok");
      }
    } catch (err) {
      console.log(err);
    } finally {
      setTransaccionesCargadas(true);
      if (!edit) {
        checkTransaccionAchievment();
      }
    }
  };

  const checkTransaccionAchievment = async () => {
    const token = localStorage.getItem("token");
    fetch(
      "https://two024-qwerty-back-final-marcello.onrender.com/api/users/userTransaction",
      {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      }
    )
      .then((response) => response.json())
      .then((data) => {
        if (data == 1 || data == 5 || data == 10) {
          setAchievementData(data);
          setShowNotification(true);
        } else {
          console.log(data);
        }
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
  const [periodoSeleccionado, setPeriodoSeleccionado] = useState("all_time");

  const detectRecurringTransactions = (transacciones) => {
    const today = new Date();
    const threeMonthsAgo = new Date(
      today.getFullYear(),
      today.getMonth() - 2,
      1
    ); // Inicio de hace 3 meses

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
        const monthKeys = Object.keys(months).sort(); // Aseguramos que los meses estén ordenados
        const lastThreeMonths = Array.from({ length: 3 }, (_, index) => {
          const date = new Date(
            today.getFullYear(),
            today.getMonth() - index,
            1
          );
          return `${date.getUTCFullYear()}-${date.getUTCMonth()}`;
        });

        const hasTransactionsInEachMonth = lastThreeMonths.every((monthKey) =>
          monthKeys.includes(monthKey)
        );

        if (hasTransactionsInEachMonth) {
          return {
            descripcion,
            meses: lastThreeMonths,
            transacciones: lastThreeMonths.flatMap(
              (monthKey) => months[monthKey] || []
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
    let url =
      "https://two024-qwerty-back-final-marcello.onrender.com/api/transacciones";
    if (transaccion.id_reserva == "Cobro") {
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
            (a, b) => new Date(b.fecha) - new Date(a.fecha)
          );
          setTransacciones(updatedTransacciones);
        }
      } catch (err) {
        console.log(err);
      } finally {
        setTransaccionesCargadas(true);
      }
    } else if (transaccion.id_reserva == "Pago") {
      console.log("Transaccion Aprobada");
    } else if (transaccion.id_reserva == "Grupo") {
      url =
        "https://two024-qwerty-back-final-marcello.onrender.com/api/grupos/agregar-usuario";
      const grupoId = transaccion.grupoId;
      console.log("este es el id " + grupoId);
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
          console.log("Hubo un problema al agregar el usuario al grupo.");
        }
      } catch (err) {
        console.log("Error en la solicitud de agregar usuario al grupo:", err);
      } finally {
        setTransaccionesCargadas(true);
      }
    } else {
      const method = "POST";
      let motivo = transaccion.motivo;
      let valor = transaccion.valor;
      let fecha = transaccion.fecha;
      categoria = "Clase";
      try {
        //hacer chequeos de que pase bien las cosas en el back!
        const response = await fetch(url, {
          method: method,
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ motivo, valor, fecha, categoria }),
        });

        if (response.ok) {
          const data = await response.json();
          const updatedTransacciones = [...transacciones, data];
          updatedTransacciones.sort(
            (a, b) => new Date(b.fecha) - new Date(a.fecha)
          );
          setTransacciones(updatedTransacciones);
        }
      } catch (err) {
        // habria que avisar que hubo un error en aceptar la transaccion o algo
      } finally {
        setTransaccionesCargadas(true);
      }
    }
  };

  const isAccepted = async (transaction, categoria, tipoGasto) => {
    await aceptarTransaccion(transaction, categoria, tipoGasto);
    eliminarTransaccionPendiente(transaction.id);
    if (transaction.id_reserva != "Cobro" && transaction.id_reserva != "Pago") {
      enviarRespuesta("aceptada", transaction.id_reserva);
    }
    setPendTran(false);
  };

  const isRejected = (transaction) => {
    eliminarTransaccionPendiente(transaction.id);
    if (transaction.id_reserva != "Cobro" && transaction.id_reserva != "Pago") {
      enviarRespuesta("rechazada", transaction.id_reserva);
    }
    setPendTran(false);
  };

  const enviarRespuesta = async (resp, id_reserva) => {
    const token = localStorage.getItem("token");
    setTransaccionesCargadas(false);
    const url = `https://two024-qwerty-back-final-marcello.onrender.com/api/transaccionesPendientes/${resp}?id_reserva=${id_reserva}`;
    const method = "POST";
    try {
      //hacer chequeos de que pase bien las cosas en el back!
      const response = await fetch(url, {
        method: method,
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      });

      if (response.ok) {
        //
      }
    } catch (err) {
      // habria que avisar que hubo un error en aceptar la transaccion o algo
    } finally {
      setTransaccionesCargadas(true);
    }
  };

  const eliminarTransaccionPendiente = async (id) => {
    const tranEliminada = await deletePendingTransaction(id);
    tranEliminada ? showTransactionsPendientes() : console.log("Error");
  };

  return (
    <AppLayout>
      <div className="space-y-8 min-h-full min-w-full">
        <div className="flex flex-col sm:flex-row justify-between items-center space-y-4 sm:space-y-0">
          <div className="flex items-center space-x-2">
            <LayoutDashboard className="h-8 w-8 text-primary" />
            <h1 className="text-3xl font-bold font-headline text-white">
              Dashboard
            </h1>
          </div>
          <div className="flex flex-col gap-2 justify-end w-full sm:flex-row sm:items-center sm:space-x-2 sm:gap-0">
            <Popover>
              <PopoverTrigger asChild>
                <Button variant="outline">
                  <Filter className="mr-2 h-4 w-4" /> Filters
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-80 bg-card" align="end">
                <div className="grid gap-4">
                  <div className="space-y-2">
                    <h4 className="font-medium leading-none font-headline">
                      Filters
                    </h4>
                    <p className="text-sm text-muted-foreground">
                      Filter transactions by date.
                    </p>
                  </div>
                  <div className="grid gap-2">
                    <Select
                      value={categoriaSeleccionada}
                      onValueChange={setCategoriaSeleccionada}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Seleccionar Categoría" />
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
                      <SelectTrigger>
                        <SelectValue placeholder="Select Month" />
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
                      <SelectTrigger>
                        <SelectValue placeholder="Select Year" />
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
                  <Button
                    variant="ghost"
                    className="bg-primary text-black"
                    onClick={resetFilters}
                  >
                    <XCircle className="mr-2 h-4 w-4" /> Limpiar Filtros
                  </Button>
                </div>
              </PopoverContent>
            </Popover>
            <Button
              asChild
              className="w-full sm:w-auto bg-primary hover:bg-primary/90 text-primary-foreground"
            >
              <a
                href="#"
                className="text-sm text-muted-foreground hover:text-primary text-center hover:text-black"
                onClick={() => openModal()}
              >
                <PlusCircle className="mr-1 h-4 w-4" /> Agregar Transaccion
              </a>
            </Button>
          </div>
        </div>
        {/* Mostrar suscripciones detectadas */}
        <DetectedSubscriptions subs={posibleSub} />
        {isLoadingFilter ? (
          <div className="flex flex-col items-center justify-center py-12 text-white">
            <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-primary mb-4"></div>
            <span className="text-lg text-white font-semibold">
              Cargando...
            </span>
          </div>
        ) : transacciones.length > 0 ? (
          <div className="flex flex-col gap-6 w-full  mx-auto">
            {transacciones && !loadGraphic && transacciones[0] && (
              <MonthlyGraphic
                type="categorias"
                transacciones={transacciones}
                payCategories={payCategories}
                filtroMes={filtroMes}
                filtroCategoria={categoriaSeleccionada}
                loading={loadGraphic}
                transaccionesSinFiltroCat={transaccionesSinFiltroCat}
              />
            )}

            {transaccionesCargadas &&
              !loadGraphic &&
              transacciones[0] != null && (
                <PaymentMethodGraphic
                  type="tipoGasto"
                  transacciones={transacciones}
                  payCategories={payOptions}
                  loading={loadGraphic}
                />
              )}
          </div>
        ) : (
          <div>
            <div className="text-center text-muted-foreground mt-8 text-red-500 font-extrabold">
              No hay transacciones en el periodo seleccionado.
            </div>
            <div className="flex justify-center mt-4">
              <Button
                asChild
                className="bg-primary text-center hover:bg-primary/90 text-primary-foreground"
              >
                <a
                  href="#"
                  className="text-sm text-muted-foreground text-center hover:text-black"
                  onClick={() => openModal()}
                >
                  <PlusCircle className="mr-2 h-4 w-4" /> Add Transaction
                </a>
              </Button>
            </div>
          </div>
        )}
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
      </div>
    </AppLayout>
  );
}

export default HomePage;
