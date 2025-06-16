import { faEye, faEyeSlash, faSignIn } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import logo from "../assets/logo-removebg-preview.png";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

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
    <div className="flex min-h-screen flex-col items-center justify-center bg-background p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="flex justify-center">
            <div className="w-36 h-36 rounded-full overflow-hidden border-4 border-[#ffc300] text-4xl font-bold text-primary font-headline">
              <img
                src={logo}
                alt="logo"
                className="w-full h-full object-cover"
              />
            </div>
          </div>
          <p className="text-muted-foreground mt-2">
            Bienvenido! Inicia sesion para acceder.
          </p>
        </div>
        <Card className="w-full bg-card shadow-xl">
          <form
            onSubmit={(e) => {
              e.preventDefault();
              onClick();
            }}
            className="space-y-4"
          >
            <CardHeader>
              <CardTitle className="text-2xl font-headline text-center">
                Ingrese su email y contraseña
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-100">
                  Email
                </label>
                <Input
                  type="email"
                  className="mt-1 block w-full p-3 bg-background text-white rounded-md shadow-sm"
                  value={email}
                  placeholder="Email"
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-100">
                  Contraseña
                </label>
                <div className="relative">
                  <Input
                    type={showPassword ? "text" : "password"}
                    className="mt-1 block w-full p-3 bg-background text-white rounded-md shadow-sm"
                    value={password}
                    placeholder="Contraseña"
                    onChange={(e) => setPassword(e.target.value)}
                    required
                  />
                  <button
                    type="button"
                    onClick={togglePasswordVisibility}
                    className="absolute inset-y-0 right-0 flex items-center px-2 hover:bg-primary"
                  >
                    <FontAwesomeIcon
                      color="#FFFFFF"
                      icon={showPassword ? faEyeSlash : faEye}
                    />
                  </button>
                </div>
              </div>
              {error && (
                <div className="text-red-500 text-sm text-center">{error}</div>
              )}
            </CardContent>
            <CardFooter className="flex flex-col gap-4">
              <Button
                type="submit"
                disabled={isLoading}
                className="w-full bg-primary hover:bg-primary/90 text-primary-foreground"
              >
                {isLoading ? (
                  <>
                    <div className="loading-circle border-4 border-t-yellow-600 border-gray-200 rounded-full w-6 h-6 animate-spin mr-2"></div>
                    Cargando...
                  </>
                ) : (
                  <>
                    <FontAwesomeIcon icon={faSignIn} />
                    Iniciar Sesión
                  </>
                )}
              </Button>
              <div className="text-sm text-muted-foreground text-center">
                <a
                  href="#"
                  className="text-sm text-muted-foreground hover:text-primary text-center"
                  onClick={() => navigate("/forgot-password")}
                >
                  Olvidaste tu contraseña?
                </a>
              </div>
            </CardFooter>
          </form>
        </Card>
        <p className="mt-8 text-center text-sm text-muted-foreground">
          En caso de no estar registrado,{" "}
          <a
            href="/register"
            className="font-medium text-primary hover:underline"
          >
            Cree una cuenta
          </a>
        </p>
      </div>
    </div>
  );
}

export default LoginForm;
