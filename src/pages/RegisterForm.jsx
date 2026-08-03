import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import logo from "../assets/logo-removebg-preview.png";
import {
  faEye,
  faEyeSlash,
  faUserPlus,
} from "@fortawesome/free-solid-svg-icons";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

function RegisterForm() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  const validatePassword = (password) => {
    // Contraseña mínima de 8 caracteres, al menos un número, un carácter especial,
    // una letra mayúscula, una letra minúscula y que no contenga caracteres prohibidos.
    const passwordRegex =
      /^(?!.*['"\\/|])(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;
    return passwordRegex.test(password);
  };

  const onRegister = async (e) => {
    e.preventDefault();
    setLoading(true);

    if (!validatePassword(password)) {
      setError(
        "La contraseña debe tener al menos 8 caracteres, una mayuscula y minuscula, un número, un carácter especial y no puede contener comillas simples, dobles, barra vertical, barra inclinada o barra invertida."
      );
      setLoading(false);
      return;
    }

    try {
      const response = await fetch(
        "https://two024-qwerty-back-final-marcello.onrender.com/api/auth/register",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            email: email,
            password: password,
          }),
        }
      );

      if (response.ok) {
        navigate("/");
      } else {
        if (response.status === 409) {
          setError(
            "Email ya en uso. Intente iniciar sesión o utilizar otro e-mail."
          );
        } else {
          setError("Ocurrió un error. Intenta nuevamente.");
        }
      }
    } catch (err) {
      console.error("Error during registration:", err);
      setError("Ocurrió un error. Intenta nuevamente.");
    } finally {
      setLoading(false);
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
            Crea tu cuenta para poder empezar a usar la aplicacion.
          </p>
        </div>
        <Card className="w-full bg-card shadow-xl">
          <form
            onSubmit={(e) => {
              e.preventDefault();
              onRegister(e);
            }}
            className="space-y-4"
          >
            <CardHeader>
              <CardTitle className="text-2xl font-headline text-center">
                Registrarse
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
              {error && (
                <div className="text-red-500 text-sm text-center">{error}</div>
              )}
            </CardContent>
            <CardFooter className="flex flex-col gap-4">
              <Button
                type="submit"
                disabled={loading}
                className="w-full bg-primary hover:bg-primary/90 text-primary-foreground"
              >
                {loading ? (
                  <>
                    <div className="loading-circle border-4 border-t-yellow-600 border-gray-200 rounded-full w-6 h-6 animate-spin mr-2"></div>
                    Cargando...
                  </>
                ) : (
                  <>
                    <FontAwesomeIcon icon={faUserPlus} />
                    Crear cuenta
                  </>
                )}
              </Button>
            </CardFooter>
          </form>
        </Card>
        <p className="mt-8 text-center text-sm text-muted-foreground">
          Ya tenes una cuenta?{" "}
          <a href="/" className="font-medium text-primary hover:underline">
            Inicia Sesion
          </a>
        </p>
      </div>
    </div>
  );
}

export default RegisterForm;
