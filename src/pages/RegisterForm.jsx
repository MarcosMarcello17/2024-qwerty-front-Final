import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Eye, EyeOff, UserPlus, Loader2, Check, X } from "lucide-react";
import AuthLayout from "../components/AuthLayout";
import { PASSWORD_RULES, passwordMeetsRules } from "@/lib/passwordRules";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";

const BACK_URL = import.meta.env.VITE_BACK_SERVER_URL;

function RegisterForm() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState(null);
  const [isLoading, setIsLoading] = useState(false);

  const allRulesPass = passwordMeetsRules(password);

  const handleRegister = async () => {
    setError(null);

    if (!allRulesPass) {
      setError("La contraseña no cumple con todos los requisitos.");
      return;
    }

    setIsLoading(true);
    try {
      const response = await fetch(`${BACK_URL}/api/auth/register`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      if (response.ok) {
        navigate("/");
      } else if (response.status === 409) {
        setError("Email ya en uso. Intenta iniciar sesion o usa otro e-mail.");
      } else {
        setError("Ocurrio un error. Intenta nuevamente.");
      }
    } catch (err) {
      console.error("Error during registration:", err);
      setError("Ocurrio un error. Intenta nuevamente.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <AuthLayout>
      <div className="mb-8">
            <h1 className="text-2xl font-bold text-foreground tracking-tight">
              Crear cuenta
            </h1>
            <p className="text-sm text-muted-foreground mt-1">
              Registrate para empezar a organizar tus finanzas.
            </p>
          </div>

          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleRegister();
            }}
            className="space-y-5"
          >
            <div className="space-y-1.5">
              <Label htmlFor="register-email">Email</Label>
              <Input
                id="register-email"
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
              <Label htmlFor="register-password">Contraseña</Label>
              <div className="relative">
                <Input
                  id="register-password"
                  type={showPassword ? "text" : "password"}
                  value={password}
                  placeholder="Contraseña"
                  onChange={(e) => setPassword(e.target.value)}
                  autoComplete="new-password"
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

            {/* Password requirements checklist */}
            {password.length > 0 && (
              <ul className="space-y-1 text-xs">
                {PASSWORD_RULES.map((rule) => {
                  const passes = rule.test(password);
                  return (
                    <li
                      key={rule.key}
                      className={`flex items-center gap-1.5 ${
                        passes ? "text-chart-5" : "text-muted-foreground"
                      }`}
                    >
                      {passes ? (
                        <Check className="size-3 shrink-0" />
                      ) : (
                        <X className="size-3 shrink-0" />
                      )}
                      {rule.label}
                    </li>
                  );
                })}
              </ul>
            )}

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
              disabled={isLoading || !allRulesPass}
              className="w-full"
              size="lg"
            >
              {isLoading ? (
                <>
                  <Loader2 className="size-4 animate-spin" />
                  Creando cuenta...
                </>
              ) : (
                <>
                  <UserPlus className="size-4" />
                  Crear cuenta
                </>
              )}
            </Button>
          </form>

          <div className="mt-8 flex flex-col items-center gap-4 text-sm">
            <span className="text-muted-foreground">
              Ya tenes una cuenta?{" "}
              <a
                href="/"
                className="font-medium text-primary hover:underline"
              >
                Iniciar sesion
              </a>
        </span>
      </div>
    </AuthLayout>
  );
}

export default RegisterForm;
