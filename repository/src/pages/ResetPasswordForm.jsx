// ResetPasswordForm.jsx
import { faEye, faEyeSlash } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import React, { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";

function ResetPasswordForm() {
  const [newPassword, setNewPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [message, setMessage] = useState("");
  const { search } = useLocation();
  const [loading, setLoading] = useState(false);
  const queryParams = new URLSearchParams(search);
  const token = queryParams.get("token");
  const navigate = useNavigate();

  useEffect(() => {
    if (token == null) {
      navigate("/");
    }
  }, []);
  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };
  const validatePassword = (password) => {
    const passwordRegex =
      /^(?!.*['"\\/|])(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;
    return passwordRegex.test(password);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validatePassword(newPassword)) {
      setMessage(
        "La contraseña debe tener al menos 8 caracteres, una mayuscula y minuscula, un número, un carácter especial y no puede contener comillas simples, dobles, barra vertical, barra inclinada o barra invertida."
      );
      return;
    } else {
      setLoading(true);
      try {
        const response = await fetch(
          `https://two024-qwerty-back-final-marcello.onrender.com/api/auth/reset-password?token=${token}&newPassword=${newPassword}`,
          {
            method: "POST",
          }
        );
        /*const response = await fetch(`https://two024-qwerty-back-final-marcello.onrender.com/api/auth/reset-password?token=${token}&newPassword=${newPassword}`, {
          method: "POST"
        });*/

        if (response.ok) {
          setMessage("Contraseña restablecida con éxito.");
          setTimeout(() => navigate("/"), 2000);
        } else {
          setMessage("Error al restablecer la contraseña.");
        }
      } catch (err) {
        setMessage("Ocurrió un error.");
      } finally {
        setLoading(false);
      }
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-black p-6">
      <div className="bg-gray-950 shadow-md rounded-lg p-8 max-w-md w-full">
        <h2 className="text-2xl font-bold mb-6 text-gray-100">
          Reset Password
        </h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-100">
              New Password:
            </label>
            <div className="relative">
              <input
                type={showPassword ? "text" : "password"}
                className="mt-1 block w-full p-2 border bg-gray-900 text-white border-yellow-600 rounded-md shadow-sm focus:ring-yellow-500 focus:border-yellow-500"
                value={newPassword}
                placeholder="Contraseña"
                onChange={(e) => setNewPassword(e.target.value)}
                required
              />
              <button
                type="button"
                onClick={togglePasswordVisibility}
                className="absolute inset-y-0 right-0 flex items-center px-2 hover:bg-yellow-700"
              >
                <FontAwesomeIcon
                  color="#F8C104"
                  icon={showPassword ? faEyeSlash : faEye}
                />
              </button>
            </div>
            <div className="text-gray-400 text-sm text-center">
              La contraseña debe tener:
            </div>
            <ul className="text-gray-400 text-sm text-left">
              <li>Al menos 8 caracteres</li>
              <li>Una mayuscula y minuscula</li>
              <li>Un número</li>
              <li>Un carácter especial</li>
              <li>
                No puede contener comillas simples, dobles, barra vertical,
                barra inclinada o barra invertida.
              </li>
            </ul>
          </div>
          <button
            type="submit"
            className="w-full bg-yellow-500 bg-opacity-80 text-gray-950 py-2 px-4 rounded-lg hover:bg-yellow-700 flex justify-center items-center"
            disabled={loading}
          >
            {loading ? (
              <>
                <div className="loading-circle border-4 border-t-yellow-600 border-gray-200 rounded-full w-6 h-6 animate-spin mr-2"></div>
                Cargando...
              </>
            ) : (
              "Restablecer Contraseña"
            )}
          </button>
          {message && (
            <p className="text-center text-gray-100 mt-4">{message}</p>
          )}
        </form>
      </div>
    </div>
  );
}

export default ResetPasswordForm;
