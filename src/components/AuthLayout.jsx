import logo from "../assets/logo-removebg-preview.png";

/**
 * Shell compartido por todas las pantallas de autenticacion.
 * El panel de marca es lo que le dice al usuario que esta en el sitio real
 * antes de escribir una contraseña.
 */
function AuthLayout({ children }) {
  return (
    <div className="flex min-h-screen bg-background">
      {/* Panel izquierdo: marca (oculto en mobile) */}
      <div className="hidden lg:flex lg:w-[45%] flex-col items-center justify-center bg-card relative overflow-hidden">
        <div
          className="absolute inset-0 opacity-[0.03]"
          style={{
            backgroundImage:
              "linear-gradient(var(--border) 1px, transparent 1px), linear-gradient(90deg, var(--border) 1px, transparent 1px)",
            backgroundSize: "48px 48px",
          }}
        />
        <div className="relative z-10 flex flex-col items-center gap-6 px-12">
          <img
            src={logo}
            alt="CashFlowPro"
            className="w-40 h-40 object-contain"
          />
          <p className="text-muted-foreground text-sm text-center max-w-[28ch] leading-relaxed">
            Tus finanzas personales, organizadas y bajo control.
          </p>
        </div>
      </div>

      {/* Panel derecho: formulario */}
      <div className="flex flex-1 flex-col items-center justify-center px-6 py-12 sm:px-12">
        {/* Marca compacta solo en mobile */}
        <div className="lg:hidden flex flex-col items-center gap-3 mb-10">
          <img
            src={logo}
            alt="CashFlowPro"
            className="w-20 h-20 object-contain"
          />
        </div>

        <div className="w-full max-w-sm">{children}</div>
      </div>
    </div>
  );
}

export default AuthLayout;
