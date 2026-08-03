import {
  SidebarProvider,
  Sidebar,
  SidebarInset,
} from "@/components/ui/sidebar";
import React, { useState } from "react";
import Header from "./components/Header";
import { SidebarNav } from "./components/SidebarNav";
import { useAuth } from "@/hooks/useAuth";
import { AuthenticationExpiredNotification } from "@/components/AuthenticationExpiredNotification";

export default function AppLayout({ children }) {
  // Use the authentication hook to constantly verify token validity
  const {
    isAuthenticated,
    isLoading,
    showAuthExpiredNotification,
    setShowAuthExpiredNotification,
  } = useAuth();
  const [payCategories, setPayCategories] = useState([]);
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

        setPayCategories([
          {
            value: "Otros",
            label: "Otros",
            iconPath: "fa-solid fa-circle-dot",
          },
          {
            value: "Gasto Grupal",
            label: "Gasto Grupal",
            iconPath: "fa-solid fa-people-group",
          },
          ...payCategoriesDefault,
          ...customOptions,
        ]);
      }
    } catch (error) {
      console.error("Error al obtener las categorías personalizadas:", error);
    }
  };
  const getTransacciones = async (filtrado = "Todas") => {
    setIsLoading(true);
    const token = localStorage.getItem("token");
    setTransaccionesCargadas(false);
    if (await checkIfValidToken(token)) {
      try {
        const apiTransacciones = await getApiTransacciones(
          filtrado,
          filtroMes,
          filtroAno
        );
        setTransacciones(apiTransacciones.transacciones);
        setTransaccionesSinFiltroCat(
          apiTransacciones.transaccionesSinFiltroCat
        );
      } catch (err) {
        console.error("Error fetching transactions:", err);
      } finally {
        setIsLoadingFilter(false);
        setTransaccionesCargadas(true);
      }
      fetchPersonalCategorias();
      showTransactionsPendientes();
    } else {
      navigate("/");
    }
    setIsLoading(false);
  };
  const openModal = () => {
    fetchGrupos();
    setIsModalOpen(true);
  };
  return (
    <SidebarProvider defaultOpen={true}>
      <div className="flex min-h-full min-w-full flex-col">
        {isLoading ? (
          <div className="flex items-center justify-center h-screen w-full">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
            <span className="ml-3 text-lg text-white">Cargando...</span>
          </div>
        ) : isAuthenticated ? (
          <>
            <SidebarNav />
            <div className="flex flex-1 flex-col md:pl-[var(--sidebar-width)] group-data-[collapsible=icon]/sidebar-wrapper:md:pl-[var(--sidebar-width-icon)] transition-[padding-left] duration-200 ease-linear">
              <Header
                payCategories={payCategories}
                setPayCategories={setPayCategories}
                fetchPersonalCategorias={fetchPersonalCategorias}
                getTransacciones={getTransacciones}
                openModal={openModal}
              />
              <main className="flex-1 p-4 sm:p-6 lg:p-8">{children}</main>
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
