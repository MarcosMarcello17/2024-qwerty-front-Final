import { ChevronDown, Plus, Repeat } from "lucide-react";
import { useState } from "react";
import { fieldClass, labelClass, selectTriggerClass } from "../modal-fields";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import getPersonalTipoGastos from "@/functions/getPersonalTipoGastos";
import { Switch } from "@/components/ui/switch";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import ModalMedioDePago from "@/components/modals/ModalMedioDePago";
import postNuevoMedioDePago from "@/functions/postNuevoMedioDePago";

const METODO_POR_DEFECTO = { value: "Efectivo", label: "Efectivo" };

export default function NewTransactionOptions({
  fecha = new Date(),
  switchRecurrent = () => {},
  isRecurrent = false,
  setFecha = () => {},
  setTipoGasto = () => {},
}) {
  const queryClient = useQueryClient();
  const { data: payOptions = [] } = useQuery(getPersonalTipoGastos());
  const [selectedPayMethod, setSelectedPayMethod] =
    useState(METODO_POR_DEFECTO);
  const [openModalMedioPago, setOpenModalMedioPago] = useState(false);
  const HOY = () => new Date().toISOString().split("T")[0];
  const [showMore, setShowMore] = useState(false);
  const resumenOpciones = [
    fecha === HOY() ? "Hoy" : fecha.split("-").reverse().join("/"),
    selectedPayMethod?.label ?? "Sin medio de pago",
    isRecurrent ? "Se repite cada mes" : null,
  ]
    .filter(Boolean)
    .join(" · ");

  const postMedioDePago = useMutation(postNuevoMedioDePago({ nombre: "" }));

  const handlePayChange = (value) => {
    setTipoGasto(value ? value.value : "");
    setSelectedPayMethod(value);
  };

  const handleCreateTP = async (nombre) => {
    postMedioDePago.mutate(
      { nombre },
      {
        onSuccess: (newOption) => {
          setSelectedPayMethod(newOption);
          setTipoGasto(newOption.value);
          queryClient.invalidateQueries({
            queryKey: ["getPersonalTipoGastos"],
          });
        },
        onError: (error) => {
          setModalError(
            `No pudimos crear el medio de pago "${nombre}". Volvé a intentar.`,
          );
          console.error(error);
          return error;
        },
      },
    );
  };

  return (
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
            <div className="mt-1.5 flex items-start gap-2">
              <div className="min-w-0 flex-1">
                <Select
                  value={selectedPayMethod.value}
                  onValueChange={(value) => handlePayChange(value)}
                >
                  <SelectTrigger
                    id="tx-categoria"
                    className={selectTriggerClass(false)}
                    aria-invalid={Boolean(false)}
                    aria-describedby={undefined}
                  >
                    <SelectValue placeholder="Elegí un medio de pago" />
                  </SelectTrigger>
                  <SelectContent>
                    {payOptions.map((opcion) => (
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
                  setOpenModalMedioPago(true);
                }}
                aria-label="Crear una categoría nueva"
                title="Crear una categoría nueva"
                className="flex size-11 shrink-0 items-center justify-center rounded-lg border border-border text-foreground transition-colors duration-200 hover:bg-secondary focus:outline-none focus:ring-3 focus:ring-ring/50"
              >
                <Plus className="size-4" aria-hidden="true" />
              </button>
            </div>
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
              onCheckedChange={switchRecurrent}
            />
          </div>
        </div>
      )}
      <ModalMedioDePago
        isOpen={openModalMedioPago}
        onRequestClose={() => {
          setOpenModalMedioPago(false);
        }}
        handleCreateTP={handleCreateTP}
      />
    </div>
  );
}
