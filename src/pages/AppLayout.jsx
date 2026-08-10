import { Loader2 } from "lucide-react";
import { SidebarProvider } from "@/components/ui/sidebar";
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
