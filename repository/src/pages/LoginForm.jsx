import { faEye, faEyeSlash } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import logo from "../assets/logo-removebg-preview.png";

function LoginForm() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  const onClick = async () => {
    setIsLoading(true);
    try {
      const response = await fetch("http://localhost:8080/api/auth/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
        },
        body: new URLSearchParams({
          email: email,
          password: password,
        }),
      });
      /*const response = await fetch("http://localhost:8080/api/auth/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
        },
        body: new URLSearchParams({
          email: email,
          password: password,
        }),
        
      });
      */

      if (response.ok) {
        const token = await response.text();
        console.log("Token recibido:", token);
        localStorage.setItem("token", token);
        localStorage.setItem("mail", email);
        setIsLoading(false);
        navigate("/index");
      } else {
        setError("Credenciales inválidas");
        setIsLoading(false);
      }
    } catch (err) {
      console.error("Error durante el login:", err);
      setError("Ocurrió un error. Intenta nuevamente.");
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-black p-6">
      <div className="bg-[#000814] shadow-md rounded-lg p-8 max-w-md w-full">
        <div className="flex justify-center mb-6">
          <div className="w-36 h-36 rounded-full overflow-hidden border-4 border-[#ffc300]">
            <img src={logo} alt="logo" className="w-full h-full object-cover" />
          </div>
        </div>
        <p className="text-center text-gray-100 mb-6">
          Ingrese su email y contraseña
        </p>
        <form
          onSubmit={(e) => {
            e.preventDefault();
            onClick();
          }}
          className="space-y-4"
        >
          <div>
            <label className="block text-sm font-medium text-gray-100">
              Email:
            </label>
            <input
              type="email"
              className="mt-1 block w-full p-2 border bg-[#001d3d] text-white border-[#ffd60a] rounded-md shadow-sm"
              value={email}
              placeholder="Email"
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-100">
              Contraseña:
            </label>
            <div className="relative">
              <input
                type={showPassword ? "text" : "password"}
                className="mt-1 block w-full p-2 border bg-[#001d3d] text-white border-[#ffd60a] rounded-md shadow-sm"
                value={password}
                placeholder="Contraseña"
                onChange={(e) => setPassword(e.target.value)}
                required
              />
              <button
                type="button"
                onClick={togglePasswordVisibility}
                className="absolute inset-y-0 right-0 flex items-center px-2 hover:bg-[#003566]"
              >
                <FontAwesomeIcon
                  color="#FFD60A"
                  icon={showPassword ? faEyeSlash : faEye}
                />
              </button>
            </div>
          </div>
          {error && (
            <div className="text-red-500 text-sm text-center">{error}</div>
          )}
          <div className="flex justify-between items-center">
            <button
              type="submit"
              disabled={isLoading}
              className="w-full bg-[#ffd60a] bg-opacity-85 text-gray-950 py-2 px-4 rounded-lg hover:bg-[#ffc300] flex justify-center items-center"
            >
              {isLoading ? (
                <>
                  <div className="loading-circle border-4 border-t-yellow-600 border-gray-200 rounded-full w-6 h-6 animate-spin mr-2"></div>
                  Cargando...
                </>
              ) : (
                "Iniciar Sesión"
              )}
            </button>
          </div>
        </form>
        <div className="mt-4 text-center text-gray-400">
          En caso de no estar registrado,{" "}
          <a
            href="#"
            className="text-[#ffd60a] hover:underline"
            onClick={() => navigate("/register")}
          >
            Cree una cuenta
          </a>
          <br />
          Olvidaste tu contraseña?{" "}
          <a
            href="#"
            className="text-[#ffd60a] hover:underline"
            onClick={() => navigate("/forgot-password")}
          >
            Recuperar Contraseña
          </a>
        </div>
      </div>
    </div>
  );
}

export default LoginForm;
