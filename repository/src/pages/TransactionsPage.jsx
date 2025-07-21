import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import {
  ListChecks,
  PlusCircle,
  Edit3,
  Trash2,
  Filter,
  TrendingUp,
  TrendingDown,
  XCircle,
  PieChart,
  Loader2,
  ArrowUpDown,
  ArrowUp,
  ArrowDown,
} from "lucide-react";
import React, { useEffect, useState } from "react";
import { library } from "@fortawesome/fontawesome-svg-core";
import { format } from "date-fns";
import { cn } from "@/lib/utils";
import AppLayout from "./AppLayout";
import { getApiTransacciones } from "@/functions/getApiTransacciones";
import { useNavigate } from "react-router-dom";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import ModalForm from "./components/ModalForm";
import AutomaticDistribution from "../components/AutomaticDistribution";
import { createCatAPI } from "@/functions/createCatAPI";
import {
  distributeIncomeAutomatically,
  distributeExistingIncome,
} from "@/functions/distributeIncomeAPI";
import { fas } from "@fortawesome/free-solid-svg-icons";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

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

export default function TransactionsPage() {
  library.add(fas);
  const navigate = useNavigate();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [transacciones, setTransacciones] = useState([]);
  const [categoriaSeleccionada, setCategoriaSeleccionada] = useState("Todas");
  const [filtroMes, setFiltroMes] = useState("00");
  const [filtroAno, setFiltroAno] = useState("00");
  const [isLoading, setIsLoading] = useState(false);
  const [transaccionesCargadas, setTransaccionesCargadas] = useState(false);
  const [isLoadingFilter, setIsLoadingFilter] = useState(false);
  const [isLoadingDistribution, setIsLoadingDistribution] = useState(false);
  const [isLoadingTransaction, setIsLoadingTransaction] = useState(false);
  const [isLoadingDelete, setIsLoadingDelete] = useState(false);
  const [payCategories, setPayCategories] = useState([]);
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
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [selectedPayMethod, setSelectedPayMethod] = useState({
    value: "Efectivo",
    label: "Efectivo",
  });
  const [payOptions, setPayOptions] = useState([
    { value: "Tarjeta de credito", label: "Tarjeta de credito" },
    { value: "Tarjeta de Debito", label: "Tarjeta de debito" },
    { value: "Efectivo", label: "Efectivo" },
  ]);
  const [fecha, setFecha] = useState(new Date().toISOString().split("T")[0]);
  const [transaccionId, setTransaccionId] = useState(null);
  const [tipoGasto, setTipoGasto] = useState("Efectivo");
  const [selectedGroup, setSelectedGroup] = useState(null);
  const [grupos, setGrupos] = useState([]);
  const [isFiltersOpen, setIsFiltersOpen] = useState(false);
  const [categoriasConTodas, setCategoriasConTodas] = useState([]);

  // Estados para distribución automática
  const [showDistributionModal, setShowDistributionModal] = useState(false);
  const [transactionToDistribute, setTransactionToDistribute] = useState(null);

  // Handlers necesarios
  const handleMotivoChange = (e) => setMotivo(e.target.value);
  const handleCategoryChange = (value) => {
    setSelectedCategory(value);
  };
  const handlePayChange = (value) => {
    setSelectedPayMethod(value);
    setTipoGasto(value ? value.value : "");
  };
  const handleCreateTP = (inputValue) => {
    const newOption = { value: inputValue, label: inputValue };
    setPayOptions((prev) => [...prev, newOption]);
    setSelectedPayMethod(newOption);
    setTipoGasto(newOption.label);
  };
  const handleCreateCat = async (nombre, icono) => {
    const ret = await createCatAPI(nombre, icono);
    if (ret.newCat != null) {
      setPayCategories((prevOptions) => [...prevOptions, ret.newCat]);
      setSelectedCategory(ret.newCat);
      setCategoria(ret.newCat.value);
      // Refrescar categorías desde el servidor para mantener consistencia
      await fetchPersonalCategorias();
    }
    return ret.error;
  };
  const handleGroupChange = (group) => setSelectedGroup(group);

  // Cargar categorías al montar el componente
  useEffect(() => {
    const initializeData = async () => {
      await fetchPersonalCategorias();
      getTransacciones("Todas");
    };

    initializeData();
  }, []);

  // Actualizar categoriasConTodas cuando payCategories cambie
  useEffect(() => {
    setCategoriasConTodas([
      { value: "Todas", label: "Todas las Categorias" },
      ...payCategories,
    ]);
  }, [payCategories]);

  // Actualizar categorías disponibles cuando cambien las transacciones
  useEffect(() => {
    if (transacciones.length > 0) {
      // Extraer categorías únicas de las transacciones
      const categoriasEnTransacciones = [
        ...new Set(transacciones.map((t) => t.categoria)),
      ];

      // Crear categorías que pueden no estar en payCategories
      const categoriasAdicionales = categoriasEnTransacciones
        .filter((cat) => !payCategories.some((pc) => pc.value === cat))
        .map((cat) => ({
          value: cat,
          label: cat,
          iconPath: "fa-solid fa-circle-dot", // Icono por defecto
        }));

      // Actualizar categoriasConTodas con todas las categorías disponibles
      const todasLasCategorias = [
        { value: "Todas", label: "Todas las Categorias" },
        ...payCategories,
        ...categoriasAdicionales,
      ];

      setCategoriasConTodas(todasLasCategorias);
    }
  }, [transacciones, payCategories]);

  // Obtener transacciones cuando cambien los filtros
  useEffect(() => {
    if (payCategories.length > 0) {
      // Solo ejecutar cuando las categorías estén cargadas
      setIsLoadingFilter(true);
      getTransacciones(categoriaSeleccionada);
    }
  }, [categoriaSeleccionada, filtroMes, filtroAno, payCategories.length]);
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
      } catch (err) {
        console.error("Error fetching transacciones:", err);
      } finally {
        setIsLoadingFilter(false);
        setTransaccionesCargadas(true);
      }
    } else {
      navigate("/");
    }
    setIsLoading(false);
  };
  const fetchPersonalCategorias = async () => {
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
  const deleteRow = async (id) => {
    const token = localStorage.getItem("token");
    setIsLoadingDelete(true);
    setTransaccionesCargadas(false);
    try {
      const response = await fetch(
        `https://two024-qwerty-back-final-marcello.onrender.com/api/transacciones/${id}`,
        {
          method: "DELETE",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (response.ok) {
        setTransacciones(transacciones.filter((t) => t.id !== id));
      } else {
        setError("Error al eliminar la transacción");
      }
    } catch (err) {
      setError("Ocurrió un error. Intenta nuevamente.");
    } finally {
      setIsLoadingDelete(false);
      setTransaccionesCargadas(true);
    }
  };

  const [sortConfig, setSortConfig] = useState({ key: null, direction: "asc" });

  const closeModal = () => {
    setIsModalOpen(false);
    clearForm();
    setEdit(false);
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
    setIsLoadingTransaction(true);
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
        console.error("la respuesta no fue ok");
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoadingTransaction(false);
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
        nextExecution: new Date(new Date().setMonth(new Date().getMonth() + 1))
          .toISOString()
          .split("T")[0],
      };
      const response = await fetch(
        "https://two024-qwerty-back-final-marcello.onrender.com/api/recurrents",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify(body),
        }
      );
      if (response.ok) {
        console.log("Transaccion Recurrente creada");
      } else {
        setError("Error al crear la transacción recurrente.");
      }
    } catch (err) {
      setError("Error de red.");
    }
  };

  // Funciones para distribución automática
  const handleDistributeIncome = (transaction) => {
    setTransactionToDistribute(transaction);
    setShowDistributionModal(true);
  };

  const handleConfirmDistribution = async (shouldDistribute) => {
    setShowDistributionModal(false);

    if (shouldDistribute && transactionToDistribute) {
      setIsLoadingDistribution(true);
      setTransaccionesCargadas(false);
      try {
        const result = await distributeExistingIncome(
          transactionToDistribute.id
        );

        if (result.success) {
          // Marcar la transacción como distribuida localmente
          const updatedTransacciones = transacciones.map((t) =>
            t.id === transactionToDistribute.id
              ? { ...t, distribuida: true }
              : t
          );
          setTransacciones(updatedTransacciones);

          // Recargar transacciones para mostrar las nuevas transacciones distribuidas
          await getTransacciones();
          alert(
            `Distribución exitosa! Se crearon ${result.transaccionesCreadas} transacciones automáticamente.`
          );
        } else {
          alert(`Error en la distribución: ${result.error}`);
        }
      } catch (error) {
        console.error("Error al distribuir ingreso:", error);
        alert(error.message || "Error de conexión al distribuir el ingreso");
      } finally {
        setIsLoadingDistribution(false);
        setTransaccionesCargadas(true);
      }
    }

    setTransactionToDistribute(null);
  };

  const handleCancelDistribution = () => {
    setShowDistributionModal(false);
    setTransactionToDistribute(null);
  };
  const sortedtransacciones = React.useMemo(() => {
    if (sortConfig.key) {
      const sorted = [...transacciones].sort((a, b) => {
        let aValue = a[sortConfig.key];
        let bValue = b[sortConfig.key];

        // Manejo especial para fechas
        if (sortConfig.key === "fecha") {
          aValue = new Date(aValue);
          bValue = new Date(bValue);
        }

        // Manejo especial para valores numéricos
        if (sortConfig.key === "valor") {
          aValue = parseFloat(aValue);
          bValue = parseFloat(bValue);
        }

        // Manejo especial para strings (motivo, categoria, tipoGasto)
        if (typeof aValue === "string" && typeof bValue === "string") {
          aValue = aValue.toLowerCase();
          bValue = bValue.toLowerCase();
        }

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
    return transacciones;
  }, [transacciones, sortConfig]);

  const [motivo, setMotivo] = useState("");
  const [valor, setValor] = useState("");
  const [edit, setEdit] = useState(false);

  const resetFilters = () => {
    setIsLoadingFilter(true);
    setCategoriaSeleccionada("Todas");
    setFiltroAno("00");
    setFiltroMes("00");
  };

  const handleSort = (key) => {
    setSortConfig((prevConfig) => ({
      key,
      direction:
        prevConfig.key === key && prevConfig.direction === "asc"
          ? "desc"
          : "asc",
    }));
  };

  // Componente para headers ordenables
  const SortableHeader = ({ sortKey, children, className = "" }) => {
    const getSortIcon = () => {
      if (sortConfig.key !== sortKey) {
        return <ArrowUpDown className="ml-2 h-4 w-4 text-muted-foreground" />;
      }
      return sortConfig.direction === "asc" ? (
        <ArrowUp className="ml-2 h-4 w-4 text-primary" />
      ) : (
        <ArrowDown className="ml-2 h-4 w-4 text-primary" />
      );
    };

    return (
      <TableHead
        className={`cursor-pointer hover:bg-muted/50 transition-colors select-none ${className}`}
        onClick={() => handleSort(sortKey)}
      >
        <div className="flex items-center">
          {children}
          {getSortIcon()}
        </div>
      </TableHead>
    );
  };

  const editRow = (row) => {
    setEdit(true);
    setMotivo(row.motivo);
    setValor(row.valor);
    const selectedOption = payOptions.find(
      (option) => option.value === row.tipoGasto
    );
    setSelectedPayMethod(selectedOption || null);
    const selectedPayCategory = payCategories.find(
      (option) => option.value == row.categoria
    );
    setSelectedCategory(selectedPayCategory || null);
    setFecha(row.fecha);
    setTransaccionId(row.id);
    fetchGrupos();
    setIsModalOpen(true);
  };

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

  const openModal = () => {
    fetchGrupos();
    setIsModalOpen(true);
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
        if (data === 1 || data === 5 || data === 10) {
          // Handle achievement notification if needed
          console.log("Achievement unlocked:", data);
        } else {
          console.log(data);
        }
      })
      .catch((error) => {
        console.error("Error checking achievements:", error);
      });
  };

  return (
    <AppLayout>
      <div className="space-y-8">
        <div className="flex flex-col sm:flex-row justify-between items-center space-y-4 sm:space-y-0">
          <div className="flex items-center space-x-2">
            <ListChecks className="h-8 w-8 text-primary" />
            <h1 className="text-3xl font-bold font-headline text-white">
              Transacciones
            </h1>
          </div>
          <div className="flex items-center space-x-2">
            <Popover>
              <PopoverTrigger asChild>
                <Button variant="outline">
                  <Filter className="mr-2 h-4 w-4" /> Filtros
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-80 bg-card" align="end">
                <div className="grid gap-4">
                  <div className="space-y-2">
                    <h4 className="font-medium leading-none font-headline">
                      Filtros
                    </h4>
                    <p className="text-sm text-muted-foreground">
                      Filtrar transacciones por mes o categoria
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
                    disabled={isLoadingFilter}
                  >
                    {isLoadingFilter ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Aplicando...
                      </>
                    ) : (
                      <>
                        <XCircle className="mr-2 h-4 w-4" />
                        Limpiar Filtros
                      </>
                    )}
                  </Button>
                </div>
              </PopoverContent>
            </Popover>
            <Button
              className="bg-primary hover:bg-primary/90 text-primary-foreground"
              onClick={() => openModal()}
              disabled={isLoadingTransaction}
            >
              {isLoadingTransaction ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Procesando...
                </>
              ) : (
                <>
                  <PlusCircle className="mr-2 h-4 w-4" />
                  Agregar Transaccion
                </>
              )}
            </Button>
          </div>
        </div>

        <Card className="shadow-lg">
          <CardHeader>
            <CardTitle>Historial de Transacciones</CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <SortableHeader sortKey="categoria">Categoria</SortableHeader>
                  <SortableHeader sortKey="fecha">Fecha</SortableHeader>
                  <SortableHeader sortKey="motivo">Motivo</SortableHeader>
                  <SortableHeader sortKey="valor">Valor</SortableHeader>
                  <SortableHeader sortKey="tipoGasto">
                    Medio de Pago
                  </SortableHeader>
                  <TableHead className="text-right">Acciones</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {(isLoading || isLoadingFilter || isLoadingDistribution) && (
                  <TableRow>
                    <TableCell
                      colSpan={6}
                      className="text-center text-muted-foreground py-8"
                    >
                      <div className="flex items-center justify-center space-x-2">
                        <Loader2 className="h-4 w-4 animate-spin" />
                        <span>
                          {isLoadingDistribution
                            ? "Distribuyendo ingreso automáticamente..."
                            : isLoadingFilter
                            ? "Aplicando filtros..."
                            : "Cargando transacciones..."}
                        </span>
                      </div>
                    </TableCell>
                  </TableRow>
                )}
                {!isLoading &&
                  !isLoadingFilter &&
                  !isLoadingDistribution &&
                  (transacciones.length === 0 || !transacciones) && (
                    <TableRow>
                      <TableCell
                        colSpan={6}
                        className="text-center text-muted-foreground py-8"
                      >
                        No se encontraron transacciones
                      </TableCell>
                    </TableRow>
                  )}
                {!isLoading &&
                  !isLoadingFilter &&
                  !isLoadingDistribution &&
                  sortedtransacciones.map((transaction, index) => {
                    return (
                      <TableRow
                        key={index}
                        className="hover:bg-muted/50 transition-colors"
                      >
                        <TableCell>
                          <Badge
                            variant={"secondary"}
                            className={"whitespace-nowrap"}
                          >
                            {(() => {
                              const iconPath = payCategories.find(
                                (cat) => cat.value === transaction.categoria
                              )?.iconPath;

                              return (
                                <>
                                  {iconPath && (
                                    <FontAwesomeIcon
                                      icon={iconPath}
                                      className="mr-2 text-white"
                                    />
                                  )}
                                  {transaction.categoria}
                                </>
                              );
                            })()}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          {format(new Date(transaction.fecha), "MMM dd, yyyy")}
                        </TableCell>
                        <TableCell>{transaction.motivo}</TableCell>
                        <TableCell className="font-medium">
                          ${transaction.valor.toFixed(2)}
                        </TableCell>
                        <TableCell className="max-w-[200px] truncate">
                          {transaction.tipoGasto}
                        </TableCell>
                        <TableCell className="text-right">
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8"
                            onClick={() => editRow(transaction)}
                          >
                            <Edit3 />
                          </Button>
                          {transaction.categoria === "Ingreso de Dinero" &&
                            !transaction.distribuida && (
                              <Button
                                variant="ghost"
                                size="icon"
                                className="h-8 w-8 text-primary hover:text-primary/80"
                                onClick={() =>
                                  handleDistributeIncome(transaction)
                                }
                                title="Distribuir automáticamente según presupuestos"
                                disabled={isLoadingDistribution}
                              >
                                {isLoadingDistribution ? (
                                  <Loader2 className="h-4 w-4 animate-spin" />
                                ) : (
                                  <svg
                                    xmlns="http://www.w3.org/2000/svg"
                                    width="16"
                                    height="16"
                                    viewBox="0 0 24 24"
                                    fill="none"
                                    stroke="currentColor"
                                    strokeWidth="2"
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                  >
                                    <path d="M3 3v18h18" />
                                    <path d="m19 9-5 5-4-4-3 3" />
                                  </svg>
                                )}
                              </Button>
                            )}
                          {transaction.categoria === "Ingreso de Dinero" &&
                            transaction.distribuida && (
                              <Badge variant="secondary" className="text-xs">
                                Ya distribuida
                              </Badge>
                            )}
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8 text-destructive hover:text-destructive/80"
                            onClick={() => deleteRow(transaction.id)}
                            disabled={isLoadingDelete}
                          >
                            {isLoadingDelete ? (
                              <Loader2 className="h-4 w-4 animate-spin" />
                            ) : (
                              <Trash2 />
                            )}
                          </Button>
                        </TableCell>
                      </TableRow>
                    );
                  })}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
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
        isLoading={isLoadingTransaction}
      />

      <AutomaticDistribution
        isVisible={showDistributionModal}
        transaction={transactionToDistribute}
        onDistribute={handleConfirmDistribution}
        onCancel={handleCancelDistribution}
      />
    </AppLayout>
  );
}
