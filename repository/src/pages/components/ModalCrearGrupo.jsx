import React, { useEffect, useState } from "react";
import Modal from "react-modal";

const ModalCrearGrupo = ({
  isOpen = false,
  onRequestClose = () => {},
  grupoAAgregar = null,
}) => {
  const customStyles = {
    overlay: {
      position: "fixed",
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      backgroundColor: "rgba(0, 0, 0, 0.9)",
      zIndex: 1002,
      display: "flex",
      justifyContent: "center",
      alignItems: "center",
    },
    content: {
      position: "relative",
      width: "90%",
      maxWidth: "500px",
      height: "auto",
      maxHeight: "90vh",
      padding: "20px",
      margin: "auto",
      borderRadius: "10px",
      backgroundColor: "#000814",
      overflowY: "auto",
    },
  };

  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [grupoNombre, setGrupoNombre] = useState("");
  const [correoUsuario, setCorreoUsuario] = useState("");
  const [usuarios, setUsuarios] = useState([]); // Lista de correos

  useEffect(() => {
    setCorreoUsuario("");
  }, [isOpen]);

  const handleAddUsuario = async () => {
    if (!correoUsuario) {
      setError("Por favor ingresa un correo.");
      return;
    }

    if (usuarios.includes(correoUsuario)) {
      setError("Este correo ya fue agregado.");
      return;
    }
    const token = localStorage.getItem("token");
    if (grupoAAgregar != null) {
      try {
        // Realiza la llamada al backend para verificar el usuario
        const response = await fetch(
          `https://two024-qwerty-back-final-marcello.onrender.com/api/grupos/${grupoAAgregar}/verificar-usuario?email=${correoUsuario}`,
          {
            method: "GET",
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        const message = await response.text();

        if (response.ok) {
          // Agregar el correo si la verificación es exitosa
          setUsuarios([...usuarios, correoUsuario]);
          setCorreoUsuario("");
          setError(""); // Limpiar el mensaje de error si la adición fue exitosa
        } else {
          // Si la respuesta no es OK, muestra el mensaje de error del backend
          setError(message);
        }
      } catch (error) {
        setError("Error al verificar el usuario.");
      }
    } else {
      if (await userExists(correoUsuario)) {
        setUsuarios([...usuarios, correoUsuario]);
        setCorreoUsuario("");
        setError(""); // Limpiar el mensaje de error si la adición fue exitosa
      } else {
        setError("El usuario no esta registrado");
      }
    }
  };
  const userExists = async (mail) => {
    let url =
      "https://two024-qwerty-back-final-marcello.onrender.com/api/public/exists/" +
      mail;
    const response = await fetch(url);
    if (response.ok) {
      const exists = await response.json();
      console.log(exists);
      return exists;
    } else {
      console.log(exists);
      return exists;
    }
  };

  const handleSubmit = async () => {
    setIsLoading(true);
    const token = localStorage.getItem("token");
    if (grupoAAgregar == null) {
      if (!grupoNombre || usuarios.length === 0) {
        setError("Debes ingresar un nombre de grupo y al menos un usuario.");
        setIsLoading(false);
        return;
      }
      try {
        // Aquí iría la lógica para crear el grupo usando `grupoNombre` y `usuarios`
        const response = await fetch(
          "https://two024-qwerty-back-final-marcello.onrender.com/api/grupos/crear",
          {
            // Ajusta la URL según tu endpoint
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${token}`,
            },
            body: JSON.stringify({
              nombre: grupoNombre,
              usuarios: usuarios,
            }),
          }
        );

        if (!response.ok) {
          throw new Error("Error al crear el grupo.");
        }

        // Limpiar los campos y cerrar el modal si la solicitud fue exitosa
        setGrupoNombre("");
        setUsuarios([]);
        setError("");
        onRequestClose();
      } catch (error) {
        setError("Ocurrió un error al procesar la solicitud.");
      } finally {
        setIsLoading(false);
      }
    } else {
      if (usuarios.length === 0) {
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
    }
  };

  const handleClose = () => {
    setError("");
    onRequestClose();
    setGrupoNombre("");
    setUsuarios([]);
  };

  return (
    <Modal
      isOpen={isOpen}
      onRequestClose={onRequestClose}
      contentLabel={grupoAAgregar ? "Invitar Usuarios" : "Crear Grupo"}
      style={customStyles}
      className="bg-gray-900 text-white p-4 sm:p-2 rounded-lg shadow-lg"
    >
      <h2 className="text-xl sm:text-lg font-bold mb-4">
        {grupoAAgregar ? "Invitar Usuarios" : "Crear Nuevo Grupo"}
      </h2>

      {/* Mostrar el campo para el nombre del grupo solo si no se está invitando a usuarios */}
      {!grupoAAgregar && (
        <div className="mt-2">
          <input
            type="text"
            placeholder="Nombre del Grupo"
            value={grupoNombre}
            onChange={(e) => setGrupoNombre(e.target.value.slice(0, 16))}
            className="mt-1 block w-full p-2 bg-[#001d3d] text-white rounded-md shadow-sm"
          />
          <p className="text-gray-500 text-sm mt-1">
            {grupoNombre.length}/16 Largo maximo 16 caracteres
          </p>
        </div>
      )}

      {/* Lista de correos agregados */}
      {usuarios.length > 0 && (
        <div className="mt-3 mb-3">
          <h3 className="text-lg font-semibold">Usuarios a agregar:</h3>
          <ul className="list-disc pl-5">
            {usuarios.map((email, index) => (
              <li key={index} className="text-sm text-gray-300">
                {email}
              </li>
            ))}
          </ul>
        </div>
      )}

      <input
        type="email"
        placeholder="Correo del Usuario"
        value={correoUsuario}
        onChange={(e) => setCorreoUsuario(e.target.value)}
        className="mt-1 block w-full p-2 bg-[#001d3d] text-white rounded-md shadow-sm"
      />
      {error && <p className="text-red-500 text-sm mt-2">{error}</p>}
      <button
        onClick={handleAddUsuario}
        className="mt-2 w-full sm:w-auto bg-[#003566] text-white font-bold py-2 px-4 rounded hover:bg-[#001d3d] transition duration-300"
      >
        Agregar Usuario
      </button>

      <button
        onClick={handleSubmit}
        disabled={isLoading}
        className="mt-4 mx-2 w-full sm:w-auto bg-[#ffd60a] text-black font-bold py-2 px-4 rounded hover:bg-[#ffc300] transition duration-300"
      >
        {isLoading ? (
          <div>
            <span className="loading loading-spinner loading-sm"></span>
            Cargando...
          </div>
        ) : grupoAAgregar ? (
          "Invitar Usuarios"
        ) : (
          "Crear Grupo"
        )}
      </button>
      <button
        onClick={handleClose}
        className="mt-2 w-full sm:w-auto bg-red-500 text-white font-bold py-2 px-4 rounded hover:bg-red-600 transition duration-300"
      >
        Cerrar
      </button>
    </Modal>
  );
};

export default ModalCrearGrupo;
