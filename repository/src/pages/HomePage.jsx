import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import TransaccionesTable from "./components/TransaccionesTable";
import ModalForm from "./components/ModalForm";
import "./styles/HomePage.css";
import AlertPending from "./components/AlertPending";
import MonthlyGraphic from "./components/MonthlyGraphic";
import Header from "./components/Header";
import ModalAskPayment from "./components/ModalAskPayment";
import ModalSendPayment from "./components/ModalSendPayment";
import PresupuestosWidget from "./components/PresupuestosWidget";
import AchievementNotification from "./components/AchievementNotification";

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
  const [filtroAno, setFiltroAno] = useState("2025"); //
  const [filterEmpty, setFilterEmpty] = useState(false);
  const [loadGraphic, setLoadGraphic] = useState(true);
  const [grupos, setGrupos] = useState([]);
  const [selectedGroup, setSelectedGroup] = useState(null);
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

  const fetchGrupos = async () => {
    setIsLoading(true);
    const token = localStorage.getItem("token");
    try {
      const response = await fetch(
        "http://localhost:8080/api/grupos/mis-grupos",
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
    console.log("buscando pendientes");
    try {
      const response = await fetch(
        "http://localhost:8080/api/transaccionesPendientes/user",
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

      const data = await response.json();
      if (data[0] != null) {
        setTranPendiente(data[0]);
        console.log(data[0]);
        console.log("hay data");
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
        "http://localhost:8080/api/personal-tipo-gasto",
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
        "http://localhost:8080/api/transacciones/userTest",
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
      let url = `http://localhost:8080/api/transacciones/user/filter`;
      if (filtrado !== "Todas" || filtroMes || filtroAno) {
        url += `?categoria=${filtrado}`;
        if (filtroMes) url += `&mes=${filtroMes}`;
        if (filtroAno) url += `&anio=${filtroAno}`;
      }
      try {
        const response = await fetch(url, {
          method: "GET",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        if (!response.ok) {
          throw new Error(`Error: ${response.status}`);
        }

        const data = await response.json();
        setTransacciones(data.transaccionesFiltradas);
        if (filtrado !== "Todas") {
          setTransaccionesSinFiltroCat(data.transaccionesSinFiltrarCat);
        }
      } catch (err) {
        console.error("Error fetching transactions:", err);
      } finally {
        setIsLoadingFilter(false);
        setTransaccionesCargadas(true);
      }
      fetchPersonalCategorias();
      showTransactionsPendientes();
    } else {
      console.log("deberia redirec");
      navigate("/");
    }
    setIsLoading(false);
  };

  const fetchPersonalCategorias = async () => {
    setIsLoading(true);
    const token = localStorage.getItem("token");
    try {
      const response = await fetch(
        "http://localhost:8080/api/personal-categoria",
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
    openModal();
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
    const url = `http://localhost:8080/api/transaccionesPendientes/${resp}?id_reserva=${id_reserva}`;
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
  const aceptarTransaccion = async (transaccion, categoria, tipoGasto) => {
    const token = localStorage.getItem("token");
    setTransaccionesCargadas(false);
    let url = "http://localhost:8080/api/transacciones";
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
      url = "http://localhost:8080/api/grupos/agregar-usuario";
      const grupoId = transaccion.grupoId;
      console.log("este es el id " + grupoId);
      console.log(transaccion);
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
  const agregarTransaccion = async (e, categoria) => {
    e.preventDefault();
    const token = localStorage.getItem("token");
    let bodyJson = "";
    let url = "";
    setTransaccionesCargadas(false);
    if (selectedGroup == null) {
      bodyJson = JSON.stringify({ motivo, valor, fecha, categoria, tipoGasto });
      url = edit
        ? `http://localhost:8080/api/transacciones/${transaccionId}`
        : "http://localhost:8080/api/transacciones";
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
        ? `http://localhost:8080/api/grupos/transaccion/${transaccionId}`
        : "http://localhost:8080/api/grupos/transaccion";
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
        console.log("la respuesta fue ok");
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
      console.log("la respuesta fue error");
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
    fetch("http://localhost:8080/api/users/userTransaction", {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
    })
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

  const deleteRow = async (id) => {
    const token = localStorage.getItem("token");
    setTransaccionesCargadas(false);
    try {
      const response = await fetch(
        `http://localhost:8080/api/transacciones/${id}`,
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
      setTransaccionesCargadas(true);
    }
  };
  const eliminarTransaccionPendiente = async (id) => {
    const token = localStorage.getItem("token");
    try {
      const response = await fetch(
        `http://localhost:8080/api/transaccionesPendientes/${id}`,
        {
          method: "DELETE",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      if (response.ok) {
        showTransactionsPendientes();
      } else {
        //poner algun error?
      }
    } catch (err) {
      //poner algun error?
      //setError("Ocurrió un error. Intenta nuevamente.");
    }
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
    const token = localStorage.getItem("token");
    try {
      const response = await fetch(
        `http://localhost:8080/api/personal-tipo-gasto`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify(inputValue),
        }
      );

      if (response.ok) {
        const newTipoGasto = await response.json();
        const newOption = {
          label: newTipoGasto.nombre,
          value: newTipoGasto.nombre,
        };
        setPayOptions((prevOptions) => [...prevOptions, newOption]);
        setSelectedPayMethod(newOption);
        setTipoGasto(newTipoGasto.nombre);
      }
    } catch (error) {
      console.error("Error al agregar el tipo de gasto personalizado:", error);
    }
  };
  const handleCreateCat = async (nombre, icono) => {
    console.log("entre      ");
    const token = localStorage.getItem("token");
    if (!nombre || !icono) {
      console.error("Nombre y icono son obligatorios");
      return;
    }
    try {
      const inputValue = {
        nombre: nombre,
        iconPath: icono,
      };
      const response = await fetch(
        "http://localhost:8080/api/personal-categoria",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify(inputValue),
        }
      );
      if (response.ok) {
        const newCategoria = await response.json();
        const newOption = {
          label: newCategoria.nombre,
          value: newCategoria.nombre,
          iconPath: newCategoria.iconPath,
        };
        setPayCategories((prevOptions) => [...prevOptions, newOption]);
        console.log(payCategories);
        setSelectedCategory(newOption);
        setCategoria(newCategoria.nombre);
      } else {
        const errorMessage = await response.text();
        console.error("Error al agregar categoria:", errorMessage);
        console.log("la categoria existeeeeeeeeeee");
        return "La categoria ya existe";
      }
    } catch (error) {
      console.error("Error al agregar categoria personalizada:", error);
      return "";
    }
    return "";
  };
  const handleChange = (event) => {
    setIsLoadingFilter(true);
    let cat = event.target.value;
    setCategoriaSeleccionada(cat);
    getTransacciones(cat);
  };
  const resetFilters = () => {
    setCategoriaSeleccionada("Todas");
    setFiltroAno("2024");
    setFiltroMes("");
  };
  const refershTransacciones = (transaccionNueva) => {
    const updatedTransacciones = [...transacciones, transaccionNueva];
    updatedTransacciones.sort((a, b) => new Date(b.fecha) - new Date(a.fecha));
    setTransacciones(updatedTransacciones);
  };
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isFiltersOpen, setIsFiltersOpen] = useState(false);
  return (
    <div className="container min-h-screen min-w-full max-w-full bg-[#000814]">
      <Header
        payCategories={payCategories}
        setPayCategories={setPayCategories}
        fetchPersonalCategorias={fetchPersonalCategorias}
        getTransacciones={getTransacciones}
        openModal={openModal}
      />
      <div className="flex justify-end w-full p-4">
        <button
          onClick={() => setIsFiltersOpen(!isFiltersOpen)}
          className="btn btn-warning btn-sm w-full focus:bg-[#ffc300]"
        >
          {isFiltersOpen ? "Ocultar Filtros" : "Mostrar Filtros"}
        </button>
      </div>

      {isFiltersOpen && (
        <div className="flex flex-col md:flex-row items-start md:items-center md:gap-6 mb-1">
          <div className="flex flex-col md:flex-row md:items-center gap-3 w-full">
            <div className="flex flex-col w-full md:w-1/3">
              <select
                id="categorias"
                value={categoriaSeleccionada}
                onChange={handleChange}
                className="block select select-bordered w-full max-w-full"
              >
                {categoriasConTodas.map((cat) => (
                  <option key={cat.value} value={cat.value}>
                    {cat.label}
                  </option>
                ))}
              </select>
            </div>

            {/* Select de Mes */}
            <div className="flex flex-col w-full md:w-1/3">
              <select
                value={filtroMes}
                onChange={(e) => setFiltroMes(e.target.value)}
                className="select select-bordered w-full max-w-full"
              >
                <option value="">Mes</option>
                <option value="01">Enero</option>
                <option value="02">Febrero</option>
                <option value="03">Marzo</option>
                <option value="04">Abril</option>
                <option value="05">Mayo</option>
                <option value="06">Junio</option>
                <option value="07">Julio</option>
                <option value="08">Agosto</option>
                <option value="09">Septiembre</option>
                <option value="10">Octubre</option>
                <option value="11">Noviembre</option>
                <option value="12">Diciembre</option>
              </select>
            </div>

            <div className="flex flex-col w-full md:w-1/3">
              <select
                value={filtroAno}
                onChange={(e) => setFiltroAno(e.target.value)}
                className="select select-bordered w-full max-w-full"
              >
                <option value="">Todos los años</option>{" "}
                <option value="2021">2021</option>
                <option value="2022">2022</option>
                <option value="2023">2023</option>
                <option value="2024">2024</option>
                <option value="2025">2025</option>
                <option value="2026">2026</option>
              </select>
            </div>

            <button
              onClick={() => resetFilters()}
              className="btn btn-warning w-full md:w-auto mt-2 md:mt-0"
            >
              Borrar filtros
            </button>
          </div>
        </div>
      )}
      <>
        {isLoading && (
          <div className="fixed inset-0 bg-[#000814] bg-opacity-500 flex justify-center items-center z-50">
            <div className="flex items-center justify-center">
              <div className="animate-spin border-t-4 border-[#0001d3d]-500 border-solid w-16 h-16 rounded-full"></div>
            </div>
          </div>
        )}
        {transaccionesCargadas && (
          <PresupuestosWidget
            transacciones={
              categoriaSeleccionada != "Todas"
                ? transaccionesSinFiltroCat
                : transacciones
            }
            filtroMes={filtroMes}
            filtroAno={filtroAno}
          />
        )}

        {!showNoTransactions && (
          <>
            <div className="flex items-center">
              <h2 className="text-xl md:text-2xl py-2 font-bold text-gray-100">
                Monto por Categoria
              </h2>
            </div>

            {!loadGraphic && (
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
          </>
        )}

        {transaccionesCargadas && (
          <PresupuestosWidget transacciones={transacciones} />
        )}
        {/* Cargando Spinner */}
        {isLoadingFilter ? (
          <div className="flex justify-center items-center">
            <svg
              className="animate-spin h-8 w-8 md:h-10 md:w-10 text-[#ffd60a]"
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
            >
              <circle
                className="opacity-25"
                cx="12"
                cy="12"
                r="10"
                stroke="currentColor"
                strokeWidth="4"
              ></circle>
              <path
                className="opacity-75"
                fill="currentColor"
                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.965 7.965 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
              ></path>
            </svg>
            <span className="text-[#ffd60a] font-bold ml-2">Cargando...</span>
          </div>
        ) : (
          <>
            <TransaccionesTable
              transactions={transacciones}
              payCategories={payCategories}
              editRow={editRow}
              deleteRow={deleteRow}
              onTableEmpty={() => setShowNoTransactions(true)}
              onTransactions={() => setShowNoTransactions(false)}
            />

            {/* Si no hay transacciones */}
            {showNoTransactions && (
              <div className="flex flex-col justify-center items-center mb-0">
                {(categoriaSeleccionada !== "Todas" ||
                  filtroAno !== "2024" ||
                  filtroMes !== "") && (
                  <p className="text-red-500 font-bold mb-4">
                    Su filtro no coincide con ninguna transacción
                  </p>
                )}
                <button
                  className="bg-[#ffd60a] text-gray-950 font-extrabold py-4 px-8 rounded-lg hover:bg-[#ffc300]"
                  onClick={openModal}
                >
                  Ingrese una transacción
                </button>
              </div>
            )}
          </>
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
        <ModalAskPayment payCategories={payCategories} />
        <ModalSendPayment
          payCategories={payCategories}
          refreshTransacciones={refershTransacciones}
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
      </>
    </div>
  );
}

export default HomePage;
