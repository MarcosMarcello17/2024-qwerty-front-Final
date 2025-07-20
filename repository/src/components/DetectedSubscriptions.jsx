import React, { useState, useEffect } from "react";
import { BadgeCheck, PlusCircle, X } from "lucide-react";
import { Button } from "./ui/button";
import { getApiRecurrents } from "../functions/getApiRecurrents";

// Puedes ajustar estas opciones según tu app
const categoriasDefault = [
  { value: "Impuestos y Servicios", label: "Impuestos y Servicios" },
  { value: "Entretenimiento y Ocio", label: "Entretenimiento y Ocio" },
  { value: "Hogar y Mercado", label: "Hogar y Mercado" },
  { value: "Antojos", label: "Antojos" },
  { value: "Electrodomesticos", label: "Electrodomesticos" },
  { value: "Clase", label: "Clase" },
  { value: "Ingreso de Dinero", label: "Ingreso de Dinero" },
];
const mediosPagoDefault = [
  { value: "Tarjeta de credito", label: "Tarjeta de credito" },
  { value: "Tarjeta de Debito", label: "Tarjeta de debito" },
  { value: "Efectivo", label: "Efectivo" },
];

export default function DetectedSubscriptions({ subs }) {
  const [showModal, setShowModal] = useState(false);
  const [selectedSub, setSelectedSub] = useState(null);
  const [categoria, setCategoria] = useState("");
  const [medioPago, setMedioPago] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [recurrents, setRecurrents] = useState([]);
  const [loadingRecurrents, setLoadingRecurrents] = useState(true);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [recurrentToDelete, setRecurrentToDelete] = useState(null);

  useEffect(() => {
    const fetchRecurrents = async () => {
      setLoadingRecurrents(true);
      const data = await getApiRecurrents();
      setRecurrents(data);
      setLoadingRecurrents(false);
    };
    fetchRecurrents();
  }, []);

  if (!subs || subs.length === 0) return null;

  const onAdd = (sub) => {
    setSelectedSub(sub);
    setCategoria("");
    setMedioPago("");
    setError("");
    setSuccess("");
    setShowModal(true);
  };

  const handleClose = () => {
    setShowModal(false);
    setSelectedSub(null);
    setCategoria("");
    setMedioPago("");
    setError("");
    setSuccess("");
  };

  const handleCreate = async () => {
    setError("");
    setSuccess("");
    if (!categoria || !medioPago) {
      setError("Completa todos los campos.");
      return;
    }
    setLoading(true);
    try {
      const token = localStorage.getItem("token");
      const transacciones = selectedSub.transacciones;
      const transaccionMasReciente = transacciones.reduce((a, b) =>
        new Date(a.fecha) > new Date(b.fecha) ? a : b
      );
      const body = {
        motivo: selectedSub.descripcion,
        categoria: categoria,
        tipoGasto: medioPago,
        valor: transaccionMasReciente.valor,
        frecuencia: "mensual",
      };
      const response = await fetch(
        "https://two024-qwerty-back-final-marcello.onrender.com/api/recurrents",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify(body),
        }
      );
      if (response.ok) {
        setSuccess("Transacción recurrente creada con éxito.");
        handleClose();
        // Refrescar recurrents
        const data = await getApiRecurrents();
        setRecurrents(data);
      } else {
        setError("Error al crear la transacción recurrente.");
      }
    } catch (err) {
      setError("Error de red.");
    } finally {
      setLoading(false);
    }
  };

  // Eliminar transacción recurrente
  const handleDeleteRecurrent = async () => {
    if (!recurrentToDelete) return;
    setError("");
    setSuccess("");
    setLoading(true);
    try {
      const token = localStorage.getItem("token");
      const response = await fetch(
        `https://two024-qwerty-back-final-marcello.onrender.com/api/recurrents/${recurrentToDelete.id}`,
        {
          method: "DELETE",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        }
      );
      if (response.ok) {
        setSuccess("Transacción recurrente eliminada con éxito.");
        setShowDeleteModal(false);
        setRecurrentToDelete(null);
        // Refrescar recurrents
        const data = await getApiRecurrents();
        setRecurrents(data);
      } else {
        setError("Error al eliminar la transacción recurrente.");
      }
    } catch (err) {
      setError("Error de red al eliminar.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-card p-4 rounded-lg shadow-lg mb-6">
      {/* Suscripciones detectadas */}
      <h2 className="text-xl font-bold mb-2 flex items-center gap-2">
        <BadgeCheck className="text-primary" /> Suscripciones detectadas
      </h2>
      <ul className="space-y-2">
        {subs.map((sub, idx) => {
          const isRecurrent =
            recurrents &&
            recurrents.some(
              (r) =>
                r.motivo &&
                r.motivo.trim().toLowerCase() ===
                  sub.descripcion.trim().toLowerCase()
            );
          const subRecurrente = isRecurrent
            ? recurrents.find(
                (r) =>
                  r.motivo.trim().toLowerCase() ===
                  sub.descripcion.trim().toLowerCase()
              )
            : null;
          return (
            <li
              key={"sub-" + idx}
              className="flex flex-col md:flex-row md:items-center md:gap-4 bg-muted p-2 rounded"
            >
              <span className="font-semibold text-primary">
                {sub.descripcion}
              </span>
              <span className="text-xs text-muted-foreground">
                Recurrente en: {sub.meses.join(", ")}
              </span>
              <span className="text-xs text-muted-foreground">
                Total transacciones: {sub.transacciones.length}
              </span>
              <div className="flex-1 flex justify-end">
                {isRecurrent ? (
                  <Button
                    className="flex items-center text-white text-xs bg-red-600 hover:bg-red-700"
                    onClick={() => {
                      setRecurrentToDelete(subRecurrente);
                      setShowDeleteModal(true);
                    }}
                    title="Eliminar transacción recurrente"
                    style={{ marginTop: 4 }}
                    disabled={loading}
                  >
                    <X />
                    Eliminar
                  </Button>
                ) : (
                  <Button
                    className="flex items-center text-black text-xs"
                    onClick={() => onAdd(sub)}
                    title="Agregar como recurrente"
                    style={{ marginTop: 4 }}
                  >
                    <PlusCircle className="w-4 h-4 mr-1" /> Agregar
                  </Button>
                )}
              </div>
            </li>
          );
        })}
      </ul>
      <div className="text-xs text-muted-foreground mt-2">
        * Se detectan pagos recurrentes por nombre del motivo en los últimos 3
        meses.
      </div>

      {/* Transacciones recurrentes */}
      <h2 className="text-xl font-bold mb-2 flex items-center gap-2 mt-6">
        <BadgeCheck className="text-primary" /> Transacciones recurrentes
      </h2>
      {loadingRecurrents ? (
        <div className="text-sm text-muted-foreground">
          Cargando transacciones recurrentes...
        </div>
      ) : recurrents && recurrents.length > 0 ? (
        <ul className="space-y-2">
          {recurrents.map((rec, idx) => (
            <li
              key={"rec-" + idx}
              className="flex flex-col md:flex-row md:items-center md:gap-4 bg-muted p-2 rounded"
            >
              <span className="font-semibold text-primary">{rec.motivo}</span>
              <span className="text-xs text-muted-foreground">
                Categoría: {rec.categoria || "-"}
              </span>
              <span className="text-xs text-muted-foreground">
                Medio de pago: {rec.tipoGasto || "-"}
              </span>
              <span className="text-xs text-muted-foreground">
                Valor: {rec.valor}
              </span>
              <div className="flex-1 flex justify-end">
                <Button
                  className="flex items-center text-white text-xs bg-red-600 hover:bg-red-700"
                  onClick={() => {
                    setRecurrentToDelete(rec);
                    setShowDeleteModal(true);
                  }}
                  title="Eliminar transacción recurrente"
                  style={{ marginTop: 4 }}
                  disabled={loading}
                >
                  <X />
                  Eliminar
                </Button>
              </div>
            </li>
          ))}
        </ul>
      ) : (
        <div className="text-sm text-muted-foreground">
          No hay transacciones recurrentes registradas.
        </div>
      )}

      {/* Modal para crear transacción recurrente */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
          <div className="bg-card rounded-lg p-6 w-full max-w-md shadow-xl relative">
            <h3 className="text-lg font-bold mb-2 text-white">
              Crear transacción recurrente
            </h3>
            <p className="text-sm text-muted-foreground mb-2">
              Seleccione categoria y medio de pago para la transaccion
              recurrente "{selectedSub.descripcion}"
            </p>
            <div className="mb-3">
              <label className="block text-sm font-medium">Categoría</label>
              <select
                className="w-full p-2 border rounded bg-background"
                value={categoria}
                onChange={(e) => setCategoria(e.target.value)}
              >
                <option value="">Selecciona una categoría</option>
                {categoriasDefault.map((opt) => (
                  <option key={opt.value} value={opt.value}>
                    {opt.label}
                  </option>
                ))}
              </select>
            </div>
            <div className="mb-3">
              <label className="block text-sm font-medium">Medio de pago</label>
              <select
                className="w-full p-2 border rounded bg-background"
                value={medioPago}
                onChange={(e) => setMedioPago(e.target.value)}
              >
                <option value="">Selecciona un medio de pago</option>
                {mediosPagoDefault.map((opt) => (
                  <option key={opt.value} value={opt.value}>
                    {opt.label}
                  </option>
                ))}
              </select>
            </div>
            {error && <div className="text-red-500 text-sm mb-2">{error}</div>}
            {success && (
              <div className="text-green-600 text-sm mb-2">{success}</div>
            )}
            <div className="flex justify-end gap-2 mt-4">
              <Button
                onClick={handleClose}
                className="bg-background text-white"
                disabled={loading}
              >
                Cancelar
              </Button>
              <Button
                onClick={handleCreate}
                className="bg-primary text-black"
                disabled={loading}
              >
                {loading ? "Creando..." : "Crear transacción recurrente"}
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Modal de confirmación para eliminar transacción recurrente */}
      {showDeleteModal && recurrentToDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
          <div className="bg-card rounded-lg p-6 w-full max-w-md shadow-xl relative">
            <h3 className="text-lg font-bold mb-2 text-white">
              Confirmar eliminación
            </h3>
            <p className="text-sm text-muted-foreground mb-4">
              ¿Estás seguro que deseas eliminar la transacción recurrente "
              {recurrentToDelete.motivo}"?
            </p>
            <div className="flex justify-end gap-2 mt-4">
              <Button
                onClick={() => {
                  setShowDeleteModal(false);
                  setRecurrentToDelete(null);
                }}
                className="bg-background text-white"
                disabled={loading}
              >
                Cancelar
              </Button>
              <Button
                onClick={handleDeleteRecurrent}
                className="bg-red-600 text-white hover:bg-red-700"
                disabled={loading}
              >
                {loading ? "Eliminando..." : "Eliminar"}
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
