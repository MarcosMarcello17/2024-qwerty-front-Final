import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { HandCoins, PlusCircle, Send } from "lucide-react";
import React, { useEffect, useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import AppLayout from "./AppLayout";
import ModalSendPayment from "./components/ModalSendPayment";
import ModalAskPayment from "./components/ModalAskPayment";
import { PaymentRequestCard } from "./components/PaymentRequestCard";
import { toast } from "sonner";
import { deletePendingTransaction } from "@/functions/deletePendingTransaction";

const payCategoriesDefault = [
  {
    value: "Impuestos y Servicios",
    label: "Impuestos y Servicios",
    iconPath: "fa-solid fa-file-invoice-dollar",
  },
  {
    value: "Entretenimiento y Ocio",
    label: "Entretenimiento y Ocio",
    iconPath: "fa-solid fa-ticket",
  },
  {
    value: "Hogar y Mercado",
    label: "Hogar y Mercado",
    iconPath: "fa-solid fa-house",
  },
  { value: "Antojos", label: "Antojos", iconPath: "fa-solid fa-candy-cane" },
  {
    value: "Electrodomesticos",
    label: "Electrodomesticos",
    iconPath: "fa-solid fa-blender",
  },
  { value: "Clase", label: "Clase", iconPath: "fa-solid fa-chalkboard-user" },
  {
    value: "Ingreso de Dinero",
    label: "Ingreso de Dinero",
    iconPath: "fa-solid fa-money-bill",
  },
];

// Sample data
const initialMyRequests = [
  {
    id: "req1",
    type: "sent",
    status: "pending",
    amount: 25.5,
    userEmail: "friend@example.com",
    userName: "Alex Doe",
    userAvatar: "https://placehold.co/40x40.png",
    description: "For the movie tickets",
    date: new Date("2024-07-20"),
  },
  {
    id: "req2",
    type: "sent",
    status: "completed",
    amount: 100.0,
    userEmail: "client@example.com",
    userName: "Client Inc.",
    userAvatar: "https://placehold.co/40x40.png",
    description: "Invoice #123",
    date: new Date("2024-07-15"),
  },
  {
    id: "req3",
    type: "sent",
    status: "declined",
    amount: 15.0,
    userEmail: "teammate@example.com",
    userName: "Sam Wilson",
    userAvatar: "https://placehold.co/40x40.png",
    description: "Team lunch",
    date: new Date("2024-07-18"),
  },
];

const initialIncomingRequests = [
  {
    id: "inc1",
    type: "received",
    status: "pending",
    amount: 50.0,
    userEmail: "landlord@example.com",
    userName: "Jane Smith",
    userAvatar: "https://placehold.co/40x40.png",
    description: "Half of the internet bill",
    date: new Date("2024-07-21"),
  },
  {
    id: "inc2",
    type: "received",
    status: "completed",
    amount: 45.75,
    userEmail: "roommate@example.com",
    userName: "John Roe",
    userAvatar: "https://placehold.co/40x40.png",
    description: "Groceries",
    date: new Date("2024-07-10"),
  },
];

const initialPaymentHistory = [
  {
    id: "hist1",
    type: "sent",
    amount: 75.0,
    userEmail: "another-friend@example.com",
    userName: "Casey Jones",
    userAvatar: "https://placehold.co/40x40.png",
    description: "Birthday gift",
    date: new Date("2024-07-22"),
  },
  {
    id: "hist2",
    type: "received",
    amount: 200.0,
    userEmail: "customer@example.com",
    userName: "Customer A",
    userAvatar: "https://placehold.co/40x40.png",
    description: "Freelance work payment",
    date: new Date("2024-07-19"),
  },
];

export default function PaymentsPage() {
  const [isRequestFormOpen, setIsRequestFormOpen] = useState(false);
  const [isSendFormOpen, setIsSendFormOpen] = useState(false);
  const [payCategories, setPayCategories] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [tranPend, setTranPend] = useState([]);
  const [tranPendCobro, setTranPendCobro] = useState([]);

  useEffect(() => {
    fetchPersonalCategorias();
    showTransactionsPendientes();
  }, []);

  const aceptarTransaccion = async (transaccion, categoria, tipoGasto) => {
    const token = localStorage.getItem("token");
    let url =
      "https://two024-qwerty-back-final-marcello.onrender.com/api/transacciones";
    if (transaccion.id_reserva == "Cobro") {
      url += "/crearPago/" + transaccion.sentByEmail;
      const motivo = transaccion.motivo;
      const valor = transaccion.valor;
      const fecha = transaccion.fecha;
      try {
        const response = await fetch(url, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ motivo, valor, fecha, categoria, tipoGasto }),
        });
        if (response.ok) {
          const data = await response.json();
          toast({
            title: "Transaccion aceptada",
            description:
              "Puede observar la transaccion en la pagina de transacciones",
          });
        }
      } catch (err) {
        console.log(err);
      }
    } else if (transaccion.id_reserva == "Pago") {
      toast({
        title: "Transaccion aceptada",
        description:
          "Puede observar la transaccion en la pagina de transacciones",
      });
    }
  };

  const isAccepted = async (transaction, categoria = "", tipoGasto = "") => {
    await aceptarTransaccion(transaction, categoria, tipoGasto);
    eliminarTransaccionPendiente(transaction.id);
    showTransactionsPendientes();
  };

  const eliminarTransaccionPendiente = async (id) => {
    const tranEliminada = await deletePendingTransaction(id);
    tranEliminada ? showTransactionsPendientes() : console.log("Error");
  };

  const isRejected = (transaction) => {
    eliminarTransaccionPendiente(transaction.id);
    if (transaction.id_reserva != "Cobro" && transaction.id_reserva != "Pago") {
      enviarRespuesta("rechazada", transaction.id_reserva);
    }
    setPendTran(false);
  };

  const fetchPersonalCategorias = async () => {
    setIsLoading(true);
    const token = localStorage.getItem("token");
    try {
      const response = await fetch(
        "https://two024-qwerty-back-final-marcello.onrender.com/api/personal-categoria",
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (response.ok) {
        const data = await response.json();
        const customOptions = data.map((cat) => ({
          label: cat.nombre,
          value: cat.nombre,
          iconPath: cat.iconPath,
        }));

        setPayCategories([...payCategoriesDefault, ...customOptions]);
      }
    } catch (error) {
      console.error("Error al obtener las categorías personalizadas:", error);
    }
  };

  const showTransactionsPendientes = async () => {
    const token = localStorage.getItem("token");
    try {
      const response = await fetch(
        "https://two024-qwerty-back-final-marcello.onrender.com/api/transaccionesPendientes/user",
        {
          method: "GET",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      if (!response.ok) {
        throw new Error(`Error: ${response.status}`);
      }

      const data = await response.json();
      console.log(data);
      setTranPend(data.filter((item) => item.id_reserva === "Pago"));
      setTranPendCobro(data.filter((item) => item.id_reserva === "Cobro"));
    } catch (err) {
      console.error("Error fetching transactions:", err);
    } finally {
      console.log("FIN PROCESO");
    }
  };

  return (
    <AppLayout>
      <div className="space-y-8">
        <div className="flex flex-col sm:flex-row justify-between items-center space-y-4 sm:space-y-0">
          <div className="flex items-center space-x-2">
            <HandCoins className="h-8 w-8 text-primary" />
            <h1 className="text-3xl font-bold font-headline text-white">
              Pagos
            </h1>
          </div>
          <div className="flex items-center space-x-2">
            <Dialog open={isSendFormOpen} onOpenChange={setIsSendFormOpen}>
              <DialogTrigger asChild>
                <Button variant="outline">
                  <Send className="mr-2 h-4 w-4" /> Enviar Pago
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-[425px] bg-card">
                <DialogHeader>
                  <DialogTitle className="font-headline">
                    Enviar Pago
                  </DialogTitle>
                  <DialogDescription>
                    Enviar dinero a otro usuario
                  </DialogDescription>
                </DialogHeader>
                <ModalSendPayment
                  closeModal={() => setIsSendFormOpen(false)}
                  payCategories={payCategories}
                />
              </DialogContent>
            </Dialog>
            <Dialog
              open={isRequestFormOpen}
              onOpenChange={setIsRequestFormOpen}
            >
              <DialogTrigger asChild>
                <Button className="bg-primary hover:bg-primary/90 text-primary-foreground">
                  <PlusCircle className="mr-2 h-4 w-4" /> Solicitar Pago
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-[425px] bg-card">
                <DialogHeader>
                  <DialogTitle className="font-headline">
                    Nueva solicitud de pago
                  </DialogTitle>
                  <DialogDescription>
                    Envia solicitud de pago a otro usuario con su email
                  </DialogDescription>
                </DialogHeader>
                <ModalAskPayment
                  closeModal={() => setIsRequestFormOpen(false)}
                />
              </DialogContent>
            </Dialog>
          </div>
        </div>

        <Tabs defaultValue="incoming-requests" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="incoming-requests">
              Pagos Realizados / A Realizar ({tranPendCobro.length})
            </TabsTrigger>
            <TabsTrigger value="my-requests">
              Pagos Recibidos / A recibir ({tranPend.length})
            </TabsTrigger>
          </TabsList>
          <TabsContent value="incoming-requests">
            <Card>
              <CardHeader>
                <CardTitle>Pagos Realizados</CardTitle>
                <CardDescription>
                  Estos son pagos que realizaste o te solicitaron
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {tranPendCobro.length > 0 ? (
                  tranPendCobro.map((req) => (
                    <PaymentRequestCard
                      key={req.id}
                      transaction={req}
                      type="sent"
                      payCategories={payCategories}
                      onPay={(transaction, cat, tipo) =>
                        isAccepted(transaction, cat, tipo)
                      }
                      onDecline={(transaction) => isRejected(transaction)}
                    />
                  ))
                ) : (
                  <p className="text-muted-foreground text-center py-4">
                    No tenes pagos realizados o por realizar
                  </p>
                )}
              </CardContent>
            </Card>
          </TabsContent>
          <TabsContent value="my-requests">
            <Card>
              <CardHeader>
                <CardTitle>Pagos Recibidos</CardTitle>
                <CardDescription>
                  Estos son pagos que solicitaste o que recibiste
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {tranPend.length > 0 ? (
                  tranPend.map((req) => (
                    <PaymentRequestCard
                      key={req.id}
                      transaction={req}
                      type={"Recibido"}
                      onPay={(transaction) => isAccepted(transaction)}
                    />
                  ))
                ) : (
                  <p className="text-muted-foreground text-center py-4">
                    Todavia no recibiste ningun pago
                  </p>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </AppLayout>
  );
}
