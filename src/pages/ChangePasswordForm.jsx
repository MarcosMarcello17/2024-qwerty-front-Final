import { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Eye,
  EyeOff,
  KeyRound,
  Loader2,
  Check,
  X,
  CheckCircle2,
} from "lucide-react";
import AuthLayout from "../components/AuthLayout";
import { PASSWORD_RULES, passwordMeetsRules } from "@/lib/passwordRules";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";

const BACK_URL = import.meta.env.VITE_BACK_SERVER_URL;

function ChangePasswordForm() {
  const navigate = useNavigate();
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [error, setError] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [changed, setChanged] = useState(false);

  const allRulesPass = passwordMeetsRules(newPassword);
  const passwordsMatch =
    confirmPassword.length > 0 && newPassword === confirmPassword;
  const canSubmit =
    currentPassword.length > 0 && allRulesPass && passwordsMatch;

  const handleChangePassword = async (e) => {
    e.preventDefault();
    setError(null);

    if (!allRulesPass) {
      setError("La nueva contraseña no cumple con todos los requisitos.");
      return;
    }
    if (!passwordsMatch) {
      setError("Las nuevas contraseñas no coinciden.");
      return;
    }

    setIsLoading(true);
    try {
      const token = localStorage.getItem("token");
      const response = await fetch(`${BACK_URL}/api/users/change-password`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ currentPassword, newPassword }),
      });

      if (response.ok) {
        setChanged(true);
      } else if (response.status === 400) {
        setError("La contraseña actual es incorrecta.");
      } else if (response.status === 401 || response.status === 403) {
        setError("Tu sesión expiró. Volvé a iniciar sesión e intentá de nuevo.");
      } else if (response.status === 429) {
        setError("Demasiados intentos. Intenta en unos minutos.");
      } else {
        setError("Error en el servidor. Intenta más tarde.");
      }
    } catch {
      setError("Sin conexión. Revisa tu internet e intenta de nuevo.");
    } finally {
      setIsLoading(false);
    }
  };

  if (changed) {
    return (
      <AuthLayout>
        <div className="flex flex-col items-center text-center gap-4">
          <div className="rounded-full bg-primary/10 p-3">
            <CheckCircle2 className="size-8 text-primary" />
          </div>
          <h1 className="text-2xl font-bold text-foreground tracking-tight">
            Contraseña actualizada
          </h1>
          <p className="text-sm text-muted-foreground leading-relaxed max-w-[34ch]">
            Usa la nueva contraseña la próxima vez que inicies sesión. Si la
            guardas en un gestor de contraseñas, actualizala ahora.
          </p>
          <p className="text-xs text-muted-foreground max-w-[34ch]">
            Las sesiones abiertas en otros dispositivos siguen activas. Si
            sospechas que alguien más tiene acceso, cerrá sesión en esos
            dispositivos.
          </p>
          <Button className="mt-4" onClick={() => navigate("/index")}>
            Volver al inicio
          </Button>
        </div>
      </AuthLayout>
    );
  }

  return (
    <AuthLayout>
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-foreground tracking-tight">
          Cambiar contraseña
        </h1>
        <p className="text-sm text-muted-foreground mt-1">
          Confirma tu contraseña actual y elegí una nueva.
        </p>
      </div>

      <form onSubmit={handleChangePassword} className="space-y-5">
        <div className="space-y-1.5">
          <Label htmlFor="current-password">Contraseña actual</Label>
          <div className="relative">
            <Input
              id="current-password"
              type={showCurrentPassword ? "text" : "password"}
              value={currentPassword}
              placeholder="Tu contraseña de siempre"
              onChange={(e) => setCurrentPassword(e.target.value)}
              autoComplete="current-password"
              autoFocus
              required
              className="pr-9"
              aria-invalid={error ? "true" : undefined}
            />
            <Button
              type="button"
              variant="ghost"
              size="icon-xs"
              onClick={() => setShowCurrentPassword(!showCurrentPassword)}
              className="absolute right-1 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
              tabIndex={-1}
              aria-label={
                showCurrentPassword ? "Ocultar contraseña" : "Mostrar contraseña"
              }
            >
              {showCurrentPassword ? (
                <EyeOff className="size-3.5" />
              ) : (
                <Eye className="size-3.5" />
              )}
            </Button>
          </div>
        </div>

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
          <Label htmlFor="confirm-password">Confirmar nueva contraseña</Label>
          <div className="relative">
            <Input
              id="confirm-password"
              type={showConfirmPassword ? "text" : "password"}
              value={confirmPassword}
              placeholder="Confirmar nueva contraseña"
              onChange={(e) => setConfirmPassword(e.target.value)}
              autoComplete="new-password"
              required
              className="pr-9"
              aria-invalid={
                confirmPassword.length > 0 && !passwordsMatch ? "true" : undefined
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
                showConfirmPassword ? "Ocultar contraseña" : "Mostrar contraseña"
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
              Cambiando...
            </>
          ) : (
            <>
              <KeyRound className="size-4" />
              Cambiar contraseña
            </>
          )}
        </Button>
      </form>

      <div className="mt-8 flex flex-col items-center gap-4 text-sm">
        <button
          type="button"
          onClick={() => navigate(-1)}
          className="text-muted-foreground hover:text-primary transition-colors"
        >
          Volver
        </button>
      </div>
    </AuthLayout>
  );
}

export default ChangePasswordForm;
