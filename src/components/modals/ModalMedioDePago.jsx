import { useEffect, useRef, useState } from "react";
import { AlertCircle, Loader2 } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { FieldError, fieldClass, labelClass } from "@/components/modals/modal-fields";
import PropTypes from "prop-types";

const NOMBRE_MAX = 30;

/*
  Los cuatro llamadores devuelven el mensaje de error crudo del backend
  (response.text()). Eso puede ser HTML, un JSON o un stack: nada que sirva
  para leer en un modal. Se muestra sólo si parece una frase.
*/
const mensajeUsable = (valor) => {
  if (typeof valor !== "string") return "";
  const limpio = valor.trim();
  if (!limpio) return "";
  if (limpio.length > 160) return "";
  if (/^[[{<]/.test(limpio)) return "";
  return limpio;
};

ModalMedioDePago.propTypes = {
  isOpen: PropTypes.bool,
  onRequestClose: PropTypes.func,
  handleCreateTP: PropTypes.func,
  handleEditTP: PropTypes.func,
  edit: PropTypes.bool,
  editTP: PropTypes.object,
};

export default function ModalMedioDePago({
  isOpen = false,
  onRequestClose = () => {},
  handleCreateTP = async () => {},
  handleEditTP = async () => {},
  edit = false,
  editTP = {},
}) {
  const [nombre, setNombre] = useState("");
  const [fieldError, setFieldError] = useState("");
  const [formError, setFormError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [confirmingClose, setConfirmingClose] = useState(false);

  const nombreRef = useRef(null);

  const nombreOriginal = editTP?.value ?? "";
  const isDirty = edit
    ? nombre.trim() !== nombreOriginal.trim()
    : nombre.trim() !== "";

  /*
    Se siembra al abrir y no en cada cambio de props: `editTP` es un objeto
    nuevo en cada render del padre y reejecutaría el efecto encima de lo que
    el usuario está escribiendo.
  */
  useEffect(() => {
    if (!isOpen) return;
    setNombre(edit ? nombreOriginal : "");
    setFieldError("");
    setFormError("");
    setIsLoading(false);
    setConfirmingClose(false);
  }, [isOpen, edit, nombreOriginal]);

  const cerrar = () => {
    setConfirmingClose(false);
    onRequestClose();
  };

  /*
    Único camino de salida: Escape, click afuera, la X de Radix y el botón
    Cancelar pasan por acá. Antes Escape iba directo a onRequestClose y podía
    cerrar con el request en vuelo o tirar lo que el usuario había cargado.
  */
  const requestClose = () => {
    if (isLoading) return;
    if (isDirty) {
      setConfirmingClose(true);
      return;
    }
    cerrar();
  };

  const onSubmit = async (event) => {
    event.preventDefault();
    const limpio = nombre.trim();

    if (!limpio) {
      setFieldError("Ponele un nombre al medio de pago.");
      setFormError("");
      nombreRef.current?.focus();
      return;
    }

    // Editar sin cambios no dispara un request al pedo.
    if (edit && !isDirty) {
      cerrar();
      return;
    }

    setFieldError("");
    setFormError("");
    setIsLoading(true);

    try {
      const errorMessage = edit
        ? await handleEditTP(editTP, limpio)
        : await handleCreateTP(limpio);

      if (errorMessage) {
        setFormError(
          mensajeUsable(errorMessage) ||
            (edit
              ? "No pudimos guardar los cambios. Tus datos siguen acá: volvé a intentar."
              : "No pudimos crear el medio de pago. Tus datos siguen acá: volvé a intentar."),
        );
        setIsLoading(false);
        return;
      }

      cerrar();
    } catch (error) {
      console.error("Error al guardar el medio de pago:", error);
      setFormError(
        edit
          ? "No pudimos guardar los cambios. Tus datos siguen acá: volvé a intentar."
          : "No pudimos crear el medio de pago. Tus datos siguen acá: volvé a intentar.",
      );
      setIsLoading(false);
    }
  };

  return (
    <Dialog
      open={isOpen}
      onOpenChange={(next) => {
        if (!next) requestClose();
      }}
    >
      <DialogContent
        /*
          Radix cierra solo con Escape y con click afuera: lo cancelamos siempre
          y pasamos por requestClose para no tirar lo que el usuario cargó.
        */
        onEscapeKeyDown={(event) => {
          event.preventDefault();
          requestClose();
        }}
        onInteractOutside={(event) => {
          event.preventDefault();
          requestClose();
        }}
        className="max-h-[calc(100dvh-2rem)] max-w-md overflow-y-auto border border-border bg-card p-5 text-card-foreground sm:max-w-md"
      >
        <DialogHeader className="pr-8">
          <DialogTitle className="text-xl font-semibold text-card-foreground">
            {edit ? "Editar medio de pago" : "Nuevo medio de pago"}
          </DialogTitle>
          <DialogDescription>
            {edit
              ? `Estás renombrando "${nombreOriginal}". Se actualiza en todas tus transacciones.`
              : "Cómo pagaste: una tarjeta, una billetera, una cuenta. Va a aparecer al cargar transacciones."}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={onSubmit} className="flex flex-col gap-4">
          <div>
            <label htmlFor="mdp-nombre" className={labelClass}>
              Nombre
            </label>
            <input
              id="mdp-nombre"
              ref={nombreRef}
              type="text"
              autoFocus
              maxLength={NOMBRE_MAX}
              placeholder="Visa débito, Mercado Pago, efectivo…"
              value={nombre}
              onChange={(e) => {
                setNombre(e.target.value);
                setFieldError("");
              }}
              disabled={isLoading}
              aria-invalid={Boolean(fieldError)}
              aria-describedby={
                fieldError ? "mdp-nombre-error" : "mdp-nombre-hint"
              }
              className={fieldClass(fieldError)}
            />
            <FieldError id="mdp-nombre-error" message={fieldError} />
            {!fieldError && (
              <p
                id="mdp-nombre-hint"
                className="mt-1.5 text-xs text-muted-foreground"
              >
                Tiene que ser distinto de tus otros medios de pago. Hasta{" "}
                {NOMBRE_MAX} caracteres.
              </p>
            )}
          </div>

          {formError && (
            <div
              role="alert"
              aria-live="assertive"
              className="flex items-start gap-2 rounded-lg border border-destructive/40 bg-destructive/10 p-3 text-sm text-destructive"
            >
              <AlertCircle
                className="mt-0.5 size-4 shrink-0"
                aria-hidden="true"
              />
              <span>{formError}</span>
            </div>
          )}

          {confirmingClose ? (
            <div className="rounded-lg border border-border bg-background p-3">
              <p className="text-sm text-foreground">
                {edit
                  ? "Tenés cambios sin guardar. ¿Los descartamos?"
                  : "Cargaste un nombre sin guardar. ¿Lo descartamos?"}
              </p>
              <div className="mt-3 flex gap-2">
                <button
                  type="button"
                  onClick={cerrar}
                  className="h-11 flex-1 rounded-lg bg-destructive/10 px-4 text-sm font-semibold text-destructive transition-colors duration-200 hover:bg-destructive/20 focus:outline-none focus:ring-3 focus:ring-destructive/50"
                >
                  Descartar
                </button>
                <button
                  type="button"
                  onClick={() => setConfirmingClose(false)}
                  className="h-11 flex-1 rounded-lg border border-border px-4 text-sm font-semibold text-foreground transition-colors duration-200 hover:bg-secondary focus:outline-none focus:ring-3 focus:ring-ring/50"
                >
                  Seguir editando
                </button>
              </div>
            </div>
          ) : (
            <div className="flex gap-2">
              <button
                type="submit"
                disabled={isLoading}
                className="flex h-11 flex-1 items-center justify-center gap-2 rounded-lg bg-primary px-4 font-semibold text-primary-foreground transition-colors duration-200 hover:bg-accent focus:outline-none focus:ring-3 focus:ring-ring/50 disabled:opacity-60"
              >
                {isLoading && (
                  <Loader2
                    className="size-4 animate-spin motion-reduce:animate-none"
                    aria-hidden="true"
                  />
                )}
                {isLoading ? "Guardando…" : edit ? "Guardar cambios" : "Crear"}
              </button>
              <button
                type="button"
                onClick={requestClose}
                disabled={isLoading}
                className="h-11 rounded-lg px-4 font-medium text-muted-foreground transition-colors duration-200 hover:bg-secondary hover:text-foreground focus:outline-none focus:ring-3 focus:ring-ring/50 disabled:opacity-60"
              >
                Cancelar
              </button>
            </div>
          )}
        </form>
      </DialogContent>
    </Dialog>
  );
}
