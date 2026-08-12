import { Search } from "lucide-react";
import { FieldError, labelClass } from "../modal-fields";
import { useEffect, useMemo, useRef, useState } from "react";
import { ICON_GROUPS } from "@/lib/categoryIcons";

export default function IconSelector({onIconChange = () => {}}) {

  // Hooks
  const [filtro, setFiltro] = useState("");
  const [iconKey, setIconKey] = useState("");
  const [fieldErrors, setFieldErrors] = useState({});

  // Functions
  const normalizar = (valor) => valor.trim().toLowerCase();

  const elegirIcono = (key) => {
    setIconKey(key);
    setFieldErrors((prev) => ({ ...prev, icono: undefined }));
  };

  useEffect(() => {
    onIconChange(iconKey)
  }, [iconKey])

  /*
    Si la categoría que se está editando guarda un icono que ya no ofrecemos,
    igual tiene que aparecer seleccionado: si no, el modal muestra "ninguno"
    para algo que sí tiene icono y obliga a elegir de nuevo a ciegas.
  */
  const gruposCompletos = useMemo(() => {
    const conocido = ICON_GROUPS.some((grupo) =>
      grupo.icons.some((icono) => icono.key === iconKey),
    );
    if (!iconKey || conocido) return ICON_GROUPS;
    return [
      {
        label: "Icono actual",
        icons: [
          {
            key: iconKey,
            label: categoryIconLabel(iconKey) ?? "Icono actual",
            Icon: resolveCategoryIcon(iconKey) ?? Tag,
          },
        ],
      },
      ...ICON_GROUPS,
    ];
  }, [iconKey]);

  const gruposVisibles = useMemo(() => {
    const q = normalizar(filtro);
    if (!q) return gruposCompletos;
    return gruposCompletos
      .map((grupo) => ({
        ...grupo,
        icons: grupo.icons.filter((icono) =>
          normalizar(icono.label).includes(q),
        ),
      }))
      .filter((grupo) => grupo.icons.length > 0);
  }, [gruposCompletos, filtro]);

  const iconosVisibles = useMemo(
    () => gruposVisibles.flatMap((grupo) => grupo.icons),
    [gruposVisibles],
  );

  const seleccionado = iconosVisibles.find((icono) => icono.key === iconKey);
  return (
    <div>
      <div className="flex items-end justify-between gap-3">
        <span id="cat-icono-label" className={labelClass}>
          Icono
        </span>
        <div className="relative w-36">
          <Search
            aria-hidden="true"
            className="pointer-events-none absolute left-2.5 top-1/2 size-3.5 -translate-y-1/2 text-muted-foreground"
          />
          <input
            type="text"
            value={filtro}
            onChange={(e) => setFiltro(e.target.value)}
            placeholder="Buscar"
            aria-label="Buscar un icono por nombre"
            className="h-9 w-full rounded-lg border border-border bg-background pl-8 pr-2 text-xs text-foreground transition-colors duration-200 focus:border-ring focus:outline-none focus:ring-3 focus:ring-ring/50"
          />
        </div>
      </div>

      <div
        role="radiogroup"
        aria-labelledby="cat-icono-label"
        aria-describedby={fieldErrors.icono ? "cat-icono-error" : undefined}
        className={`mt-2 max-h-56 overflow-y-auto rounded-lg border p-3 ${
          fieldErrors.icono ? "border-destructive" : "border-border"
        }`}
      >
        {iconosVisibles.length === 0 ? (
          <p className="py-6 text-center text-xs text-muted-foreground">
            Ningún icono coincide con “{filtro}”. Probá con otra palabra.
          </p>
        ) : (
          gruposVisibles.map((grupo, indiceGrupo) => {
            const desplazamiento = gruposVisibles
              .slice(0, indiceGrupo)
              .reduce((total, g) => total + g.icons.length, 0);
            return (
              <div key={grupo.label} className={indiceGrupo > 0 ? "mt-4" : ""}>
                <p className="text-[0.7rem] font-medium uppercase tracking-wide text-muted-foreground">
                  {grupo.label}
                </p>
                <div className="mt-1.5 grid grid-cols-6 gap-1.5">
                  {grupo.icons.map((icono, indiceLocal) => {
                    const indice = desplazamiento + indiceLocal;
                    const activo = icono.key === iconKey;
                    return (
                      <button
                        key={icono.key}
                        type="button"
                        role="radio"
                        aria-checked={activo}
                        aria-label={icono.label}
                        title={icono.label}
                        tabIndex={
                          activo || (!seleccionado && indice === 0) ? 0 : -1
                        }
                        onClick={() => elegirIcono(icono.key)}
                        className={`flex size-11 items-center justify-center rounded-md border transition-colors duration-200 focus:outline-none focus-visible:ring-3 focus-visible:ring-ring/50 ${
                          activo
                            ? "border-primary bg-primary/15 text-primary"
                            : "border-transparent text-muted-foreground hover:bg-secondary/40 hover:text-foreground"
                        }`}
                      >
                        <icono.Icon className="size-5" aria-hidden="true" />
                      </button>
                    );
                  })}
                </div>
              </div>
            );
          })
        )}
      </div>
      <FieldError id="cat-icono-error" message={fieldErrors.icono} />
    </div>
  );
}
