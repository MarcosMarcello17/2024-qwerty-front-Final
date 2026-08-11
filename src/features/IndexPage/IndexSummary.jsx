import { formatARS } from "@/lib/format";

export default function IndexSummary({
  periodLabel = "",
  summary = {
    totalSpent: "",
    count: 0,
    topCategory: null,
    topCategoryTotal: "",
  },
}) {
  return (
    <div className="flex flex-wrap gap-x-10 gap-y-3 border-b border-border pb-4">
      <div>
        <span className="text-[0.8rem] font-medium uppercase tracking-wider text-muted-foreground">
          Total gastado · {periodLabel}
        </span>
        <p className="text-2xl font-semibold leading-tight tabular-nums">
          {formatARS(summary.totalSpent)}
        </p>
      </div>
      <div>
        <span className="text-[0.8rem] font-medium uppercase tracking-wider text-muted-foreground">
          Gastos registrados
        </span>
        <p className="text-2xl font-semibold leading-tight tabular-nums">
          {summary.count}
        </p>
      </div>
      {summary.topCategory && (
        <div>
          <span className="text-[0.8rem] font-medium uppercase tracking-wider text-muted-foreground">
            Categoría principal
          </span>
          <p className="text-2xl font-semibold leading-tight">
            {summary.topCategory}{" "}
            <span className="text-base font-medium tabular-nums text-muted-foreground">
              {formatARS(summary.topCategoryTotal)}
            </span>
          </p>
        </div>
      )}
    </div>
  );
}
