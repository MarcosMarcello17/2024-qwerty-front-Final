import React, { useState } from "react";
import "./styles/ActionButtons.css";
import { useNavigate } from "react-router-dom";

function ActionButtons() {
  const navigate = useNavigate();
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const signOff = () => {
    localStorage.removeItem("token");
    navigate("/");
  };

  const deleteAccount = async () => {
    setIsDeleting(true);
    const token = localStorage.getItem("token");

    if (!token) {
      alert("No hay sesión activa");
      navigate("/");
      return;
    }

    try {
      const response = await fetch(
        `https://two024-qwerty-back-final-marcello.onrender.com/api/auth`,
        {
          method: "DELETE",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );

      if (response.ok || response.status === 204) {
        localStorage.removeItem("token");
        alert("Cuenta eliminada exitosamente");
        navigate("/");
      } else {
        const errorText = await response.text();
        console.error("Error del servidor:", errorText);
        alert("Error al eliminar la cuenta. Código: " + response.status);
      }
    } catch (err) {
      console.error("Error de red:", err);
      alert("Error de conexión. Verifica tu internet e intenta nuevamente.");
    } finally {
      setIsDeleting(false);
      setShowDeleteConfirm(false);
    }
  };

  const confirmDeleteAccount = () => {
    setShowDeleteConfirm(true);
  };

  const cancelDelete = () => {
    setShowDeleteConfirm(false);
  };

  return (
    <div className="action-buttons-container">
      <button
        className="primary-button"
        onClick={() => navigate("/change-password")}
      >
        Cambiar Contraseña
      </button>
      <button className="primary-button" onClick={signOff}>
        Cerrar Sesión
      </button>
      <button
        className="primary-button delete-button"
        onClick={confirmDeleteAccount}
        disabled={isDeleting}
      >
        {isDeleting ? "Eliminando..." : "Eliminar Cuenta"}
      </button>

      {showDeleteConfirm && (
        <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50">
          <div className="bg-[#001d3d] p-6 rounded-lg max-w-md mx-4">
            <h3 className="text-white text-lg font-bold mb-4">
              ¿Estás seguro?
            </h3>
            <p className="text-gray-300 mb-6">
              Esta acción eliminará permanentemente tu cuenta y todos tus datos.
              No se puede deshacer.
            </p>
            <div className="flex space-x-4">
              <button
                className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 disabled:opacity-50"
                onClick={deleteAccount}
                disabled={isDeleting}
              >
                {isDeleting ? "Eliminando..." : "Sí, eliminar"}
              </button>
              <button
                className="px-4 py-2 bg-gray-600 text-white rounded hover:bg-gray-700"
                onClick={cancelDelete}
                disabled={isDeleting}
              >
                Cancelar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default ActionButtons;
