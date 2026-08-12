import { useEffect, useRef, useState } from "react";
import { AlertCircle, Loader2 } from "lucide-react";
import { CategoryIcon, categoryIconLabel } from "@/lib/categoryIcons";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { FieldError, fieldClass, labelClass } from "./modal-fields";
import IconSelector from "./CategoryModal/IconSelector";
import { createCatAPI } from "@/functions/createCatAPI";

const NOMBRE_MAX = 30;

export default function CategoryModal({
  isOpen = false,
  onRequestClose = () => {},
  handleEditCat = async () => {},
  onCreatedCategory = (newCat) => {},
  edit = false,
  editCat = {},
  isLoadingAdd = false,
  isLoadingEdit = false,
}) {
  const [nombre, setNombre] = useState("");
  const [iconKey, setIconKey] = useState("");

  const [fieldErrors, setFieldErrors] = useState({});
  const [formError, setFormError] = useState("");
  const [confirmingClose, setConfirmingClose] = useState(false);

  const nombreRef = useRef(null);

  const isLoading = edit ? isLoadingEdit : isLoadingAdd;
  const nombreOriginal = editCat?.label ?? "";
  const iconoOriginal = editCat?.iconPath ?? "";

  /*
    Se siembra al abrir, no en cada cambio de props: el efecto viejo se
    saltaba la limpieza cuando `editCat` era `{}` (un objeto vacío es truthy)
    y dejaba el formulario con datos de la categoría anterior.
  */
  useEffect(() => {
    if (!isOpen) return;
    setNombre(edit ? nombreOriginal : "");
    setIconKey(edit ? iconoOriginal : "");
    setFieldErrors({});
    setFormError("");
    setConfirmingClose(false);
  }, [isOpen, edit, nombreOriginal, iconoOriginal]);

  const nombreIcono = categoryIconLabel(iconKey);

  const isDirty = edit
    ? nombre !== nombreOriginal || iconKey !== iconoOriginal
    : nombre.trim() !== "" || iconKey !== "";

  const validar = () => {
    const errores = {};
    const datoIngresado = nombre.trim();
    if (!datoIngresado) {
      errores.nombre = "Ponele un nombre a la categoría.";
    }
    if (!iconKey) {
      errores.icono = "Elegí un icono para reconocerla de un vistazo.";
    }
    return errores;
  };

  const cerrar = () => {
    setConfirmingClose(false);
    onRequestClose();
  };

  const requestClose = () => {
    if (isLoading) return;
    if (isDirty) {
      setConfirmingClose(true);
      return;
    }
    cerrar();
  };

  /*
      Devuelve el mensaje de error (o vacío) porque es lo que CategoryModal
      espera para decidir si se cierra o si muestra el problema sin perder lo
      que el usuario ya cargó.
    */
  const handleCreateCat = async (nombre, icono) => {
    const ret = await createCatAPI(nombre, icono);
    if (ret.newCat != null) {
      onCreatedCategory(ret.newCat);
      return null;
    }
    return ret.error;
  };

  const onSubmit = async (event) => {
    event.preventDefault();
    const errores = validar();
    setFieldErrors(errores);
    setFormError("");
    if (Object.keys(errores).length > 0) {
      if (errores.nombre) nombreRef.current?.focus();
      return;
    }

    const limpio = nombre.trim();

    try {
      const errorMessage = edit
        ? await handleEditCat(editCat, limpio, iconKey)
        : await handleCreateCat(limpio, iconKey);

      if (errorMessage) {
        setFormError(errorMessage);
        return;
      }
      cerrar();
    } catch (error) {
      console.error("Error al guardar la categoría:", error);
      setFormError(
        edit
          ? "No pudimos guardar los cambios. Tus datos siguen acá: volvé a intentar."
          : "No pudimos crear la categoría. Tus datos siguen acá: volvé a intentar.",
      );
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
            {edit ? "Editar categoría" : "Nueva categoría"}
          </DialogTitle>
          <DialogDescription>
            {edit
              ? "Cambiá el nombre o el icono con el que la reconocés."
              : "Elegí un nombre y un icono para agrupar tus movimientos."}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={onSubmit} className="flex flex-col gap-4">
          <div className="flex items-center gap-3 rounded-lg border border-border bg-background px-3 py-2.5">
            <CategoryIcon
              iconPath={iconKey}
              className={`size-7 shrink-0 ${
                iconKey ? "text-primary" : "text-muted-foreground/50"
              }`}
            />
            <span className="min-w-0">
              <span className="block truncate font-headline font-semibold text-foreground">
                {nombre.trim() || "Tu categoría"}
              </span>
              <span className="block truncate text-xs text-muted-foreground">
                {nombreIcono ??
                  (iconKey ? "Icono actual" : "Sin icono elegido")}
              </span>
            </span>
          </div>

          <div>
            <label htmlFor="cat-nombre" className={labelClass}>
              Nombre
            </label>
            <input
              id="cat-nombre"
              ref={nombreRef}
              type="text"
              autoFocus
              maxLength={NOMBRE_MAX}
              placeholder="Nafta, alquiler, mascotas…"
              value={nombre}
              onChange={(e) => {
                setNombre(e.target.value);
                setFieldErrors((prev) => ({ ...prev, nombre: undefined }));
              }}
              aria-invalid={Boolean(fieldErrors.nombre)}
              aria-describedby={
                fieldErrors.nombre ? "cat-nombre-error" : "cat-nombre-hint"
              }
              className={fieldClass(fieldErrors.nombre)}
            />
            <FieldError id="cat-nombre-error" message={fieldErrors.nombre} />
            {!fieldErrors.nombre && (
              <p
                id="cat-nombre-hint"
                className="mt-1.5 text-xs text-muted-foreground"
              >
                Tiene que ser distinto de tus otras categorías. Hasta{" "}
                {NOMBRE_MAX} caracteres.
              </p>
            )}
          </div>

          <IconSelector onIconChange={(iconKey) => setIconKey(iconKey)} />
          <FieldError id="cat-nombre-error" message={fieldErrors.icono} />

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
                  : "Cargaste datos sin guardar. ¿Los descartamos?"}
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
                {isLoading
                  ? "Guardando…"
                  : edit
                    ? "Guardar cambios"
                    : "Crear categoría"}
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
