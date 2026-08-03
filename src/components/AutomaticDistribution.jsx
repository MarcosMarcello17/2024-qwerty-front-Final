import React, { useState, useEffect } from "react";

function AutomaticDistribution({
  isVisible,
  transaction,
  onDistribute,
  onCancel,
}) {
  const [distributionPreview, setDistributionPreview] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (isVisible && transaction && transaction.valor && transaction.fecha) {
      fetchDistributionPreview();
    }
  }, [isVisible, transaction]);

  const fetchDistributionPreview = async () => {
    setLoading(true);
    setError("");

    try {
      const token = localStorage.getItem("token");
      const response = await fetch(
        "https://two024-qwerty-back-final-marcello.onrender.com/api/automation/previsualizar",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            montoIngreso: parseFloat(transaction.valor),
            fechaIngreso: transaction.fecha,
            motivoOriginal: transaction.motivo || "Ingreso de dinero",
          }),
        }
      );

      const data = await response.json();

      if (data.success) {
        setDistributionPreview(data.preview);
      } else {
        setError(data.error || "Error al generar previsualización");
      }
    } catch (error) {
      setError("Error de conexión al generar previsualización");
      console.error("Error fetching distribution preview:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleDistribute = () => {
    onDistribute(true);
  };

  const handleCancel = () => {
    onCancel();
  };

  if (!isVisible) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-[#000814] border border-[#ffd60a] rounded-lg max-w-2xl w-full mx-4 max-h-[80vh] overflow-y-auto">
        <div className="p-6">
          <h3 className="text-xl font-bold text-[#ffd60a] mb-4">
            Distribución Automática
          </h3>

          <div className="mb-4">
            <p className="text-gray-300 mb-2">
              Monto a distribuir:{" "}
              <span className="text-[#ffd60a] font-bold">
                ${transaction?.valor}
              </span>
            </p>
            <p className="text-gray-300 mb-4">
              Se distribuirá este ingreso proporcionalmente según los
              presupuestos activos del mes.
            </p>
          </div>

          {loading && (
            <div className="text-center py-8">
              <div className="loading loading-spinner loading-lg text-[#ffd60a]"></div>
              <p className="text-gray-300 mt-2">Calculando distribución...</p>
            </div>
          )}

          {error && (
            <div className="bg-red-900/30 border border-red-500 rounded-lg p-4 mb-4">
              <p className="text-red-300 text-center">{error}</p>
            </div>
          )}

          {distributionPreview && !loading && (
            <div className="space-y-4">
              <h4 className="text-lg font-semibold text-gray-200 mb-3">
                Vista previa de la distribución:
              </h4>

              {distributionPreview.presupuestos.map((presupuesto, index) => (
                <div
                  key={index}
                  className="bg-[#001d3d] rounded-lg p-4 border border-gray-600"
                >
                  <h5 className="text-[#ffd60a] font-semibold mb-3">
                    {presupuesto.nombrePresupuesto}
                  </h5>

                  <div className="space-y-2">
                    {presupuesto.categorias.map((categoria, catIndex) => (
                      <div
                        key={catIndex}
                        className="flex justify-between items-center py-2 px-3 bg-[#000814] rounded"
                      >
                        <div className="flex items-center space-x-3">
                          <span className="text-gray-300">
                            {categoria.categoria}
                          </span>
                          <span className="text-gray-500 text-sm">
                            ({categoria.porcentaje.toFixed(1)}% del presupuesto)
                          </span>
                        </div>
                        <div className="text-right">
                          <div className="text-[#ffd60a] font-bold">
                            ${categoria.monto.toFixed(2)}
                          </div>
                          <div className="text-gray-500 text-xs">
                            Presupuesto: ${categoria.presupuestoCategoria}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ))}

              <div className="bg-[#ffd60a]/10 border border-[#ffd60a] rounded-lg p-4 mt-4">
                <p className="text-gray-300 text-center">
                  Se crearán automáticamente transacciones para cada categoría
                  según la distribución mostrada.
                </p>
              </div>
            </div>
          )}

          <div className="flex justify-end space-x-3 mt-6">
            <button
              type="button"
              onClick={handleCancel}
              className="px-4 py-2 bg-gray-600 text-white rounded hover:bg-gray-700 transition-colors"
            >
              Cancelar
            </button>
            <button
              type="button"
              onClick={handleDistribute}
              disabled={loading || error || !distributionPreview}
              className={`px-6 py-2 rounded transition-colors ${
                loading || error || !distributionPreview
                  ? "bg-gray-600 text-gray-400 cursor-not-allowed"
                  : "bg-[#ffd60a] text-black hover:bg-[#ffc300] font-bold"
              }`}
            >
              Confirmar Distribución
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default AutomaticDistribution;
