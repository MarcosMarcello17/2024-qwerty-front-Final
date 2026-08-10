import { useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import {
  Eye,
  EyeOff,
  KeyRound,
  Loader2,
  Check,
  X,
  CheckCircle2,
  LinkIcon,
} from "lucide-react";
import AuthLayout from "../components/AuthLayout";
import { PASSWORD_RULES, passwordMeetsRules } from "@/lib/passwordRules";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";

const BACK_URL = import.meta.env.VITE_BACK_SERVER_URL;

function ResetPasswordForm() {
  const navigate = useNavigate();
  const { search } = useLocation();
  const token = new URLSearchParams(search).get("token");

  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [error, setError] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [done, setDone] = useState(false);
  // El backend devuelve 400 cuando el token vencio. Sin token en la URL el caso
  // es el mismo para el usuario: el enlace no sirve y hay que pedir otro.
  const [deadLink, setDeadLink] = useState(token == null);

  const allRulesPass = passwordMeetsRules(newPassword);
  const passwordsMatch =
    confirmPassword.length > 0 && newPassword === confirmPassword;
  const canSubmit = allRulesPass && passwordsMatch;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);

    if (!allRulesPass) {
      setError("La contraseña no cumple con todos los requisitos.");
      return;
    }
    if (!passwordsMatch) {
      setError("Las contraseñas no coinciden.");
      return;
    }

    setIsLoading(true);
    try {
      // El token y la contraseña van en el cuerpo, nunca en la URL: los query
      // params quedan escritos en logs de servidor, proxies e historial.
      const response = await fetch(`${BACK_URL}/api/auth/reset-password`, {
        method: "POST",
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
        body: new URLSearchParams({ token, newPassword }),
      });

      if (response.ok) {
        setDone(true);
      } else if (response.status === 400) {
        setDeadLink(true);
      } else if (response.status === 429) {
        setError("Demasiados intentos. Intenta en unos minutos.");
      } else {
        setError(
          "No pudimos restablecer la contraseña. El enlace puede haber vencido o ya haberse usado.",
        );
      }
    } catch {
      setError("Sin conexión. Revisa tu internet e intenta de nuevo.");
    } finally {
      setIsLoading(false);
    }
  };

  if (deadLink) {
    return (
      <AuthLayout>
        <div className="flex flex-col items-center text-center gap-4">
          <div className="rounded-full bg-destructive/10 p-3">
            <LinkIcon className="size-8 text-destructive" />
          </div>
          <h1 className="text-2xl font-bold text-foreground tracking-tight">
            Este enlace ya no sirve
          </h1>
          <p className="text-sm text-muted-foreground leading-relaxed max-w-[34ch]">
            Los enlaces de recuperación vencen a la hora y solo se pueden usar
            una vez. Pedí uno nuevo y te llega al instante.
          </p>
          <Button className="mt-4" onClick={() => navigate("/forgot-password")}>
            Pedir un enlace nuevo
          </Button>
          <button
            type="button"
            onClick={() => navigate("/")}
            className="text-sm text-muted-foreground hover:text-primary transition-colors"
          >
            Volver a iniciar sesión
          </button>
        </div>
      </AuthLayout>
    );
  }

  if (done) {
    return (
      <AuthLayout>
        <div className="flex flex-col items-center text-center gap-4">
          <div className="rounded-full bg-primary/10 p-3">
            <CheckCircle2 className="size-8 text-primary" />
          </div>
          <h1 className="text-2xl font-bold text-foreground tracking-tight">
            Contraseña restablecida
          </h1>
          <p className="text-sm text-muted-foreground leading-relaxed max-w-[34ch]">
            Ya podés entrar con la nueva contraseña.
          </p>
          <Button className="mt-4" onClick={() => navigate("/")}>
            Iniciar sesión
          </Button>
        </div>
      </AuthLayout>
    );
  }

  return (
    <AuthLayout>
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-foreground tracking-tight">
          Elegí una nueva contraseña
        </h1>
        <p className="text-sm text-muted-foreground mt-1">
          Vas a usarla la próxima vez que inicies sesión.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-5">
        <div className="space-y-1.5">
          <Label htmlFor="new-password">Nueva contraseña</Label>
          <div className="relative">
            <Input
              id="new-password"
              type={showNewPassword ? "text" : "password"}
              value={newPassword}
              placeholder="Nueva contraseña"
              onChange={(e) => setNewPassword(e.target.value)}
              autoComplete="new-password"
              autoFocus
              required
              className="pr-9"
            />
            <Button
              type="button"
              variant="ghost"
              size="icon-xs"
              onClick={() => setShowNewPassword(!showNewPassword)}
              className="absolute right-1 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
              tabIndex={-1}
              aria-label={
                showNewPassword ? "Ocultar contraseña" : "Mostrar contraseña"
              }
            >
              {showNewPassword ? (
                <EyeOff className="size-3.5" />
              ) : (
                <Eye className="size-3.5" />
              )}
            </Button>
          </div>
        </div>

        {/* Requisitos: se revelan recien cuando hay algo que verificar */}
        {newPassword.length > 0 && (
          <ul className="space-y-1 text-xs">
            {PASSWORD_RULES.map((rule) => {
              const passes = rule.test(newPassword);
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

        <div className="space-y-1.5">
          <Label htmlFor="confirm-password">Confirmar contraseña</Label>
          <div className="relative">
            <Input
              id="confirm-password"
              type={showConfirmPassword ? "text" : "password"}
              value={confirmPassword}
              placeholder="Confirmar contraseña"
              onChange={(e) => setConfirmPassword(e.target.value)}
              autoComplete="new-password"
              required
              className="pr-9"
              aria-invalid={
                confirmPassword.length > 0 && !passwordsMatch
                  ? "true"
                  : undefined
              }
              aria-describedby="confirm-password-status"
            />
            <Button
              type="button"
              variant="ghost"
              size="icon-xs"
              onClick={() => setShowConfirmPassword(!showConfirmPassword)}
              className="absolute right-1 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
              tabIndex={-1}
              aria-label={
                showConfirmPassword
                  ? "Ocultar contraseña"
                  : "Mostrar contraseña"
              }
            >
              {showConfirmPassword ? (
                <EyeOff className="size-3.5" />
              ) : (
                <Eye className="size-3.5" />
              )}
            </Button>
          </div>
          <p
            id="confirm-password-status"
            aria-live="polite"
            className={`flex items-center gap-1.5 text-xs ${
              passwordsMatch ? "text-chart-5" : "text-muted-foreground"
            }`}
          >
            {confirmPassword.length === 0 ? null : passwordsMatch ? (
              <>
                <Check className="size-3 shrink-0" />
                Las contraseñas coinciden
              </>
            ) : (
              <>
                <X className="size-3 shrink-0" />
                Las contraseñas no coinciden
              </>
            )}
          </p>
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
          disabled={isLoading || !canSubmit}
          className="w-full"
          size="lg"
        >
          {isLoading ? (
            <>
              <Loader2 className="size-4 animate-spin" />
              Restableciendo...
            </>
          ) : (
            <>
              <KeyRound className="size-4" />
              Restablecer contraseña
            </>
          )}
        </Button>
      </form>

      <div className="mt-8 flex flex-col items-center gap-4 text-sm">
        <button
          type="button"
          onClick={() => navigate("/")}
          className="text-muted-foreground hover:text-primary transition-colors"
        >
          Volver a iniciar sesión
        </button>
      </div>
    </AuthLayout>
  );
}

export default ResetPasswordForm;
