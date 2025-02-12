import React, { useEffect, useState } from "react";
import Modal from "react-modal";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { fas } from "@fortawesome/free-solid-svg-icons";
import { library } from "@fortawesome/fontawesome-svg-core";

const ModalCategoria = ({
  isOpen = false,
  onRequestClose = () => {},
  handleCreateCat = () => {},
  handleEditCat = () => {},
  edit = false,
  editCat = {},
}) => {
  library.add(fas);
  // Estilos del Modal
  const customStyles = {
    overlay: {
      position: "fixed",
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      backgroundColor: "rgba(0, 0, 0, 0.9)", // Fondo semitransparente
      zIndex: 1002,
      display: "flex",
      justifyContent: "center",
      alignItems: "center",
    },
    content: {
      position: "relative",
      width: "90%", // El modal ocupa el 90% del ancho en dispositivos pequeños
      maxWidth: "500px", // Máximo ancho del modal para pantallas grandes
      height: "auto", // Altura automática para ajustarse al contenido
      maxHeight: "90vh", // En pantallas pequeñas, que no exceda el 90% de la altura de la ventana
      padding: "20px", // Padding interno adaptativo
      margin: "auto", // Centrar el modal
      borderRadius: "10px", // Bordes redondeados
      backgroundColor: "#000814", // Fondo oscuro para mantener el estilo
      overflowY: "auto", // Habilitamos scroll si el contenido es demasiado grande
    },
  };

  const [categoriaNombre, setCategoriaNombre] = useState("");
  const [iconoSeleccionado, setIconoSeleccionado] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (edit) {
      setCategoriaNombre(editCat.value || "");
      setIconoSeleccionado(editCat.iconPath || "");
    } /*else {
      setCategoriaNombre("");
      console.log("222");
      setIconoSeleccionado("");
    }*/
  }, [editCat, edit, isOpen]);

  const handleSubmit = async () => {
    setIsLoading(true); // Inicia el estado de carga

    if (!categoriaNombre || !iconoSeleccionado) {
      setError("Debes ingresar un nombre y seleccionar un icono.");
      setIsLoading(false); // Aseguramos que se desactiva isLoading en caso de error
      return;
    }

    let errorMessage = "";
    try {
      if (!edit) {
        errorMessage = await handleCreateCat(
          categoriaNombre,
          iconoSeleccionado
        );
      } else {
        errorMessage = await handleEditCat(
          editCat,
          categoriaNombre,
          iconoSeleccionado
        );
      }

      if (errorMessage !== "") {
        setError(errorMessage);
        setIsLoading(false); // Desactivar loading en caso de error de API
        return;
      }

      // Si todo está bien, limpiamos el estado
      setCategoriaNombre("");
      console.log("333");
      setIconoSeleccionado("");
      setError("");
      onRequestClose();
    } catch (error) {
      setError("Ocurrió un error al procesar la solicitud.");
    } finally {
      setIsLoading(false); // Aseguramos que siempre desactivamos isLoading
    }
  };

  const handleClose = () => {
    setError("");
    setCategoriaNombre("");
    console.log("444");
    setIconoSeleccionado("");
    onRequestClose();
  };

  const iconos = [
    { alt: "faUser", faIcon: "fa-solid fa-user" },
    { alt: "faImage", faIcon: "fa-solid fa-image" },
    { alt: "faStar", faIcon: "fa-solid fa-star" },
    { alt: "faMusic", faIcon: "fa-solid fa-music" },
    { alt: "faHeart", faIcon: "fa-solid fa-heart" },
    { alt: "faCameraRetro", faIcon: "fa-solid fa-camera-retro" },
    { alt: "faCar", faIcon: "fa-solid fa-car" },
    { alt: "faMugHot", faIcon: "fa-solid fa-mug-hot" },
    { alt: "faBook", faIcon: "fa-solid fa-book" },
  ];

  return (
    <Modal
      isOpen={isOpen}
      onRequestClose={onRequestClose}
      contentLabel={edit ? "Editar Categoría" : "Crear Categoría"}
      style={customStyles}
      className="bg-[#000814] text-white p-4 sm:p-2 rounded-lg shadow-lg"
    >
      <h2 className="text-xl sm:text-lg font-bold mb-4">
        {edit ? "Editar Categoría" : "Crear Nueva Categoría"}
      </h2>
      <input
        type="text"
        placeholder="Nombre de la categoría"
        value={categoriaNombre}
        onChange={(e) => setCategoriaNombre(e.target.value)}
        className="mt-1 block w-full p-2 border border-[#003566] bg-[#001d3d] text-white rounded-md shadow-sm focus:ring-yellow-500 focus:border-yellow-500"
      />
      {error && <p className="text-red-500 text-sm mt-2">{error}</p>}

      <label className="mt-4 block">Selecciona un icono:</label>
      <div className="grid grid-cols-3 gap-0 sm:grid-cols-3">
        {iconos.map((icono) => (
          <div
            key={icono.alt}
            className={`p-1 border rounded-md cursor-pointer transition duration-200 ease-in-out flex items-center justify-center
                        ${
                          iconoSeleccionado === icono.faIcon
                            ? "border-[#ffc300]"
                            : "border-transparent"
                        } 
                        hover:border-[#ffc300]`}
            onClick={() => setIconoSeleccionado(icono.faIcon)}
          >
            <FontAwesomeIcon icon={icono.faIcon} className="fa-2x sm:fa-2xs" />
          </div>
        ))}
      </div>

      <button
        onClick={handleSubmit}
        disabled={isLoading}
        className="mt-4 mr-2 w-full sm:w-auto bg-[#ffd60a] text-black font-bold py-2 px-4 rounded hover:bg-[#ffc300] transition duration-300"
      >
        {isLoading ? (
          <div>
            <span className="loading loading-spinner loading-sm"></span>
            Cargando...
          </div>
        ) : edit ? (
          "Editar Categoría"
        ) : (
          "Crear Categoría"
        )}
      </button>
      <button
        onClick={() => handleClose()}
        className="mt-2 w-full sm:w-auto bg-red-500 text-white font-bold py-2 px-4 rounded hover:bg-red-600 transition duration-300"
      >
        Cerrar
      </button>
    </Modal>
  );
};

export default ModalCategoria;
