import React, { useState } from "react";
import "./styles/ActionButtons.css";
import { useNavigate } from "react-router-dom";

function ActionButtons() {
  const navigate = useNavigate();

  const signOff = () => {
    localStorage.removeItem("token");
    navigate("/");
  };

  const deleteAccount = async () => {
    const token = localStorage.getItem("token");
    try {
      const response = await fetch(
        `https://two024-qwerty-back-final-marcello.onrender.com/api/auth`,
        {
          method: "DELETE",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (response.ok) {
        localStorage.removeItem("token");
        navigate("/");
      } else {
        alert("Error al eliminar la cuenta");
      }
    } catch (err) {
      alert("Ocurrió un error. Intenta nuevamente.");
    }
  };

  return (
    <div className="action-buttons-container">
      <button className="primary-button" onClick={() => navigate("/index")}>
        Ver Mis Transacciones
      </button>
      <button
        className="primary-button"
        onClick={() => navigate("/achievements")}
      >
        Ver Mis Logros
      </button>
      <details className="dropdown-container">
        <summary className="primary-button cursor-pointer">
          Más Opciones
        </summary>
        <ul className="dropdown-menu">
          <li>
            <button
              className="dropdown-item"
              onClick={() => navigate("/change-password")}
            >
              Cambiar Contraseña
            </button>
          </li>
          <li>
            <button className="dropdown-item mt-2" onClick={signOff}>
              Cerrar Sesión
            </button>
          </li>
          <li>
            <button
              className="dropdown-item mt-2 delete-button"
              onClick={deleteAccount}
            >
              Eliminar Cuenta
            </button>
          </li>
        </ul>
      </details>
    </div>
  );
}

export default ActionButtons;
