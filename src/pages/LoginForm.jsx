import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Eye, EyeOff, LogIn, Loader2 } from "lucide-react";
import AuthLayout from "../components/AuthLayout";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";

const BACK_URL = import.meta.env.VITE_BACK_SERVER_URL;

function LoginForm() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const handleLogin = async () => {
    setError(null);
    setIsLoading(true);
    try {
      const response = await fetch(`${BACK_URL}/api/auth/login`, {
        method: "POST",
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
        },
        body: new URLSearchParams({
          email: email,
          password: password,
        }),
      });

      if (response.ok) {
        const token = await response.text();
        localStorage.setItem("token", token);
        localStorage.setItem("mail", email);
        navigate("/index");
      } else {
        setError("Credenciales inválidas");
      }
    } catch (err) {
      console.error("Error durante el login:", err);
      setError("Ocurrió un error. Intenta nuevamente.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <AuthLayout>
      <div className="mb-8">
            <h1 className="text-2xl font-bold text-foreground tracking-tight">
              Iniciar sesión
            </h1>
            <p className="text-sm text-muted-foreground mt-1">
              Ingresa tus datos para continuar.
            </p>
          </div>

          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleLogin();
            }}
            className="space-y-5"
          >
            <div className="space-y-1.5">
              <Label htmlFor="login-email">Email</Label>
              <Input
                id="login-email"
                type="email"
                value={email}
                placeholder="tu@email.com"
                onChange={(e) => setEmail(e.target.value)}
                autoComplete="email"
                required
                aria-invalid={error ? "true" : undefined}
              />
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="login-password">Contraseña</Label>
              <div className="relative">
                <Input
                  id="login-password"
                  type={showPassword ? "text" : "password"}
                  value={password}
                  placeholder="Contraseña"
                  onChange={(e) => setPassword(e.target.value)}
                  autoComplete="current-password"
                  required
                  className="pr-9"
                  aria-invalid={error ? "true" : undefined}
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="icon-xs"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-1 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                  tabIndex={-1}
                  aria-label={showPassword ? "Ocultar contraseña" : "Mostrar contraseña"}
                >
                  {showPassword ? (
                    <EyeOff className="size-3.5" />
                  ) : (
                    <Eye className="size-3.5" />
                  )}
                </Button>
              </div>
            </div>

            {error && (
              <p
                role="alert"
                className="text-sm text-destructive bg-destructive/10 rounded-md px-3 py-2"
              >
                {error}
              </p>
            )}

            <Button
              type="submit"
              disabled={isLoading}
              className="w-full"
              size="lg"
            >
              {isLoading ? (
                <>
                  <Loader2 className="size-4 animate-spin" />
                  Ingresando...
                </>
              ) : (
                <>
                  <LogIn className="size-4" />
                  Iniciar sesión
                </>
              )}
            </Button>
          </form>

          <div className="mt-8 flex flex-col items-center gap-4 text-sm">
            <button
              type="button"
              onClick={() => navigate("/forgot-password")}
              className="text-muted-foreground hover:text-primary transition-colors"
            >
              Olvidaste tu contraseña?
            </button>
            <span className="text-muted-foreground">
              No tienes cuenta?{" "}
              <a
                href="/register"
                className="font-medium text-primary hover:underline"
              >
                Crear cuenta
              </a>
        </span>
      </div>
    </AuthLayout>
  );
}

export default LoginForm;
