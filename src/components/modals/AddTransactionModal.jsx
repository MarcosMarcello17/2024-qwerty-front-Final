import { useState, useEffect, useMemo, useRef } from "react";
import Modal from "react-modal";
import CategoryModal from "./CategoryModal";
import {
  FieldError,
  fieldClass,
  labelClass,
  selectTriggerClass,
} from "./modal-fields";
import CreatableSelect from "react-select/creatable";
import {
  AlertCircle,
  CheckCircle2,
  ChevronDown,
  Loader2,
  Plus,
  Repeat,
  Split,
  User,
  Users,
} from "lucide-react";
import { Switch } from "@/components/ui/switch";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import AutomaticDistribution from "../AutomaticDistribution";
import { checkCanDistributeAutomatically } from "../../functions/automaticDistributionAPI";
import { distributeIncomeAutomatically } from "../../functions/distributeIncomeAPI";
import { createCatAPI } from "../../functions/createCatAPI";
import { createPaymentMethodAPI } from "../../functions/createPaymentMethodAPI";
import { BACK_URL } from "@/lib/backendUrl";

const HOY = () => new Date().toISOString().split("T")[0];

const METODO_POR_DEFECTO = { value: "Efectivo", label: "Efectivo" };

const CATEGORIA_GRUPAL = { value: "Gasto Grupal", label: "Gasto Grupal" };

/*
  react-select no toma clases de Tailwind: pinta con emotion. Antes esto vivía
  en ModalForm.css apuntando a hashes (`.css-1s2u09g-control`) que react-select
  v5 ya no emite, así que los selects quedaban sin estilo. Los tokens del tema
  se aplican acá, que es el único lugar donde react-select los respeta.

  Solo queda el medio de pago: categoría y grupo ya usan el Select de shadcn.
  react-select sigue acá porque el medio de pago permite crear opciones nuevas
  (CreatableSelect), algo que el Select de Radix no hace.
*/
const selectStyles = {
  control: (base, state) => ({
    ...base,
    minHeight: "44px",
    backgroundColor: "var(--background)",
    borderColor: state.isFocused ? "var(--ring)" : "var(--border)",
    borderRadius: "var(--radius)",
    boxShadow: state.isFocused
      ? "0 0 0 3px color-mix(in oklch, var(--ring), transparent 50%)"
      : "none",
    transition: "border-color 200ms, box-shadow 200ms",
    "&:hover": { borderColor: "var(--ring)" },
  }),
  valueContainer: (base) => ({ ...base, padding: "2px 10px" }),
  singleValue: (base) => ({ ...base, color: "var(--foreground)" }),
  input: (base) => ({ ...base, color: "var(--foreground)" }),
  placeholder: (base) => ({ ...base, color: "var(--muted-foreground)" }),
  indicatorSeparator: () => ({ display: "none" }),
  dropdownIndicator: (base) => ({ ...base, color: "var(--muted-foreground)" }),
  menu: (base) => ({
    ...base,
    backgroundColor: "var(--popover)",
    border: "1px solid var(--border)",
    borderRadius: "var(--radius)",
    overflow: "hidden",
  }),
  /*
    El contenido del modal scrollea, así que un menú inline se recorta contra el
    borde. Portal al body para que siempre se vea entero.
  */
  menuPortal: (base) => ({ ...base, zIndex: 60 }),
  option: (base, state) => ({
    ...base,
    backgroundColor: state.isSelected
      ? "var(--secondary)"
      : state.isFocused
        ? "color-mix(in oklch, var(--secondary), transparent 50%)"
        : "transparent",
    color: state.isSelected ? "var(--accent)" : "var(--popover-foreground)",
    cursor: "pointer",
  }),
  noOptionsMessage: (base) => ({ ...base, color: "var(--muted-foreground)" }),
};

export default function AddTransactionModal({
  isModalOpen = false,
  closeModal = () => {},
  edit = false,
  payOptions = [],
  payCategories = [],
  onNewTransaction = () => {},
  onNewCategory = () => {},
  onNewPayMethod = () => {},
}) {
  const [isRecurrent, setIsRecurrent] = useState(false);
  const [showDistributionModal, setShowDistributionModal] = useState(false);
  const [canDistributeAutomatically, setCanDistributeAutomatically] =
    useState(false);
  const [isIngresoCategory, setIsIngresoCategory] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [grupos, setGrupos] = useState([]);
  const [gruposError, setGruposError] = useState("");
  const [modalError, setModalError] = useState("");
  const [fieldErrors, setFieldErrors] = useState({});
  const [notice, setNotice] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isModalCategoriaOpen, setIsModalCategoriaOpen] = useState(false);
  const [tipoGasto, setTipoGasto] = useState("Efectivo");
  /*
    Un solo estado reemplaza el par isGroupDisabled / isCategoryDisabled, que
    antes se escribía desde cuatro lugares con reglas contradictorias.
  */
  const [scope, setScope] = useState("personal");
  /*
    Categorías y medios de pago creados desde acá. Las listas base llegan por
    props (las dueñas son las páginas), así que lo nuevo se agrega en local y
    se avisa hacia arriba con onNewCategory / onNewPayMethod.
  */
  const [extraCategories, setExtraCategories] = useState([]);
  const [extraPayOptions, setExtraPayOptions] = useState([]);
  const [showMore, setShowMore] = useState(false);
  const [confirmingClose, setConfirmingClose] = useState(false);
  const [fecha, setFecha] = useState(HOY);
  const [selectedGroup, setSelectedGroup] = useState(null);
  const [motivo, setMotivo] = useState("");
  const [valor, setValor] = useState("");
  const [selectedPayMethod, setSelectedPayMethod] =
    useState(METODO_POR_DEFECTO);

  const valorRef = useRef(null);
  const motivoRef = useRef(null);

  const esGrupal = scope === "grupo";

  const activeGroups = useMemo(
    () =>
      Array.isArray(grupos)
        ? grupos.filter((grupo) => grupo.estado === true)
        : [],
    [grupos],
  );

  const categoryOptions = useMemo(
    () => [...payCategories, ...extraCategories],
    [payCategories, extraCategories],
  );

  const payMethodOptions = useMemo(
    () => [...payOptions, ...extraPayOptions],
    [payOptions, extraPayOptions],
  );

  const nombresDeCategorias = useMemo(
    () => categoryOptions.map((opcion) => opcion?.label).filter(Boolean),
    [categoryOptions],
  );

  const fetchGrupos = async () => {
    const token = localStorage.getItem("token");
    try {
      const response = await fetch(`${BACK_URL}/api/grupos/mis-grupos`, {
        method: "GET",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error("Error al obtener los grupos.");
      }

      const data = await response.json();
      setGrupos(data);
    } catch (error) {
      setGruposError(
        "No pudimos cargar tus grupos. Podés registrar gastos propios igual.",
      );
    }
  };

  useEffect(() => {
    fetchGrupos();
  }, []);

  // Verificar si la categoría es "Ingreso de Dinero"
  useEffect(() => {
    const isIngreso =
      selectedCategory && selectedCategory.value === "Ingreso de Dinero";
    setIsIngresoCategory(isIngreso);

    if (!isIngreso || !fecha) {
      setCanDistributeAutomatically(false);
      return;
    }

    let cancelado = false;
    (async () => {
      try {
        const canDistribute = await checkCanDistributeAutomatically(fecha);
        if (!cancelado) setCanDistributeAutomatically(canDistribute);
      } catch (error) {
        console.error("Error checking distribution availability:", error);
        if (!cancelado) setCanDistributeAutomatically(false);
      }
    })();
    return () => {
      cancelado = true;
    };
  }, [selectedCategory, fecha]);

  const handlePayChange = (value) => {
    setTipoGasto(value ? value.value : "");
    setSelectedPayMethod(value);
  };

  const handleCreateTP = async (inputValue) => {
    const newOption = await createPaymentMethodAPI({ nombre: inputValue });
    if (!newOption) {
      setModalError(
        `No pudimos crear el medio de pago "${inputValue}". Volvé a intentar.`,
      );
      return;
    }
    setExtraPayOptions((prev) => [...prev, newOption]);
    setSelectedPayMethod(newOption);
    setTipoGasto(newOption.value);
    onNewPayMethod(newOption);
  };

  /*
    Cambiar de alcance solo toca estado local: los handlers que vienen de
    Index.jsx se siguen llamando desde los selects, como antes.
  */
  const applyScope = (next) => {
    if (next === scope) return;
    setScope(next);
    setModalError("");
    setFieldErrors({});
    if (next === "personal") {
      setSelectedGroup(null);
      setSelectedCategory(null);
    } else {
      setSelectedCategory(null);
    }
  };

  const validar = () => {
    const errores = {};
    const monto = Number.parseFloat(valor);
    if (!motivo.trim()) {
      errores.motivo = "Contá en qué fue el gasto.";
    }
    if (!Number.isFinite(monto) || monto <= 0) {
      errores.valor = "Ingresá un monto mayor a cero.";
    }
    if (esGrupal && !selectedGroup) {
      errores.grupo = "Elegí a qué grupo va este gasto.";
    }
    if (!esGrupal && !selectedCategory) {
      errores.categoria = "Elegí una categoría.";
    }
    return errores;
  };

  // Devuelve true solo si el backend confirmo. ModalForm usa ese valor para
  // decidir si cierra: cerrar siempre hacia desaparecer el error con el form.
  const agregarTransaccion = async (e, categoria, isRecurrent = false) => {
    e.preventDefault();
    const token = localStorage.getItem("token");
    let bodyJson = "";
    let url = "";
    setModalError(null);
    if (selectedGroup === null) {
      bodyJson = JSON.stringify({ motivo, valor, fecha, categoria, tipoGasto });
      url = edit
        ? `${BACK_URL}/api/transacciones/${transaccionId}`
        : `${BACK_URL}/api/transacciones`;
    } else {
      const grupo = selectedGroup.value;
      bodyJson = JSON.stringify({
        motivo,
        valor,
        fecha,
        categoria,
        tipoGasto,
        grupo,
      });
      url = edit
        ? `${BACK_URL}/api/grupos/transaccion/${transaccionId}`
        : `${BACK_URL}/api/grupos/transaccion`;
    }
    const method = edit ? "PUT" : "POST";
    try {
      const response = await fetch(url, {
        method: method,
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: bodyJson,
      });
      if (response.ok) {
        const data = await response.json();
        closeModal();
        setSelectedGroup(null);
        if (isRecurrent) {
          await agregarTransaccionRecurrente({
            motivo,
            valor,
            fecha,
            categoria,
            tipoGasto,
          });
        }
        onNewTransaction(data);
        return true;
      }

      console.error(
        "Error al crear transaccion:",
        response.status,
        response.statusText,
      );
      setModalError(
        "No pudimos guardar la transacción. Revisá los datos y volvé a intentar.",
      );
      return false;
    } catch (err) {
      console.error("Error en la solicitud:", err);
      setModalError(
        "No hay conexión con el servidor. La transacción no se guardó.",
      );
      return false;
    } finally {
      clearForm();
    }
  };

  const clearForm = () => {
    setMotivo("");
    setValor("");
    setFecha(new Date().toISOString().split("T")[0]);
    setSelectedCategory(null);
    setTipoGasto("Efectivo");
    setSelectedPayMethod({
      value: "Efectivo",
      label: "Efectivo",
    });
  };

  const sendTransaccion = async (e) => {
    e.preventDefault();
    const errores = validar();
    setFieldErrors(errores);
    if (Object.keys(errores).length > 0) {
      setModalError("");
      if (errores.motivo) motivoRef.current?.focus();
      else if (errores.valor) valorRef.current?.focus();
      return;
    }

    const categoria = esGrupal
      ? CATEGORIA_GRUPAL.value
      : selectedCategory.value;

    setIsLoading(true);
    try {
      // Solo cerramos si el backend confirmo. Cerrar siempre hacia que el
      // error se fuera junto con el formulario y los datos cargados.
      const guardada = await agregarTransaccion(e, categoria, isRecurrent);
      if (guardada === false) {
        setModalError(
          "No pudimos guardar la transacción. Tus datos siguen acá: volvé a intentar.",
        );
        return;
      }
      setModalError("");
      setIsRecurrent(false);
      closeModal();
    } catch (error) {
      console.error("Error al agregar transacción:", error);
      setModalError("Error inesperado al guardar. Volvé a intentar.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleDistributeAutomatically = () => {
    if (!isIngresoCategory || !canDistributeAutomatically) {
      return;
    }
    setShowDistributionModal(true);
  };

  const handleConfirmDistribution = async (shouldDistribute) => {
    setShowDistributionModal(false);
    if (!shouldDistribute) return;

    setIsLoading(true);
    setNotice(null);
    try {
      const result = await distributeIncomeAutomatically(
        Number.parseFloat(valor),
        fecha,
        motivo || "Distribución automática",
      );

      if (result.success) {
        setNotice({
          type: "success",
          text: `Listo: se crearon ${result.transaccionesCreadas} transacciones según tus presupuestos.`,
        });
      } else {
        setNotice({
          type: "error",
          text: `No pudimos distribuir el ingreso: ${result.error}`,
        });
      }
    } catch (error) {
      console.error("Error al distribuir ingreso:", error);
      setNotice({
        type: "error",
        text: "No pudimos conectar para distribuir el ingreso. Volvé a intentar.",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleCancelDistribution = () => {
    setShowDistributionModal(false);
  };

  const isDirty =
    motivo.trim() !== "" ||
    valor !== "" ||
    selectedCategory !== null ||
    selectedGroup !== null;

  const closeWindow = () => {
    setModalError("");
    setFieldErrors({});
    setNotice(null);
    setConfirmingClose(false);
    setIsRecurrent(false);
    closeModal();
  };

  const requestClose = () => {
    if (isLoading) return;
    if (notice?.type === "success") {
      closeWindow();
      return;
    }
    if (isDirty) {
      setConfirmingClose(true);
      return;
    }
    closeWindow();
  };

  const handleCategorySelect = (category) => {
    setSelectedCategory(category);
    setFieldErrors((prev) => ({ ...prev, categoria: undefined }));
  };

  const handleGroupSelect = (group) => {
    handleGroupChange(group);
    setFieldErrors((prev) => ({ ...prev, grupo: undefined }));
    if (group) {
      setSelectedCategory(CATEGORIA_GRUPAL);
    }
  };

  const handleGroupChange = (selectedOption) => {
    if (selectedOption && selectedOption.value === null) {
      setSelectedGroup(null);
    } else {
      setSelectedGroup(selectedOption);
    }
  };

  const onCreatedCategory = (newCat) => {
    setExtraCategories((prev) => [...prev, newCat]);
    onNewCategory();
    handleCategorySelect(newCat);
  }

  const resumenOpciones = [
    fecha === HOY() ? "Hoy" : fecha.split("-").reverse().join("/"),
    selectedPayMethod?.label ?? "Sin medio de pago",
    isRecurrent ? "Se repite cada mes" : null,
  ]
    .filter(Boolean)
    .join(" · ");

  return (
    <Modal
      isOpen={isModalOpen}
      onRequestClose={requestClose}
      contentLabel={edit ? "Editar transacción" : "Nueva transacción"}
      aria={{ labelledby: "modal-form-title" }}
      overlayClassName="fixed inset-0 z-50 overflow-y-auto bg-background/85 p-4"
      className="mx-auto my-4 w-full max-w-md rounded-xl border border-border bg-card p-5 outline-none sm:my-10"
    >
      {/* TODO: Reemplazar por el Dialog de shadcn*/}
      <h2
        id="modal-form-title"
        className="text-xl font-semibold text-card-foreground"
      >
        {edit ? "Editar transacción" : "Nueva transacción"}
      </h2>

      <form onSubmit={sendTransaccion} className="mt-4 flex flex-col gap-4">
        {activeGroups.length > 0 && !edit && (
          <div
            role="radiogroup"
            aria-label="A quién corresponde el gasto"
            className="grid grid-cols-2 gap-1 rounded-lg border border-border bg-background p-1"
          >
            {[
              { key: "personal", label: "Personal", Icon: User },
              { key: "grupo", label: "De un grupo", Icon: Users },
            ].map(({ key, label, Icon }) => (
              <button
                key={key}
                type="button"
                role="radio"
                aria-checked={scope === key}
                onClick={() => applyScope(key)}
                className={`flex h-9 items-center justify-center gap-2 rounded-md text-sm font-medium transition-colors duration-200 ${
                  scope === key
                    ? "bg-secondary text-secondary-foreground"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                <Icon className="size-4" aria-hidden="true" />
                {label}
              </button>
            ))}
          </div>
        )}

        <div>
          <label htmlFor="tx-valor" className={labelClass}>
            Monto
          </label>
          <div className="relative">
            <span
              aria-hidden="true"
              className="pointer-events-none absolute left-3 top-1/2 mt-0.5 -translate-y-1/2 text-lg text-muted-foreground"
            >
              $
            </span>
            <input
              id="tx-valor"
              ref={valorRef}
              type="number"
              inputMode="decimal"
              min="0.01"
              step="0.01"
              placeholder="0.00"
              value={valor}
              onChange={(e) => {
                setValor(e.target.value);
                setFieldErrors((prev) => ({ ...prev, valor: undefined }));
              }}
              aria-invalid={Boolean(fieldErrors.valor)}
              aria-describedby={
                fieldErrors.valor ? "tx-valor-error" : undefined
              }
              className={`${fieldClass(fieldErrors.valor)} h-14 pl-8 text-2xl font-semibold tabular-nums`}
            />
          </div>
          <FieldError id="tx-valor-error" message={fieldErrors.valor} />
        </div>

        <div>
          <label htmlFor="tx-motivo" className={labelClass}>
            Motivo
          </label>
          <input
            id="tx-motivo"
            ref={motivoRef}
            type="text"
            placeholder="Café, supermercado, alquiler…"
            value={motivo}
            onChange={(e) => {
              setMotivo(e.target.value);
              setFieldErrors((prev) => ({ ...prev, motivo: undefined }));
            }}
            aria-invalid={Boolean(fieldErrors.motivo)}
            aria-describedby={
              fieldErrors.motivo ? "tx-motivo-error" : undefined
            }
            className={fieldClass(fieldErrors.motivo)}
          />
          <FieldError id="tx-motivo-error" message={fieldErrors.motivo} />
        </div>
        {/* TODO: Check group handling */}
        {esGrupal ? (
          <div>
            <label htmlFor="tx-grupo" className={labelClass}>
              Grupo
            </label>
            <Select
              value={selectedGroup ? String(selectedGroup.value) : ""}
              onValueChange={(value) => {
                /*
                  Radix solo maneja strings; el id del grupo vuelve a su tipo
                  original acá para que el POST siga mandando lo mismo que antes.
                */
                const grupo = activeGroups.find(
                  (g) => String(g.id) === value,
                );
                if (grupo)
                  handleGroupSelect({ value: grupo.id, label: grupo.nombre });
              }}
            >
              <SelectTrigger
                id="tx-grupo"
                className={`mt-1.5 ${selectTriggerClass(fieldErrors.grupo)}`}
                aria-invalid={Boolean(fieldErrors.grupo)}
                aria-describedby={
                  fieldErrors.grupo ? "tx-grupo-error" : undefined
                }
              >
                <SelectValue placeholder="Elegí un grupo" />
              </SelectTrigger>
              <SelectContent>
                {activeGroups.length === 0 ? (
                  <p className="px-1.5 py-1 text-sm text-muted-foreground">
                    No tenés grupos activos
                  </p>
                ) : (
                  activeGroups.map((grupo) => (
                    <SelectItem key={grupo.id} value={String(grupo.id)}>
                      {grupo.nombre}
                    </SelectItem>
                  ))
                )}
              </SelectContent>
            </Select>
            <FieldError id="tx-grupo-error" message={fieldErrors.grupo} />
            {gruposError && (
              <p className="mt-1.5 text-xs text-muted-foreground">
                {gruposError}
              </p>
            )}
          </div>
        ) : (
          <div>
            <label htmlFor="tx-categoria" className={labelClass}>
              Categoría
            </label>
            <div className="mt-1.5 flex items-start gap-2">
              <div className="min-w-0 flex-1">
                <Select
                  value={selectedCategory?.value ?? ""}
                  onValueChange={(value) => {
                    const opcion = categoryOptions.find(
                      (o) => o.value === value,
                    );
                    if (opcion) handleCategorySelect(opcion);
                  }}
                >
                  <SelectTrigger
                    id="tx-categoria"
                    className={selectTriggerClass(fieldErrors.categoria)}
                    aria-invalid={Boolean(fieldErrors.categoria)}
                    aria-describedby={
                      fieldErrors.categoria ? "tx-categoria-error" : undefined
                    }
                  >
                    <SelectValue placeholder="Elegí una categoría" />
                  </SelectTrigger>
                  <SelectContent>
                    {categoryOptions.map((opcion) => (
                      <SelectItem key={opcion.value} value={opcion.value}>
                        {opcion.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <button
                type="button"
                onClick={() => {
                  setIsModalCategoriaOpen(true);
                }}
                aria-label="Crear una categoría nueva"
                title="Crear una categoría nueva"
                className="flex size-11 shrink-0 items-center justify-center rounded-lg border border-border text-foreground transition-colors duration-200 hover:bg-secondary focus:outline-none focus:ring-3 focus:ring-ring/50"
              >
                <Plus className="size-4" aria-hidden="true" />
              </button>
            </div>
            <FieldError
              id="tx-categoria-error"
              message={fieldErrors.categoria}
            />
          </div>
        )}

        <div className="rounded-lg border border-border">
          <button
            type="button"
            onClick={() => setShowMore((v) => !v)}
            aria-expanded={showMore}
            aria-controls="tx-mas-opciones"
            className="flex w-full items-center justify-between gap-3 rounded-lg px-3 py-3 text-left transition-colors duration-200 hover:bg-secondary/40 focus:outline-none focus:ring-3 focus:ring-ring/50"
          >
            <span className="min-w-0">
              <span className="block text-sm font-medium text-foreground">
                Más opciones
              </span>
              <span className="block truncate text-xs text-muted-foreground">
                {resumenOpciones}
              </span>
            </span>
            <ChevronDown
              aria-hidden="true"
              className={`size-4 shrink-0 text-muted-foreground transition-transform duration-200 motion-reduce:transition-none ${
                showMore ? "rotate-180" : ""
              }`}
            />
          </button>

          {showMore && (
            <div
              id="tx-mas-opciones"
              className="flex flex-col gap-4 border-t border-border px-3 pb-4 pt-4"
            >
              <div>
                <label htmlFor="tx-fecha" className={labelClass}>
                  Fecha
                </label>
                <input
                  id="tx-fecha"
                  type="date"
                  value={fecha}
                  max={HOY()}
                  onChange={(e) => setFecha(e.target.value)}
                  className={fieldClass(false)}
                />
              </div>

              <div>
                <label htmlFor="tx-medio" className={labelClass}>
                  Medio de pago
                </label>
                <CreatableSelect
                  inputId="tx-medio"
                  options={payMethodOptions}
                  onChange={handlePayChange}
                  onCreateOption={handleCreateTP}
                  value={selectedPayMethod}
                  formatCreateLabel={(input) => `Crear "${input}"`}
                  styles={selectStyles}
                  menuPortalTarget={
                    typeof document !== "undefined" ? document.body : null
                  }
                  className="mt-1.5"
                />
              </div>

              <div className="flex items-center justify-between gap-3">
                <label htmlFor="tx-recurrente" className="min-w-0">
                  <span className="flex items-center gap-2 text-sm font-medium text-foreground">
                    <Repeat
                      className="size-4 text-muted-foreground"
                      aria-hidden="true"
                    />
                    Repetir cada mes
                  </span>
                  <span className="mt-0.5 block text-xs text-muted-foreground">
                    Se registra sola el mismo día de cada mes
                  </span>
                </label>
                <Switch
                  id="tx-recurrente"
                  checked={isRecurrent}
                  onCheckedChange={setIsRecurrent}
                />
              </div>
            </div>
          )}
        </div>

        {/* Distribución automática: solo para ingresos NUEVOS (no en edición) */}
        {isIngresoCategory && canDistributeAutomatically && !edit && (
          <div className="rounded-lg border border-primary/40 bg-primary/5 p-3">
            <div className="flex items-start justify-between gap-3">
              <div className="min-w-0">
                <span className="flex items-center gap-2 text-sm font-medium text-foreground">
                  <Split className="size-4 text-primary" aria-hidden="true" />
                  Repartir entre tus presupuestos
                </span>
                <p className="mt-0.5 text-xs text-muted-foreground">
                  Divide este ingreso en proporción a lo que presupuestaste este
                  mes
                </p>
              </div>
              <button
                type="button"
                onClick={handleDistributeAutomatically}
                className="h-9 shrink-0 rounded-lg bg-primary px-3 text-sm font-semibold text-primary-foreground transition-colors duration-200 hover:bg-accent focus:outline-none focus:ring-3 focus:ring-ring/50"
              >
                Repartir
              </button>
            </div>
          </div>
        )}

        {/* Información para ingresos en edición */}
        {isIngresoCategory && edit && (
          <p className="flex items-start gap-2 text-xs text-muted-foreground">
            <Split className="mt-0.5 size-3.5 shrink-0" aria-hidden="true" />
            Podés repartir este ingreso entre tus presupuestos desde la tabla de
            transacciones, una vez guardados los cambios.
          </p>
        )}

        {notice && (
          <div
            role="status"
            aria-live="polite"
            className={`flex items-start gap-2 rounded-lg border p-3 text-sm ${
              notice.type === "success"
                ? "border-primary/40 bg-primary/5 text-foreground"
                : "border-destructive/40 bg-destructive/10 text-destructive"
            }`}
          >
            {notice.type === "success" ? (
              <CheckCircle2
                className="mt-0.5 size-4 shrink-0 text-primary"
                aria-hidden="true"
              />
            ) : (
              <AlertCircle
                className="mt-0.5 size-4 shrink-0"
                aria-hidden="true"
              />
            )}
            <span>{notice.text}</span>
          </div>
        )}

        {modalError && (
          <div
            role="alert"
            aria-live="assertive"
            className="flex items-start gap-2 rounded-lg border border-destructive/40 bg-destructive/10 p-3 text-sm text-destructive"
          >
            <AlertCircle
              className="mt-0.5 size-4 shrink-0"
              aria-hidden="true"
            />
            <span>{modalError}</span>
          </div>
        )}

        {confirmingClose ? (
          <div className="rounded-lg border border-border bg-background p-3">
            <p className="text-sm text-foreground">
              Cargaste datos sin guardar. ¿Los descartamos?
            </p>
            <div className="mt-3 flex gap-2">
              <button
                type="button"
                onClick={closeWindow}
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
        ) : notice?.type === "success" ? (
          <button
            type="button"
            onClick={closeWindow}
            className="h-11 w-full rounded-lg bg-primary px-4 font-semibold text-primary-foreground transition-colors duration-200 hover:bg-accent focus:outline-none focus:ring-3 focus:ring-ring/50"
          >
            Listo
          </button>
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
                  : "Agregar transacción"}
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

      <CategoryModal
        isOpen={isModalCategoriaOpen}
        onRequestClose={() => {
          setIsModalCategoriaOpen(false);
        }}
        existingNames={nombresDeCategorias}
        onCreatedCategory={onCreatedCategory}
      />

      <AutomaticDistribution
        isVisible={showDistributionModal}
        transaction={{
          valor: Number.parseFloat(valor) || 0,
          fecha: fecha,
          motivo: motivo || "Distribución automática",
        }}
        onDistribute={handleConfirmDistribution}
        onCancel={handleCancelDistribution}
      />
    </Modal>
  );
}
