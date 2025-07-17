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
import { createCatAPI } from "@/functions/createCatAPI";
import { fas } from "@fortawesome/free-solid-svg-icons";

export default function TransactionsPage() {
  library.add(fas);
  const navigate = useNavigate();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [transacciones, setTransacciones] = useState([]);
  const [categoriaSeleccionada, setCategoriaSeleccionada] = useState("Todas");
  const [filtroMes, setFiltroMes] = useState("");
  const [filtroAno, setFiltroAno] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [transaccionesCargadas, setTransaccionesCargadas] = useState(false);
  const [isLoadingFilter, setIsLoadingFilter] = useState(false);
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
    }
    return ret.error;
  };
  const handleGroupChange = (group) => setSelectedGroup(group);

  useEffect(() => {
    getTransacciones(categoriaSeleccionada);
  }, [categoriaSeleccionada, filtroMes, filtroAno]);
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
      fetchPersonalCategorias();
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

  const sortedtransacciones = React.useMemo(() => {
    if (sortConfig.key) {
      const sorted = [...transacciones].sort((a, b) => {
        const aValue = a[sortConfig.key];
        const bValue = b[sortConfig.key];

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

  const handleSort = (key) => {
    setSortConfig((prevConfig) => ({
      key,
      direction:
        prevConfig.key === key && prevConfig.direction === "asc"
          ? "desc"
          : "asc",
    }));
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
            <Button variant="outline">
              <Filter className="mr-2 h-4 w-4" /> Filtrar
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
                  <TableHead>Fecha</TableHead>
                  <TableHead>Motivo</TableHead>
                  <TableHead>Valor</TableHead>
                  <TableHead>Amount</TableHead>
                  <TableHead>Categoria</TableHead>
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
                {sortedtransacciones.map((transaction, index) => {
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
                      <TableCell>
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
    </AppLayout>
  );
}
