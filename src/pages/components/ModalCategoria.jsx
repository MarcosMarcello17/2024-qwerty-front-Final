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
  isLoadingAdd = false,
  isLoadingEdit = false,
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
      backgroundColor: "#001d3d", // Fondo oscuro para mantener el estilo
      overflowY: "auto", // Habilitamos scroll si el contenido es demasiado grande
    },
  };

  const [categoriaNombre, setCategoriaNombre] = useState("");
  const [iconoSeleccionado, setIconoSeleccionado] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    if (edit && editCat) {
      setCategoriaNombre(editCat.label || "");
      setIconoSeleccionado(editCat.iconPath || "");
    } else if (!isOpen) {
      // Limpiar el formulario cuando se cierre el modal
      setCategoriaNombre("");
      setIconoSeleccionado("");
      setError("");
    }
  }, [editCat, edit, isOpen]);

  const handleSubmit = async () => {
    if (!categoriaNombre || !iconoSeleccionado) {
      setError("Debes ingresar un nombre y seleccionar un icono.");
      return;
    }

    // En modo edición, verificar si realmente hay cambios
    if (edit && editCat) {
      const nameChanged = categoriaNombre !== editCat.label;
      const iconChanged = iconoSeleccionado !== editCat.iconPath;

      // Si no hay cambios, simplemente cerrar el modal
      if (!nameChanged && !iconChanged) {
        setCategoriaNombre("");
        setIconoSeleccionado("");
        setError("");
        onRequestClose();
        return;
      }
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

      if (errorMessage && errorMessage !== "") {
        setError(errorMessage);
        return;
      }

      // Si todo está bien, limpiamos el estado
      setCategoriaNombre("");
      setIconoSeleccionado("");
      setError("");
      onRequestClose();
    } catch (error) {
      setError("Ocurrió un error al procesar la solicitud.");
    }
  };

  const handleClose = () => {
    setError("");
    setCategoriaNombre("");
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
    { alt: "faShoppingCart", faIcon: "fa-solid fa-shopping-cart" },
    { alt: "faHome", faIcon: "fa-solid fa-home" },
    { alt: "faGamepad", faIcon: "fa-solid fa-gamepad" },
    { alt: "faPlane", faIcon: "fa-solid fa-plane" },
    { alt: "faPizzaSlice", faIcon: "fa-solid fa-pizza-slice" },
    { alt: "faGift", faIcon: "fa-solid fa-gift" },
    { alt: "faWallet", faIcon: "fa-solid fa-wallet" },
    { alt: "faGasPump", faIcon: "fa-solid fa-gas-pump" },
    { alt: "faUtensils", faIcon: "fa-solid fa-utensils" },
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
        className="mt-1 block w-full p-2 px-3 border bg-background text-white rounded-md shadow-sm focus:ring-yellow-500 focus:border-yellow-500"
      />
      {error && <p className="text-red-500 text-sm mt-2">{error}</p>}

      <label className="mt-4 block">Selecciona un icono:</label>
      <div className="grid grid-cols-4 gap-2 sm:grid-cols-6 max-h-48 overflow-y-auto">
        {iconos.map((icono) => (
          <div
            key={icono.alt}
            className={`p-2 border rounded-md cursor-pointer transition duration-200 ease-in-out flex items-center justify-center h-12 w-12
                        ${
                          iconoSeleccionado === icono.faIcon
                            ? "border-[#ffc300] bg-[#ffc300]/20"
                            : "border-transparent"
                        } 
                        hover:border-[#ffc300] hover:bg-[#ffc300]/10`}
            onClick={() => setIconoSeleccionado(icono.faIcon)}
          >
            <FontAwesomeIcon icon={icono.faIcon} className="text-lg" />
          </div>
        ))}
      </div>

      <button
        onClick={handleSubmit}
        disabled={edit ? isLoadingEdit : isLoadingAdd}
        className="mt-4 mr-2 w-full sm:w-auto bg-[#ffd60a] text-black font-bold py-2 px-4 rounded hover:bg-[#ffc300] transition duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {(edit ? isLoadingEdit : isLoadingAdd) ? (
          <div className="flex items-center justify-center">
            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-black mr-2"></div>
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
