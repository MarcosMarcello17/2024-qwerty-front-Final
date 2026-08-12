import { AlertCircle } from "lucide-react";

/*
  Vocabulario compartido de los modales de formulario. Vivía duplicado dentro
  de AddTransactionModal; acá arriba lo usan los dos modales y el próximo que
  aparezca no tiene que inventar otro dialecto.
*/

export const labelClass = "block text-sm font-medium text-foreground";

export const fieldClass = (invalid) =>
  `mt-1.5 block h-11 w-full rounded-lg border bg-background px-3 text-foreground transition-colors duration-200 focus:outline-none focus:ring-3 ${
    invalid
      ? "border-destructive focus:border-destructive focus:ring-destructive/50"
      : "border-border focus:border-ring focus:ring-ring/50"
  }`;

/*
  Componente a nivel de módulo, no definido dentro de un render: si se declara
  adentro, React le cambia la identidad en cada pasada y remonta el nodo.
*/
export function FieldError({ id, message }) {
  if (!message) return null;
  return (
    <p
      id={id}
      className="mt-1.5 flex items-center gap-1.5 text-xs text-destructive"
    >
      <AlertCircle className="size-3.5 shrink-0" aria-hidden="true" />
      {message}
    </p>
  );
}
