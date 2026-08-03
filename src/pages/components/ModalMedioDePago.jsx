import React, { useEffect, useState } from "react";
import Modal from "react-modal";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { fas } from "@fortawesome/free-solid-svg-icons";
import { library } from "@fortawesome/fontawesome-svg-core";

const ModalMedioDePago = ({
  isOpen = false,
  onRequestClose = () => {},
  handleCreateTP = () => {},
  handleEditTP = () => {},
  edit = false,
  editTP = {},
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

  const [medioDePagoNombre, setMedioDePagoNombre] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (isOpen) {
      if (edit && editTP.value) {
        setMedioDePagoNombre(editTP.value);
      } else {
        setMedioDePagoNombre("");
      }
      setError("");
      setIsLoading(false);
    }
  }, [isOpen, edit, editTP]);

  const handleSubmit = async () => {
    if (!medioDePagoNombre.trim()) {
      setError("Debes ingresar un nombre para el medio de pago.");
      return;
    }

    setIsLoading(true);
    setError("");

    try {
      let errorMessage = "";
      if (!edit) {
        errorMessage = await handleCreateTP(medioDePagoNombre.trim());
      } else {
        errorMessage = await handleEditTP(editTP, medioDePagoNombre.trim());
      }

      if (errorMessage && errorMessage !== "") {
        setError(errorMessage);
        setIsLoading(false);
        return;
      }

      handleClose();
    } catch (error) {
      setError("Ocurrió un error inesperado. Intenta nuevamente.");
      setIsLoading(false);
    }
  };

  const handleClose = () => {
    if (!isLoading) {
      setError("");
      setMedioDePagoNombre("");
      setIsLoading(false);
      onRequestClose();
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onRequestClose={onRequestClose}
      contentLabel={edit ? "Editar Medio De Pago" : "Crear Medio de Pago"}
      style={customStyles}
      className=" text-white p-4 sm:p-2 rounded-lg shadow-lg"
    >
      <h2 className="text-xl sm:text-lg font-bold mb-4">
        {edit ? "Editar Medio De Pago" : "Crear Medio de Pago"}
      </h2>
      <input
        type="text"
        placeholder="Medio de Pago"
        value={medioDePagoNombre}
        onChange={(e) => setMedioDePagoNombre(e.target.value)}
        disabled={isLoading}
        className="mt-1 block w-full p-2 border border-[#ffc300] bg-background text-white rounded-md shadow-sm disabled:opacity-50 disabled:cursor-not-allowed"
      />
      {error && <p className="text-red-500 text-sm mt-2">{error}</p>}
      {isLoading && (
        <div className="flex justify-center items-center mt-2">
          <div className="animate-spin border-t-2 border-[#ffd60a] border-solid w-6 h-6 rounded-full"></div>
          <span className="ml-2 text-sm text-gray-300">Procesando...</span>
        </div>
      )}
      <button
        onClick={handleSubmit}
        disabled={isLoading || !medioDePagoNombre.trim()}
        className="mt-4 mr-2 w-full sm:w-auto bg-[#ffd60a] text-black font-bold py-2 px-4 rounded hover:bg-[#ffc300] transition duration-300 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:bg-[#ffd60a]"
      >
        {isLoading
          ? edit
            ? "Editando..."
            : "Creando..."
          : edit
          ? "Editar Medio De Pago"
          : "Crear Medio de Pago"}
      </button>
      <button
        onClick={() => handleClose()}
        disabled={isLoading}
        className="mt-2 w-full sm:w-auto bg-red-500 text-white font-bold py-2 px-4 rounded hover:bg-red-600 transition duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
      >
        Cerrar
      </button>
    </Modal>
  );
};

export default ModalMedioDePago;
