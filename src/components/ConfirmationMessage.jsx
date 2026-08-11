import { Check } from "lucide-react";

export default function ConfirmationMessage({ statusMessage = null }) {
  if (statusMessage) {
    return (
      <div
        role="status"
        className="flex items-center gap-2 rounded-lg border border-border bg-secondary/40 px-3 py-2 text-sm"
      >
        <Check className="h-4 w-4 shrink-0 text-primary" />
        {statusMessage}
      </div>
    );
  }
}
