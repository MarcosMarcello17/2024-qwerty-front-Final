/**
 * No funciona la tabla de gastos grupales
 */
import Modal from "react-modal";
import "./styles/ModalForm.css";
import { useEffect, useState } from "react";
import ModalForm from "./ModalForm";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Edit3, Trash2 } from "lucide-react";
import { format } from "date-fns";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";

import { library } from "@fortawesome/fontawesome-svg-core";
import { fas } from "@fortawesome/free-solid-svg-icons";

function ModalVerDetallesGrupo({
  isModalDetallesGrupoOpen,
  closeModalDetallesGrupo,
  grupo,
  setGrupoSeleccionado,
  setGrupos,
  grupos,
}) {
  library.add(fas);
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
  const [transacciones, setTransacciones] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [deudas, setDeudas] = useState([]);
  const [total, setTotal] = useState(0);
  const [edit, setEdit] = useState(false);
  const [valor, setValor] = useState("");
  const [motivo, setMotivo] = useState("");
  const [payOptions, setPayOptions] = useState([
    { value: "Tarjeta de credito", label: "Tarjeta de credito" },
    { value: "Tarjeta de Debito", label: "Tarjeta de debito" },
    { value: "Efectivo", label: "Efectivo" },
  ]);
  const [selectedPayMethod, setSelectedPayMethod] = useState({
    value: "Efectivo",
    label: "Efectivo",
  });
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [transaccionId, setTransaccionId] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [fecha, setFecha] = useState(new Date().toISOString().split("T")[0]);
  const [tipoGasto, setTipoGasto] = useState("Efectivo");
  const [categoria, setCategoria] = useState("");

  const customStyles = {
    overlay: {
      position: "fixed",
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      backgroundColor: "rgba(0, 0, 0, 0.75)",
      zIndex: 1000,
      display: "flex",
      justifyContent: "center",
      alignItems: "center",
    },
    content: {
      padding: "2rem",
      borderRadius: "0.75rem",
      width: "100vw",
      maxWidth: "700px",
      maxHeight: "100vh", // Limita la altura del modal
      margin: "auto",
      display: "flex",
      flexDirection: "column",
      gap: "1.5rem",
      overflowY: "auto", // Habilita scroll si el contenido excede el tamaño
      zIndex: 1001,
    },
  };
  const customSelectStyles = {
    control: (provided) => ({
      ...provided,
      backgroundColor: "#111827",
      color: "white",
    }),
    menu: (provided) => ({
      ...provided,
      backgroundColor: "#111827",
    }),
    option: (provided, state) => ({
      ...provided,
      backgroundColor: state.isSelected ? "#eab308" : "#111827",
      color: state.isSelected ? "black" : "white",
    }),
    singleValue: (provided) => ({
      ...provided,
      color: "white",
    }),
    placeholder: (provided) => ({
      ...provided,
      color: "white",
    }),
    input: (provided) => ({
      ...provided,
      color: "white",
    }),
    indicatorSeparator: (provided) => ({
      ...provided,
      backgroundColor: "transparent",
    }),
    dropdownIndicator: (provided) => ({
      ...provided,
      color: "white",
    }),
  };
  const fetchPersonalTipoGastos = async () => {
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
    }
  };
  const fetchTransaccionesDelGrupo = async () => {
    setIsLoading(true);
    const token = localStorage.getItem("token");
    let url = `https://two024-qwerty-back-final-marcello.onrender.com/api/grupos/${grupo.id}/transacciones`;
    try {
      const response = await fetch(url, {
        method: "GET",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        setIsLoading(false);
        throw new Error(`Error: ${response.status}`);
      }

      const data = await response.json();
      setTransacciones(data);
      setIsLoading(false);
    } catch (err) {
      setIsLoading(false);
      console.error("Error fetching transactions:", err);
    }
    //fetchPersonalCategorias();
  };
  useEffect(() => {
    if (isModalDetallesGrupoOpen) {
      fetchPersonalCategorias();
      fetchTransaccionesDelGrupo();
      fetchPersonalTipoGastos();
    }
  }, [isModalDetallesGrupoOpen]);

  useEffect(() => {
    if (!grupo.estado && transacciones.length > 0) {
      calcularDeudas();
    }
  }, [transacciones, grupo.estado]);

  const closeWindow = () => {
    setDeudas([]);
    closeModalDetallesGrupo();
  };

  const calcularDeudas = () => {
    const usuariosGastos = {};
    // Agrupamos el gasto total por usuario
    transacciones.forEach(({ valor, users }) => {
      if (usuariosGastos[users]) {
        usuariosGastos[users] += valor;
      } else {
        usuariosGastos[users] = valor;
      }
    });
    const totalGastos = Object.values(usuariosGastos).reduce(
      (a, b) => a + b,
      0
    );
    const gastoPorPersona = totalGastos / Object.keys(usuariosGastos).length;
    const deudasCalculadas = [];
    // Dividir usuarios en deudores y acreedores
    const deudores = [];
    const acreedores = [];
    Object.entries(usuariosGastos).forEach(([usuario, gasto]) => {
      const diferencia = gastoPorPersona - gasto;
      if (diferencia > 0) {
        // Usuario debe dinero
        deudores.push({ usuario, cantidad: diferencia });
      } else if (diferencia < 0) {
        // Usuario tiene exceso de gasto (acreedor)
        acreedores.push({ usuario, cantidad: -diferencia });
      }
    });
    // Distribuir deudas entre deudores y acreedores
    deudores.forEach((deudor) => {
      let cantidadDeuda = deudor.cantidad;
      acreedores.forEach((acreedor) => {
        if (cantidadDeuda <= 0) return; // La deuda ya está saldada
        const cantidadAPagar = Math.min(cantidadDeuda, acreedor.cantidad);
        // Crear la descripción de la deuda
        deudasCalculadas.push(
          `${deudor.usuario} le debe $${cantidadAPagar.toFixed(2)} a ${
            acreedor.usuario
          }`
        );
        // Actualizar cantidades pendientes
        cantidadDeuda -= cantidadAPagar;
        acreedor.cantidad -= cantidadAPagar;
      });
    });
    setDeudas(deudasCalculadas);
  };

  const cerrarGrupo = async () => {
    const token = localStorage.getItem("token");
    const url = `https://two024-qwerty-back-final-marcello.onrender.com/api/grupos/${grupo.id}/cerrar`;
    try {
      const response = await fetch(url, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error(`Error: ${response.status}`);
      }
      calcularDeudas();
      setGrupoSeleccionado({
        nombre: grupo.nombre,
        id: grupo.id,
        estado: false,
      });
      setGrupos((grupos) =>
        grupos.map((grupo) =>
          grupo.id === grupo.id ? { ...grupo, estado: false } : grupo
        )
      );
      getTransacciones();
    } catch (error) {
      console.error("Error al cerrar el grupo:", error);
    }
  };
  const openModal = () => {
    setIsModalOpen(true);
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

  const deleteRow = async (id) => {
    const token = localStorage.getItem("token");
    try {
      const response = await fetch(
        `https://two024-qwerty-back-final-marcello.onrender.com/api/grupos/transaccion/${id}`,
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
    }
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
  const agregarTransaccion = async (e, categoria) => {
    e.preventDefault();
    const token = localStorage.getItem("token");
    console.log(transaccionId);
    let url = `https://two024-qwerty-back-final-marcello.onrender.com/api/grupos/transaccion/${transaccionId}`;
    let bodyJson = JSON.stringify({
      motivo,
      valor,
      fecha,
      categoria,
      tipoGasto,
    });
    const method = "PUT";
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
        const updatedTransacciones = transacciones.map((t) =>
          t.id === data.id ? data : t
        );
        updatedTransacciones.sort(
          (a, b) => new Date(b.fecha) - new Date(a.fecha)
        );
        setTransacciones(updatedTransacciones);
        closeModal();
      } else {
        console.log("la respuesta no fue ok");
      }
    } catch (err) {
      console.log("la respuesta fue error");
      console.log(err);
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
        "https://two024-qwerty-back-final-marcello.onrender.com/api/personal-categoria",
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
        return "La categoria ya existe";
      }
    } catch (error) {
      console.error("Error al agregar categoria personalizada:", error);
      return "";
    }
    return "";
  };
  const handleCreateTP = async (inputValue) => {
    const token = localStorage.getItem("token");
    try {
      const response = await fetch(
        `https://two024-qwerty-back-final-marcello.onrender.com/api/personal-tipo-gasto`,
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

  return (
    <Modal
      isOpen={isModalDetallesGrupoOpen}
      onRequestClose={closeModalDetallesGrupo}
      contentLabel="Detalle"
      style={customStyles}
      className="bg-card shadow-lg p-4 rounded-lg min-h-[400px]"
    >
      <div className="text-2xl font-bold text-gray-100 text-center mb-4">
        {grupo.nombre}
      </div>
      <div className="flex flex-col flex-grow px-4">
        {isLoading ? (
          <p>Cargando transacciones...</p>
        ) : transacciones.length > 0 ? (
          <Card className="shadow-lg">
            <CardHeader>
              <CardTitle>Historial de Transacciones</CardTitle>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Categoria</TableHead>
                    <TableHead>Fecha</TableHead>
                    <TableHead>Motivo</TableHead>
                    <TableHead>Valor</TableHead>
                    <TableHead>Medio de Pago</TableHead>
                    <TableHead className="text-right">Acciones</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {(transacciones.length === 0 || !transacciones) && (
                    <TableRow>
                      <TableCell
                        colSpan={7}
                        className="text-center text-muted-foreground py-8"
                      >
                        No se encontraron transacciones
                      </TableCell>
                    </TableRow>
                  )}
                  {transacciones.map((transaction, index) => {
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
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8 text-destructive hover:text-destructive/80"
                            onClick={() => deleteRow(transaction.id)}
                          >
                            <Trash2 />
                          </Button>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        ) : (
          <p>No hay transacciones en este grupo.</p>
        )}
        <div className="flex justify-end gap-4 mt-4">
          {grupo.estado && (
            <button
              onClick={cerrarGrupo}
              className="flex-1 bg-[#ffd60a] text-black font-bold py-3 px-4 rounded hover:bg-[#ffc300] transition-colors duration-300 mt-4"
            >
              Finalizar Evento
            </button>
          )}
          <button
            onClick={closeWindow}
            className="flex-1 bg-red-500 text-white font-bold py-3 px-4 rounded hover:bg-red-600 transition-colors duration-300 mt-4"
          >
            Cerrar
          </button>
        </div>
        {!grupo.estado && (
          <div className="mt-4">
            <h3 className="text-lg font-semibold mb-2">Deudas:</h3>
            {deudas.length > 0 ? (
              <ul>
                {deudas.map((deuda, index) => (
                  <li
                    key={index}
                    className="py-1 text-lg font-medium text-center"
                  >
                    {deuda}
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-gray-400">
                No hay deudas pendientes en este grupo
              </p>
            )}
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
        handleGroupChange={null}
        selectedGroup={grupo}
        grupos={null}
      />
    </Modal>
  );
}

export default ModalVerDetallesGrupo;
