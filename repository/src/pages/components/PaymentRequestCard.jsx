// Suggested code may be subject to a license. Learn more: ~LicenseLog:382571801.
// Suggested code may be subject to a license. Learn more: ~LicenseLog:513777321.
"use client";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { format } from "date-fns";
import {
  Check,
  Send,
  ThumbsDown,
  X,
  AlertTriangle,
  CircleUserRound,
  ThumbsUp,
  Loader2,
} from "lucide-react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { cva } from "class-variance-authority";
import { useEffect, useState } from "react";
import { toast } from "sonner";

const defaultMediosDePago = [
  {
    value: "Tarjeta de credito",
    label: "Tarjeta de credito",
    textColor: "mr-2 text-yellow-500",
  },
  {
    value: "Tarjeta de Debito",
    label: "Tarjeta de debito",
    textColor: "mr-2 text-yellow-500",
  },
  { value: "Efectivo", label: "Efectivo", textColor: "mr-2 text-yellow-500" },
];

export function PaymentRequestCard({
  transaction,
  type,
  onPay = () => {},
  onDecline = () => {},
  onCancel = () => {},
  onRemind = () => {},
  payCategories,
  isProcessing = false,
  disabled = false,
}) {
  const [categoria, setCategoria] = useState("");
  const [payOption, setPayOption] = useState("");
  const [payOptions, setPayOptions] = useState([]);
  const getStatusBadgeVariant = (status = "pending") => {
    switch (status) {
      case "pending":
        return "secondary";
      case "completed":
        return "default";
      case "declined":
        return "destructive";
      default:
        return "outline";
    }
  };

  useEffect(() => {
    fetchPersonalTipoGastos();
  }, []);

  const fetchPersonalTipoGastos = async () => {
    const token = localStorage.getItem("token");
    try {
      const response = await fetch(
        "https://two024-qwerty-back-final-marcello.onrender.com/api/personal-tipo-gasto",
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      if (response.ok) {
        const data = await response.json();
        const customOptions = data.map((tipo) => ({
          label: tipo.nombre,
          value: tipo.nombre,
          textColor: "mr-2 text-white",
        }));
        setPayOptions([...defaultMediosDePago, ...customOptions]);
      }
    } catch (error) {
      console.error(
        "Error al obtener los tipos de gasto personalizados:",
        error
      );
    }
  };

  const handlePayment = () => {
    if (!categoria || !payOption) {
      toast({
        title: "Error",
        description: "Seleccione categoria y medio de pago",
      });
      return null;
    }

    onPay(transaction, categoria, payOption);
  };

  return (
    <Card className="hover:shadow-md transition-shadow">
      <CardContent className="p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="flex items-center gap-4 flex-1">
          <Avatar className="h-10 w-10">
            <AvatarFallback>
              <CircleUserRound />
            </AvatarFallback>
          </Avatar>
          <div className="flex-1 min-w-0">
            <p className="font-semibold">
              {type === "sent"
                ? `${transaction.sentByEmail} te esta solicitando un pago`
                : `Recibiste pago de ${transaction.sentByEmail}`}
            </p>
            <p className="text-xs text-muted-foreground">
              {format(transaction.fecha, "MMM dd, yyyy")}
            </p>
          </div>
        </div>

        <div className="flex flex-col items-end gap-2 w-full sm:w-auto">
          <div className="flex items-center gap-2">
            <span
              className={cn(
                "text-lg font-bold",
                type === "sent" ? "text-primary" : "text-green-500"
              )}
            >
              ${transaction.valor.toFixed(2)}
            </span>
          </div>
          {type === "Recibido" && (
            <div className="flex gap-2">
              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <Button
                    size="sm"
                    className="bg-green-600 hover:bg-green-700 text-white"
                    disabled={disabled || isProcessing}
                  >
                    {isProcessing ? (
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    ) : (
                      <Check className="mr-2 h-4 w-4" />
                    )}
                    {isProcessing ? "Procesando..." : "Aceptar"}
                  </Button>
                </AlertDialogTrigger>
                <AlertDialogContent className="bg-card">
                  <AlertDialogHeader>
                    <AlertDialogTitle>Ha recibido un pago</AlertDialogTitle>
                    <AlertDialogDescription>
                      Detalles del pago
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <label className="block mb-2">
                    Motivo: {transaction.motivo}
                  </label>
                  <label className="block mb-2">
                    Valor: {transaction.valor}
                  </label>
                  <label className="block mb-2">
                    Fecha: {transaction.fecha}
                  </label>
                  {transaction.sentByEmail && (
                    <label className="block mb-2">
                      Enviado por: {transaction.sentByEmail}
                    </label>
                  )}

                  <AlertDialogFooter>
                    <AlertDialogAction
                      onClick={() => onPay(transaction)}
                      className={cn(buttonVariants({ variant: "default" }))}
                      disabled={disabled || isProcessing}
                    >
                      {isProcessing ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          Procesando...
                        </>
                      ) : (
                        "Aceptar"
                      )}
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            </div>
          )}
          {type === "sent" && (
            <div className="flex gap-2">
              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <Button
                    size="sm"
                    variant="ghost"
                    disabled={disabled || isProcessing}
                  >
                    {isProcessing ? (
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    ) : (
                      <Send className="mr-2 h-4 w-4" />
                    )}
                    {isProcessing ? "Procesando..." : "Pagar"}
                  </Button>
                </AlertDialogTrigger>
                <AlertDialogContent className="bg-card">
                  <AlertDialogHeader>
                    <AlertDialogTitle>Confirmar Transaccion</AlertDialogTitle>
                    <AlertDialogDescription>
                      Para realizar el pago complete el formulario
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <label className="block mb-2">
                    Confirme o rechace la transaccion
                  </label>
                  <label className="block mb-2">
                    Motivo: {transaction.motivo}
                  </label>
                  <label className="block mb-2">
                    Valor: {transaction.valor}
                  </label>
                  <label className="block mb-2">
                    Fecha: {transaction.fecha}
                  </label>
                  {transaction.sentByEmail && (
                    <label className="block mb-2">
                      Enviado por: {transaction.sentByEmail}
                    </label>
                  )}

                  <div>
                    <label className="text-gray-100 mb-6">Categoría:</label>
                    <select
                      value={categoria}
                      onChange={(e) => setCategoria(e.target.value)}
                      className="my-1 block w-full p-2 bg-background text-white rounded-md shadow-sm focus:ring-yellow-500 focus:border-yellow-500"
                      disabled={disabled || isProcessing}
                    >
                      <option value="">Selecciona una categoría</option>
                      {payCategories.map((cat) => (
                        <option key={cat.value} value={cat.value}>
                          {cat.label}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="text-gray-100 mb-6">Tipo de Gasto:</label>
                    <select
                      value={payOption}
                      onChange={(e) => setPayOption(e.target.value)}
                      className="my-1 block w-full p-2 bg-background text-white rounded-md shadow-sm focus:ring-yellow-500 focus:border-yellow-500"
                      disabled={disabled || isProcessing}
                    >
                      <option value="">Selecciona una Tipo de Gasto</option>
                      {payOptions.map((cat) => (
                        <option key={cat.value} value={cat.value}>
                          {cat.label}
                        </option>
                      ))}
                    </select>
                  </div>

                  <AlertDialogFooter>
                    <AlertDialogCancel
                      onClick={() => onDecline(transaction)}
                      disabled={disabled || isProcessing}
                    >
                      Rechazar
                    </AlertDialogCancel>
                    <AlertDialogAction
                      onClick={() => handlePayment()}
                      className="bg-primary"
                      disabled={disabled || isProcessing}
                    >
                      {isProcessing ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          Procesando...
                        </>
                      ) : (
                        "Pagar"
                      )}
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}

const buttonVariants = cva(
  "inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50",
  {
    variants: {
      variant: {
        default: "bg-primary text-primary-foreground hover:bg-primary/90",
        destructive:
          "bg-destructive text-destructive-foreground hover:bg-destructive/90",
        outline:
          "border border-input bg-background hover:bg-accent hover:text-accent-foreground",
        secondary:
          "bg-secondary text-secondary-foreground hover:bg-secondary/80",
        ghost: "hover:bg-accent hover:text-accent-foreground",
        link: "text-primary underline-offset-4 hover:underline",
      },
      size: {
        default: "h-10 px-4 py-2",
        sm: "h-9 rounded-md px-3",
        lg: "h-11 rounded-md px-8",
        icon: "h-10 w-10",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
);
