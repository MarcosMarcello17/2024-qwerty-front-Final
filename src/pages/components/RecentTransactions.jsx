import { Link } from "react-router-dom";
import { formatARS, formatShortDate } from "@/lib/format";

const LIMIT = 8;

export default function RecentTransactions({ transacciones = [] }) {
  const recientes = [...transacciones]
    .sort((a, b) => new Date(b.fecha) - new Date(a.fecha))
    .slice(0, LIMIT);

  if (recientes.length === 0) return null;

  return (
    <section aria-labelledby="ultimos-movimientos">
      <div className="flex items-baseline justify-between border-b border-border pb-2">
        <h2
          id="ultimos-movimientos"
          className="font-headline text-[1.25rem] font-semibold leading-tight"
        >
          Últimos movimientos
        </h2>
        <Link
          to="/transacciones"
          className="text-[0.8rem] font-medium text-muted-foreground underline-offset-4 transition-colors hover:text-foreground hover:underline"
        >
          Ver todas
        </Link>
      </div>

      <ul className="divide-y divide-border">
        {recientes.map((t) => {
          const esIngreso = t.categoria === "Ingreso de Dinero";
          return (
            <li
              key={t.id}
              className="flex items-baseline gap-4 py-2.5 sm:gap-6"
            >
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-medium leading-tight">
                  {t.motivo}
                </p>
                <p className="truncate text-[0.8rem] text-muted-foreground">
                  {t.categoria}
                  {t.tipoGasto ? ` · ${t.tipoGasto}` : ""}
                </p>
              </div>
              <time
                dateTime={t.fecha}
                className="shrink-0 text-[0.8rem] tabular-nums text-muted-foreground"
              >
                {formatShortDate(t.fecha)}
              </time>
              <span className="shrink-0 text-sm font-semibold tabular-nums">
                {esIngreso ? "+" : "−"}
                {formatARS(t.valor)}
              </span>
            </li>
          );
        })}
      </ul>
    </section>
  );
}
