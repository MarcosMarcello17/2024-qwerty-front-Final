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
