import React from "react";
import { X } from "lucide-react";

export function AuthenticationExpiredNotification({ onClose }) {
  return (
    <div className="fixed inset-0 flex items-center justify-center z-50 bg-black bg-opacity-50">
      <div className="bg-card border border-border p-6 rounded-lg shadow-lg max-w-md w-full">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-xl font-semibold text-white">Sesión Expirada</h3>
          <button onClick={onClose} className="text-gray-400 hover:text-white">
            <X size={24} />
          </button>
        </div>
        <p className="text-muted-foreground mb-4">
          Tu sesión ha expirado. Por favor, inicia sesión nuevamente para
          continuar.
        </p>
        <div className="flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-primary text-primary-foreground rounded hover:bg-primary/90"
          >
            Aceptar
          </button>
        </div>
      </div>
    </div>
  );
}
