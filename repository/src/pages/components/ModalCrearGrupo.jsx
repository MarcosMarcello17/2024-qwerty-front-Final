import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { UserPlus } from "lucide-react";
import React, { useEffect, useState } from "react";
import Modal from "react-modal";

const ModalCrearGrupo = ({
  isOpen = false,
  onRequestClose = () => {},
  grupoAAgregar = null,
  onGrupoCreated = () => {}, // Callback para cuando se crea un grupo
  onUsuariosInvitados = () => {}, // Callback para cuando se invitan usuarios
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
      height: "auto",
      maxHeight: "90vh",
      padding: "20px",
      margin: "auto",
      borderRadius: "10px",
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
        onGrupoCreated(); // Llamar callback para refrescar la lista de grupos
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
        onUsuariosInvitados(); // Llamar callback para refrescar la lista de grupos
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
      className="sm:max-w-[525px] bg-card"
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
            className="mt-1 block w-full p-2 bg-background text-white rounded-md shadow-sm"
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

      <div className="mb-4">
        <label
          className="block text-white font-semibold my-2"
          htmlFor="correoUsuario"
        >
          Invitar usuarios
        </label>
        <div className="flex items-center rounded-md p-2">
          <Input
            id="correoUsuario"
            type="email"
            placeholder="user@example.com"
            value={correoUsuario}
            onChange={(e) => setCorreoUsuario(e.target.value)}
            className="flex-1 bg-background text-white border-none focus:ring-0 placeholder-gray-400"
          />
          <Button
            type="button"
            variant="outline"
            onClick={handleAddUsuario}
            className="ml-2 flex items-center bg-background text-white border-none hover:bg-primary"
          >
            <UserPlus className="mr-2 h-4 w-4" /> Add
          </Button>
        </div>
      </div>

      {error && <p className="text-red-500 text-sm mt-2">{error}</p>}
      <div className="flex gap-2 mt-2">
        <button
          onClick={handleSubmit}
          disabled={isLoading}
          className="flex-1 bg-[#ffd60a] bg-opacity-90 font-bold text-gray-950 py-2 px-4 rounded-lg hover:bg-[#ffc300]"
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
          className="flex-1 bg-red-500 text-white font-bold py-3 px-4 rounded hover:bg-red-600 transition-colors duration-300"
        >
          Cerrar
        </button>
      </div>
    </Modal>
  );
};

export default ModalCrearGrupo;
