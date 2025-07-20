import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Users,
  PlusCircle,
  Edit3,
  Trash2,
  Eye,
  FileText,
  DollarSign,
  Trash,
  UserPlus,
} from "lucide-react";
import React, { useEffect, useState } from "react";
import Modal from "react-modal";
import AppLayout from "./AppLayout";
import ModalCrearGrupo from "./components/ModalCrearGrupo";
import { Input } from "@/components/ui/input";
import ModalVerDetallesGrupo from "./components/ModalVerDetallesGrupo";

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
    width: "90vw",
    maxWidth: "550px",
    maxHeight: "80vh",
    margin: "auto",
    display: "flex",
    flexDirection: "column",
    gap: "1.5rem",
    overflowY: "auto",
    zIndex: 1001,
  },
};

export default function GroupsPage() {
  const [grupoAAgregar, setGrupoAAgregar] = useState(null);
  const [grupoSeleccionado, setGrupoSeleccionado] = useState({});
  const [grupos, setGrupos] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [addGrupoModalOpen, setAddGrupoModalOpen] = useState(false);
  const [error, setError] = useState("");
  const [miembros, setMiembros] = useState([]);
  const [isModalMiembrosOpen, setIsModalMiembrosOpen] = useState(false);
  const [newMemberEmail, setNewMemberEmail] = useState("");
  const [isModalEliminarOpen, setIsModalEliminarOpen] = useState(false);
  const [grupoAEliminar, setGrupoAEliminar] = useState({});
  const [isModalDetallesGrupoOpen, setIsModalDetallesGrupoOpen] =
    useState(false);

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
      setGrupos(data);
    } catch (error) {
      setError("Ocurrió un error al obtener los grupos.");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchGrupos();
  }, []);

  const handleAddMember = async () => {
    setIsLoading(true);
    if (newMemberEmail == "") {
      setError("Debes ingresar al menos un usuario.");
      setIsLoading(false);
      return;
    }
    try {
      // Aquí iría la lógica para crear el grupo usando `grupoNombre` y `usuarios`
      const response = await fetch(
        `https://two024-qwerty-back-final-marcello.onrender.com/api/grupos/${grupoAAgregar}/agregar-usuario`,
        {
          // Ajusta la URL según tu endpoint
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            usuarios: usuarios,
          }),
        }
      );

      if (!response.ok) {
        throw new Error("Error al crear el grupo.");
      }
      setUsuarios([]);
      setError("");
      onRequestClose();
    } catch (error) {
      setError("Ocurrió un error al procesar la solicitud.");
    } finally {
      setIsLoading(false);
    }
  };

  const fetchMiembros = async (grupo) => {
    const token = localStorage.getItem("token");
    try {
      const response = await fetch(
        `https://two024-qwerty-back-final-marcello.onrender.com/api/grupos/${grupo.id}/usuarios`,
        {
          method: "GET",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (!response.ok) {
        throw new Error("Error al obtener los miembros del grupo.");
      }

      const data = await response.json();
      setMiembros(data);
      setIsModalMiembrosOpen(true);
      setGrupoAAgregar(grupo);
    } catch (error) {
      setModalError("Ocurrió un error al obtener los miembros del grupo.");
    }
  };

  const openModalDetallesGrupo = (grupo) => {
    const nombreGrupo = grupo.nombre;
    const idGrupo = grupo.id;
    const estado = grupo.estado;
    setGrupoSeleccionado({ nombre: nombreGrupo, id: idGrupo, estado: estado });
    setIsModalDetallesGrupoOpen(true);
  };
  const closeModal = () => {
    setAddGrupoModalOpen(false);
  };

  const confirmDeleteGrupo = async () => {
    const token = localStorage.getItem("token");
    try {
      const response = await fetch(
        `https://two024-qwerty-back-final-marcello.onrender.com/api/grupos/${grupoAEliminar.id}`,
        {
          method: "DELETE",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (response.ok) {
        setGrupos(grupos.filter((grupo) => grupo.id !== grupoAEliminar.id));
        setIsModalEliminarOpen(false);
      } else {
        setModalError("Error al eliminar el grupo.");
      }
    } catch (error) {
      setModalError("Ocurrió un error al intentar eliminar el grupo.");
    }
  };

  const openModalEliminar = (grupo) => {
    setGrupoAEliminar(grupo);
    setIsModalEliminarOpen(true);
  };

  return (
    <AppLayout>
      <div className="space-y-8">
        <div className="flex flex-col sm:flex-row justify-between items-center space-y-4 sm:space-y-0">
          <div className="flex items-center space-x-2">
            <Users className="h-8 w-8 text-primary" />
            <h1 className="text-3xl font-bold font-headline text-white">
              Grupos
            </h1>
          </div>
          <Button
            className="bg-primary hover:bg-primary/90 text-primary-foreground"
            onClick={() => setAddGrupoModalOpen(true)}
          >
            <PlusCircle className="mr-2 h-4 w-4" /> Crear Grupo
          </Button>
        </div>

        <div className="flex flex-col flex-grow px-4">
          {/* Display user groups */}
          <div className="mb-4">
            {isLoading ? (
              <p>Cargando grupos...</p>
            ) : (
              <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                {grupos.length > 0 ? (
                  grupos.map((grupo) => (
                    <Card
                      key={grupo.id}
                      className="shadow-lg hover:shadow-xl transition-shadow duration-300 flex flex-col justify-between"
                    >
                      <CardHeader>
                        <div className="flex justify-between items-start">
                          <CardTitle className="font-headline text-lg">
                            {grupo.nombre}
                          </CardTitle>
                        </div>
                      </CardHeader>
                      <CardContent className="space-y-2">
                        <Button
                          className="flex items-center text-sm text-muted-foreground bg-transparent hover:text-black"
                          onClick={() => fetchMiembros(grupo)}
                        >
                          <Users className="mr-2 h-4 w-4" /> Miembros
                        </Button>
                      </CardContent>
                      <CardFooter className="flex justify-between gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => openModalDetallesGrupo(grupo)}
                        >
                          <Eye className="mr-2 h-4 w-4" /> Ver grupo
                        </Button>
                        <Button
                          variant="destructive"
                          size="sm"
                          onClick={() => openModalEliminar(grupo)}
                        >
                          <Trash className="mr-2 h-4 w-4" /> Eliminar Grupo
                        </Button>
                      </CardFooter>
                    </Card>
                  ))
                ) : (
                  <Card className="text-center py-12">
                    <CardHeader>
                      <Users className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
                      <CardTitle className="font-headline">
                        No hay ningun grupo
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <CardDescription>
                        Crea un grupo para compartir gastos con amigos o
                        familiares
                      </CardDescription>
                    </CardContent>
                    <CardFooter className="justify-center">
                      <Button
                        className="bg-primary hover:bg-primary/90 text-primary-foreground"
                        onClick={() => setAddGrupoModalOpen(true)}
                      >
                        <PlusCircle className="mr-2 h-4 w-4" /> Crear Grupo
                      </Button>
                    </CardFooter>
                  </Card>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
      <ModalCrearGrupo
        isOpen={addGrupoModalOpen}
        onRequestClose={() => closeModal()}
        grupoAAgregar={grupoAAgregar ? grupoAAgregar.id : null}
      />

      {grupoSeleccionado && (
        <ModalVerDetallesGrupo
          isModalDetallesGrupoOpen={isModalDetallesGrupoOpen}
          closeModalDetallesGrupo={() => setIsModalDetallesGrupoOpen(false)}
          grupo={grupoSeleccionado}
          setGrupoSeleccionado={setGrupoSeleccionado}
          setGrupos={setGrupos}
          grupos={grupos}
        />
      )}

      <Modal
        isOpen={isModalMiembrosOpen}
        onRequestClose={() => {
          setIsModalMiembrosOpen(false);
          setGrupoAAgregar(null);
        }}
        contentLabel="Lista de Miembros"
        style={customStyles}
        className="bg-card shadow-lg p-4 rounded-lg"
      >
        <h2 className="font-headline font-bold">Miembros del grupo</h2>
        <div className="flex flex-col flex-grow px-4">
          <ul>
            {miembros.length > 0 ? (
              <div className="mt-2 space-y-1">
                <p className="text-sm text-muted-foreground">Miembros:</p>
                <ul className="flex flex-wrap gap-2">
                  {miembros.map((miembro) => (
                    <li
                      key={miembro}
                      className="flex items-center gap-1 bg-muted px-2 py-1 rounded-md text-sm"
                    >
                      {miembro.email}
                    </li>
                  ))}
                </ul>
              </div>
            ) : (
              <li className="text-gray-400">No hay miembros en este grupo.</li>
            )}
          </ul>
          <div className="flex justify-end gap-4 mt-4">
            {grupoAAgregar && grupoAAgregar.estado && (
              <Button
                onClick={() => setAddGrupoModalOpen(true)}
                className="flex-1 bg-primary text-black  font-bold py-3 px-4 rounded transition-colors duration-300 mt-4"
              >
                Invitar Usuarios
              </Button>
            )}
            <Button
              onClick={() => setIsModalMiembrosOpen(false)}
              className="flex-1 bg-red-500 text-white font-bold py-3 px-4 rounded hover:bg-red-600 transition-colors duration-300 mt-4"
            >
              Cerrar
            </Button>
          </div>
        </div>
      </Modal>

      <Modal
        isOpen={isModalEliminarOpen}
        onRequestClose={() => setIsModalEliminarOpen(false)}
        contentLabel="Confirmar eliminación de grupo"
        style={customStyles}
        className="bg-card shadow-lg p-4 rounded-lg"
      >
        <h2 className="text-2xl font-bold text-gray-100 text-center mb-4">
          ¿Está seguro que quiere eliminar el grupo?
        </h2>
        <p className="text-gray-300 mb-6 text-center">
          Se eliminarán toda la información del grupo para todos los miembros.
        </p>
        <button
          onClick={confirmDeleteGrupo}
          className="bg-red-500 text-white font-bold py-3 px-4 rounded hover:bg-red-600 transition-colors duration-300"
        >
          Eliminar grupo
        </button>
        <button
          onClick={() => setIsModalEliminarOpen(false)}
          className="bg-background text-white font-bold py-3 px-4 rounded hover:bg-primary hover:text-black transition-colors duration-300"
        >
          Cancelar
        </button>
      </Modal>
    </AppLayout>
  );
}
