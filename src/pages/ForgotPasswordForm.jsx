// ForgotPasswordForm.jsx
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import React, { useState } from "react";

function ForgotPasswordForm() {
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [messageColor, setMessageColor] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const response = await fetch(
        "https://two024-qwerty-back-final-marcello.onrender.com/api/auth/forgot-password?email=" +
          email,
        {
          method: "POST",
        }
      );
      /*const response = await fetch("https://two024-qwerty-back-final-marcello.onrender.com/api/auth/forgot-password?email=" + email, {
        method: "POST"
      });*/

      if (response.ok) {
        setMessage(
          "Email enviado con éxito. Por favor revisa tu bandeja de entrada."
        );
        setMessageColor("text-green-600 text-sm text-center");
      } else {
        setMessage("Error al enviar el email.");
        setMessageColor("text-red-500 text-sm text-center");
      }
    } catch (err) {
      setMessage("Ocurrió un error.");
      setMessageColor("text-red-500 text-sm text-center");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-background p-4">
      <div className="w-full max-w-md">
        <Card className="w-full bg-card shadow-xl">
          <form onSubmit={handleSubmit} className="space-y-4">
            <CardHeader>
              <CardTitle className="text-2xl font-headline text-center">
                Recuperar Contraseña
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
              {message && <p className={messageColor}>{message}</p>}
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
                  <>Enviar e-mail de Recuperacion</>
                )}
              </Button>
            </CardFooter>
          </form>
        </Card>
        <p className="mt-8 text-center text-sm text-muted-foreground">
          Volver a
          <a href="/" className="font-medium text-primary hover:underline">
            {" "}
            Inicio sesión
          </a>
        </p>
      </div>
    </div>
  );
}

export default ForgotPasswordForm;
