import { AlertTriangle, X } from "lucide-react";

export default function ErrorMessage({
  actionError = "",
  onDismiss = () => {},
}) {
  if (actionError) {
    return (
      <div
        role="alert"
        className="flex items-start gap-2 rounded-lg border border-destructive/40 bg-destructive/10 px-3 py-2 text-sm text-destructive"
      >
        <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0" />
        <span className="flex-1">{actionError}</span>
        <button
          type="button"
          onClick={onDismiss}
          aria-label="Descartar aviso"
          className="shrink-0 rounded p-0.5 transition-colors hover:bg-destructive/20"
        >
          <X className="h-4 w-4" />
        </button>
      </div>
    );
  }
}
