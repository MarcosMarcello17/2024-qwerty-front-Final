import Modal from "react-modal";
import "./styles/ModalForm.css";
import ModalCrearGrupo from "./ModalCrearGrupo";
import React, { useEffect, useState } from "react";
import ModalVerDetallesGrupo from "./ModalVerDetallesGrupo";

function ModalGastosCompartidos({
  isModalGastosOpen,
  closeModalGastos,
  payCategories,
  getTransacciones,
}) {
  const [modalError, setModalError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [grupos, setGrupos] = useState([]); // Estado para grupos
  const [isModalDetallesGrupoOpen, setIsModalDetallesGrupoOpen] =
    useState(false);
  const closeModalDetallesGrupo = () => setIsModalDetallesGrupoOpen(false);
  const [grupoSeleccionado, setGrupoSeleccionado] = useState(null); // Estado para el nombre del grupo seleccionado
  const [grupoAEliminar, setGrupoAEliminar] = useState(null);
  const [grupoAAgregar, setGrupoAAgregar] = useState(null);
  const [isModalEliminarOpen, setIsModalEliminarOpen] = useState(false);
  const [isModalMiembrosOpen, setIsModalMiembrosOpen] = useState(false);
  const [miembros, setMiembros] = useState([]);
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
  const fetchMiembros = async (grupo) => {
    const token = localStorage.getItem("token");
    try {
      const response = await fetch(
        `http://localhost:8080/api/grupos/${grupo.id}/usuarios`,
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

  useEffect(() => {
    if (isModalGastosOpen && !isModalOpen) {
      fetchGrupos(); // Fetch groups when modal opens
    }
  }, [isModalGastosOpen, isModalOpen]);
  useEffect(() => {
    if (!isModalMiembrosOpen) {
      setGrupoAAgregar(null);
    }
  }, [isModalMiembrosOpen]);

  const closeWindow = () => {
    setModalError("");
    closeModalGastos();
  };
  const openModalDetallesGrupo = (grupo) => {
    const nombreGrupo = grupo.nombre;
    const idGrupo = grupo.id;
    const estado = grupo.estado;
    setGrupoSeleccionado({ nombre: nombreGrupo, id: idGrupo, estado: estado });
    setIsModalDetallesGrupoOpen(true);
  };

  const openModalEliminar = (grupo) => {
    setGrupoAEliminar(grupo);
    setIsModalEliminarOpen(true);
  };

  const confirmDeleteGrupo = async () => {
    const token = localStorage.getItem("token");
    try {
      const response = await fetch(
        `http://localhost:8080/api/grupos/${grupoAEliminar.id}`,
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

  const closeModal = () => {
    setGrupoAAgregar(null);
    setIsModalOpen(false);
  };

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

  return (
    <Modal
      isOpen={isModalGastosOpen}
      onRequestClose={closeModalGastos}
      contentLabel="Mis Gastos Compartidos"
      style={customStyles}
      className="bg-[#000814] shadow-lg p-4 rounded-lg"
    >
      <div className="text-2xl font-bold text-gray-100 text-center mb-4">
        Mis Gastos Compartidos
      </div>
      <div className="flex flex-col flex-grow px-4">
        <div className="bg-[#001d3d] p-4 rounded-lg shadow-lg text-white">
          {/* Display user groups */}
          <div className="mb-4">
            <h3 className="text-lg font-semibold">
              Grupos a los que perteneces:
            </h3>
            {isLoading ? (
              <p>Cargando grupos...</p>
            ) : (
              <ul>
                {grupos.length > 0 ? (
                  grupos.map((grupo) => (
                    <li
                      key={grupo.id}
                      className="py-1 flex justify-between items-center space-x-4"
                    >
                      {/* Nombre del grupo en amarillo */}
                      <span
                        onClick={() => openModalDetallesGrupo(grupo)}
                        className="cursor-pointer bg-yellow-500 hover:bg-yellow-600 text-black px-2 py-1 rounded w-40 text-center"
                      >
                        {grupo.nombre}
                      </span>

                      {/* Botón de miembros en azul */}
                      <button
                        onClick={() => fetchMiembros(grupo)}
                        className="bg-blue-500 text-white hover:bg-blue-600 px-2 py-1 rounded"
                      >
                        Miembros
                      </button>

                      {/* Botón de eliminar grupo en rojo */}
                      <button
                        onClick={() => openModalEliminar(grupo)}
                        className="cursor-pointer bg-red-500 hover:bg-red-600 text-white px-2 py-1 rounded w-40 text-center"
                      >
                        Eliminar grupo
                      </button>
                    </li>
                  ))
                ) : (
                  <li>No perteneces a ningún grupo.</li>
                )}
              </ul>
            )}
          </div>

          {/* Botones Crear Grupo y Cerrar */}
          <div className="flex space-x-4">
            <button
              className="flex-1  bg-[#ffd60a] text-black font-bold py-3 px-4 rounded hover:bg-[#ffc300] transition-colors duration-300 mt-4"
              onClick={() => setIsModalOpen(true)}
            >
              Crear Grupo
            </button>
            <button
              onClick={closeWindow}
              className="flex-1 bg-red-500 text-white font-bold py-3 px-4 rounded hover:bg-red-600 transition-colors duration-300 mt-4"
            >
              Cerrar
            </button>
          </div>
        </div>
      </div>

      {/* Modales adicionales */}
      <ModalCrearGrupo
        isOpen={isModalOpen}
        onRequestClose={() => closeModal()}
        grupoAAgregar={grupoAAgregar ? grupoAAgregar.id : null}
      />

      {grupoSeleccionado && (
        <ModalVerDetallesGrupo
          isModalDetallesGrupoOpen={isModalDetallesGrupoOpen}
          closeModalDetallesGrupo={closeModalDetallesGrupo}
          grupo={grupoSeleccionado}
          setGrupoSeleccionado={setGrupoSeleccionado}
          payCategories={payCategories}
          setGrupos={setGrupos}
          grupos={grupos}
          getTransacciones={getTransacciones}
        />
      )}

      <Modal
        isOpen={isModalEliminarOpen}
        onRequestClose={() => setIsModalEliminarOpen(false)}
        contentLabel="Confirmar eliminación de grupo"
        style={customStyles}
        className="bg-gray-950 shadow-lg p-4 rounded-lg"
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
          className="bg-gray-300 text-gray-800 font-bold py-3 px-4 rounded hover:bg-gray-400 transition-colors duration-300"
        >
          Cancelar
        </button>
      </Modal>

      {/* Modal para mostrar miembros */}
      <Modal
        isOpen={isModalMiembrosOpen}
        onRequestClose={() => {
          setIsModalMiembrosOpen(false);
          setGrupoAAgregar(null);
        }}
        contentLabel="Lista de Miembros"
        style={customStyles}
        className="bg-gray-950 shadow-lg p-4 rounded-lg"
      >
        <h2 className="text-2xl font-bold text-gray-100 text-center mb-4">
          Miembros del grupo
        </h2>
        <div className="flex flex-col flex-grow px-4">
          <div className="bg-gray-800 p-4 rounded-lg shadow-lg text-white">
            <h3 className="text-lg font-semibold mb-2">Miembros:</h3>
            <ul>
              {miembros.length > 0 ? (
                miembros.map((miembro) => (
                  <li key={miembro.id} className="py-1">
                    {miembro.email}
                  </li>
                ))
              ) : (
                <li className="text-gray-400">
                  No hay miembros en este grupo.
                </li>
              )}
            </ul>
            <div className="flex justify-end gap-4 mt-4">
              {grupoAAgregar && grupoAAgregar.estado && (
                <button
                  onClick={() => setIsModalOpen(true)}
                  className="flex-1 bg-blue-500 text-white font-bold py-3 px-4 rounded hover:bg-blue-600 transition-colors duration-300 mt-4"
                >
                  Invitar Usuarios
                </button>
              )}
              <button
                onClick={() => setIsModalMiembrosOpen(false)}
                className="flex-1 bg-red-500 text-white font-bold py-3 px-4 rounded hover:bg-red-600 transition-colors duration-300 mt-4"
              >
                Cerrar
              </button>
            </div>
          </div>
        </div>
      </Modal>
    </Modal>
  );
}

export default ModalGastosCompartidos;
