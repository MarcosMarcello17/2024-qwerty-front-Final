import { Loader2 } from "lucide-react";
import { SidebarProvider } from "@/components/ui/sidebar";
import Header from "./components/Header";
import { SidebarNav } from "./components/SidebarNav";
import { useAuth } from "@/hooks/useAuth";
import { AuthenticationExpiredNotification } from "@/components/AuthenticationExpiredNotification";
import AlertPending from "./components/AlertPending";
import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { getPersonalCategorias } from "@/functions/getPersonalCategorias";
import { deletePendingTransaction } from "@/functions/deletePendingTransaction";

export default function AppLayout({ children }) {
  // Use the authentication hook to constantly verify token validity
  const {
    isAuthenticated,
    isLoading,
    showAuthExpiredNotification,
    setShowAuthExpiredNotification,
  } = useAuth();
  const [pendTran, setPendTran] = useState(false);
  const [tranPendiente, setTranPendiente] = useState({});
  const { data: payCategories } = useQuery(getPersonalCategorias());

  const aceptarTransaccion = async (transaccion, categoria, tipoGasto) => {
    const token = localStorage.getItem("token");
    setActionError(null);
    setTransaccionesCargadas(false);
    let url = `${BACK_URL}/api/transacciones`;
    if (transaccion.id_reserva === "Cobro") {
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
          const updatedTransacciones = [...transacciones, data];
          updatedTransacciones.sort(
            (a, b) => new Date(b.fecha) - new Date(a.fecha),
          );
          setTransacciones(updatedTransacciones);
          setStatusMessage("Cobro registrado.");
        } else {
          console.error(
            "Error al crear pago:",
            response.status,
            response.statusText,
          );
          setActionError("No pudimos registrar el cobro. Volvé a intentar.");
        }
      } catch (err) {
        console.error("Error en la solicitud de cobro:", err);
        setActionError(
          "No hay conexión con el servidor. El cobro no se registró.",
        );
      } finally {
        setTransaccionesCargadas(true);
      }
    } else if (transaccion.id_reserva === "Pago") {
      setStatusMessage("Pago aprobado.");
      setTransaccionesCargadas(true);
    } else if (transaccion.id_reserva === "Grupo") {
      url = `${BACK_URL}/api/grupos/agregar-usuario`;
      const grupoId = transaccion.grupoId;
      try {
        const response = await fetch(url, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ grupo_id: grupoId }),
        });
        if (response.ok) {
          setStatusMessage("Te sumaste al grupo.");
        } else {
          console.error(
            "Error al agregar usuario al grupo:",
            response.status,
            response.statusText,
          );
          setActionError("No pudimos sumarte al grupo. Volvé a intentar.");
        }
      } catch (err) {
        console.error(
          "Error en la solicitud de agregar usuario al grupo:",
          err,
        );
        setActionError(
          "No hay conexión con el servidor. No te sumamos al grupo.",
        );
      } finally {
        setTransaccionesCargadas(true);
      }
    } else {
      const method = "POST";
      let motivo = transaccion.motivo;
      let valor = transaccion.valor;
      let fecha = transaccion.fecha;
      let categoriaTransaccion = categoria || "Clase";
      try {
        const response = await fetch(url, {
          method: method,
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            motivo,
            valor,
            fecha,
            categoria: categoriaTransaccion,
          }),
        });

        if (response.ok) {
          const data = await response.json();
          const updatedTransacciones = [...transacciones, data];
          updatedTransacciones.sort(
            (a, b) => new Date(b.fecha) - new Date(a.fecha),
          );
          setTransacciones(updatedTransacciones);
          setStatusMessage("Transacción aceptada.");
        } else {
          console.error(
            "Error al crear transaccion:",
            response.status,
            response.statusText,
          );
          setActionError(
            "No pudimos aceptar la transacción. Volvé a intentar.",
          );
        }
      } catch (err) {
        console.error("Error en la solicitud de transaccion:", err);
        setActionError(
          "No hay conexión con el servidor. La transacción no se aceptó.",
        );
      } finally {
        setTransaccionesCargadas(true);
      }
    }
  };
  const isAccepted = async (transaction, categoria, tipoGasto) => {
    await aceptarTransaccion(transaction, categoria, tipoGasto);
    eliminarTransaccionPendiente(transaction.id);
    if (
      transaction.id_reserva !== "Cobro" &&
      transaction.id_reserva !== "Pago"
    ) {
      enviarRespuesta("aceptada", transaction.id_reserva);
    }
    setPendTran(false);
  };

  const eliminarTransaccionPendiente = async (id) => {
    const tranEliminada = await deletePendingTransaction(id);
    if (tranEliminada) {
      showTransactionsPendientes();
    } else {
      setActionError("No pudimos cerrar la solicitud pendiente.");
    }
  };

  const showTransactionsPendientes = async () => {
    const token = localStorage.getItem("token");
    try {
      const response = await fetch(
        `${BACK_URL}/api/transaccionesPendientes/user`,
        {
          method: "GET",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        },
      );

      if (!response.ok) {
        throw new Error(`Error: ${response.status}`);
      }

      let data = await response.json();
      data = data.filter(
        (tran) => tran.id_reserva !== "Pago" && tran.id_reserva !== "Cobro",
      );
      if (data[0] !== null && data[0] !== undefined) {
        setTranPendiente(data[0]);
        setPendTran(true);
      }
    } catch (err) {
      console.error("Error fetching transactions:", err);
    }
  };

  const enviarRespuesta = async (resp, id_reserva) => {
    const token = localStorage.getItem("token");
    setTransaccionesCargadas(false);
    const url = `${BACK_URL}/api/transaccionesPendientes/${resp}?id_reserva=${id_reserva}`;
    try {
      const response = await fetch(url, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        console.error(
          "Error al enviar respuesta:",
          response.status,
          response.statusText,
        );
        setActionError(
          "Registramos tu decisión localmente, pero no pudimos avisarle a la otra persona.",
        );
      }
    } catch (err) {
      console.error("Error en la solicitud de respuesta:", err);
      setActionError(
        "Registramos tu decisión localmente, pero no pudimos avisarle a la otra persona.",
      );
    } finally {
      setTransaccionesCargadas(true);
    }
  };

  const isRejected = (transaction) => {
    eliminarTransaccionPendiente(transaction.id);
    if (
      transaction.id_reserva !== "Cobro" &&
      transaction.id_reserva !== "Pago"
    ) {
      enviarRespuesta("rechazada", transaction.id_reserva);
    }
    setPendTran(false);
  };
  return (
    <SidebarProvider defaultOpen={true}>
      <div className="flex min-h-full min-w-full flex-col">
        {isLoading ? (
          <div
            role="status"
            aria-live="polite"
            className="flex h-screen w-full items-center justify-center"
          >
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
            <span className="ml-3 text-lg">Cargando...</span>
          </div>
        ) : isAuthenticated ? (
          <>
            <SidebarNav />
            <div className="flex flex-1 flex-col transition-[padding-left] duration-200 ease-linear md:pl-(--sidebar-width) group-data-[collapsible=icon]/sidebar-wrapper:md:pl-(--sidebar-width-icon)">
              <Header />
              <main className="flex-1 p-4 sm:p-6 lg:p-8">
                {children}
                <AlertPending
                  isOpen={pendTran}
                  pendingTransaction={tranPendiente}
                  isAccepted={isAccepted}
                  isRejected={isRejected}
                  payCategories={payCategories}
                />
              </main>
            </div>
          </>
        ) : null}

        {showAuthExpiredNotification && (
          <AuthenticationExpiredNotification
            onClose={() => setShowAuthExpiredNotification(false)}
          />
        )}
      </div>
    </SidebarProvider>
  );
}
