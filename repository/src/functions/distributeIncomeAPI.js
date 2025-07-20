/**
 * Distribuye automáticamente un ingreso según los presupuestos activos del mes
 * @param {number} amount - Monto a distribuir
 * @param {string} date - Fecha del ingreso (formato YYYY-MM-DD)
 * @param {string} description - Descripción del ingreso
 * @returns {Promise<Object>} Resultado de la distribución
 */
export const distributeIncomeAutomatically = async (amount, date, description = "") => {
  const token = localStorage.getItem("token");
  
  try {
    const response = await fetch(
      "https://two024-qwerty-back-final-marcello.onrender.com/api/automation/distribuir",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          montoIngreso: parseFloat(amount),
          fechaIngreso: date,
          motivoOriginal: description || "Distribución automática",
        }),
      }
    );

    const data = await response.json();
    return data;
  } catch (error) {
    console.error("Error al distribuir ingreso:", error);
    throw new Error("Error de conexión al distribuir el ingreso");
  }
};

/**
 * Verifica si se puede realizar una distribución automática para una fecha específica
 * @param {string} date - Fecha a verificar (formato YYYY-MM-DD)
 * @returns {Promise<boolean>} True si se puede distribuir, false si no
 */
export const canDistributeForDate = async (date) => {
  const token = localStorage.getItem("token");
  
  try {
    const response = await fetch(
      `https://two024-qwerty-back-final-marcello.onrender.com/api/automation/puede-distribuir?fecha=${date}`,
      {
        method: "GET",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );

    if (response.ok) {
      const data = await response.json();
      return data.puedeDistribuir || false;
    }
    return false;
  } catch (error) {
    console.error("Error checking distribution availability:", error);
    return false;
  }
};

/**
 * Obtiene una previsualización de cómo se distribuiría un ingreso
 * @param {number} amount - Monto a distribuir
 * @param {string} date - Fecha del ingreso (formato YYYY-MM-DD)
 * @param {string} description - Descripción del ingreso
 * @returns {Promise<Object>} Preview de la distribución
 */
export const getDistributionPreview = async (amount, date, description = "") => {
  const token = localStorage.getItem("token");
  
  try {
    const response = await fetch(
      "https://two024-qwerty-back-final-marcello.onrender.com/api/automation/previsualizar",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          montoIngreso: parseFloat(amount),
          fechaIngreso: date,
          motivoOriginal: description || "Ingreso de dinero",
        }),
      }
    );

    const data = await response.json();
    return data;
  } catch (error) {
    console.error("Error getting distribution preview:", error);
    throw new Error("Error al obtener previsualización de distribución");
  }
};
