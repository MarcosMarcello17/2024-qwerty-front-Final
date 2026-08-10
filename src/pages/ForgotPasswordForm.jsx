import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Mail, Loader2, CheckCircle2 } from "lucide-react";
import AuthLayout from "../components/AuthLayout";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";

const BACK_URL = import.meta.env.VITE_BACK_SERVER_URL;

function ForgotPasswordForm() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [error, setError] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setIsLoading(true);
    try {
      const response = await fetch(`${BACK_URL}/api/auth/forgot-password`, {
        method: "POST",
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
        body: new URLSearchParams({
          email: email,
        }),
      });

      if (response.ok) {
        setSubmitted(true);
      } else if (response.status === 404) {
        setError("No encontramos una cuenta con ese email.");
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

  return (
    <AuthLayout>
      {submitted ? (
            <div className="flex flex-col items-center text-center gap-4">
              <div className="rounded-full bg-primary/10 p-3">
                <CheckCircle2 className="size-8 text-primary" />
              </div>
              <h1 className="text-2xl font-bold text-foreground tracking-tight">
                Revisa tu email
              </h1>
              <p className="text-sm text-muted-foreground leading-relaxed max-w-[32ch]">
                Enviamos un enlace de recuperación a{" "}
                <span className="font-medium text-foreground">{email}</span>.
                Revisa también tu carpeta de spam.
              </p>
              <p className="text-xs text-muted-foreground">
                El enlace expira en 1 hora.
              </p>
              <Button
                variant="secondary"
                className="mt-4"
                onClick={() => navigate("/")}
              >
                Volver a iniciar sesión
              </Button>
            </div>
          ) : (
            <>
              <div className="mb-8">
                <h1 className="text-2xl font-bold text-foreground tracking-tight">
                  Recuperar contraseña
                </h1>
                <p className="text-sm text-muted-foreground mt-1">
                  Ingresa tu email y te enviaremos un enlace para restablecer tu
                  contraseña.
                </p>
              </div>

              <form onSubmit={handleSubmit} className="space-y-5">
                <div className="space-y-1.5">
                  <Label htmlFor="forgot-email">Email</Label>
                  <Input
                    id="forgot-email"
                    type="email"
                    value={email}
                    placeholder="tu@email.com"
                    onChange={(e) => setEmail(e.target.value)}
                    autoComplete="email"
                    autoFocus
                    required
                    aria-invalid={error ? "true" : undefined}
                  />
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
                      Enviando...
                    </>
                  ) : (
                    <>
                      <Mail className="size-4" />
                      Enviar enlace de recuperación
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
            </>
          )}
    </AuthLayout>
  );
}

export default ForgotPasswordForm;
