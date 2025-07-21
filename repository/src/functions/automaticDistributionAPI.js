// Función para verificar si se puede distribuir automáticamente
export const checkCanDistributeAutomatically = async (fecha) => {
  const token = localStorage.getItem("token");
  try {
    const response = await fetch(
      `https://two024-qwerty-back-final-marcello.onrender.com/api/automation/puede-distribuir?fecha=${fecha}`,
      {
        method: "GET",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      }
    );

    if (response.ok) {
      const data = await response.json();
      return data.puedeDistribuir;
    }
    return false;
  } catch (error) {
    console.error("Error checking distribution availability:", error);
    return false;
  }
};

// Función para crear transacción con distribución automática
export const createTransactionWithDistribution = async (transactionData) => {
  const token = localStorage.getItem("token");
  try {
    const response = await fetch(
      "https://two024-qwerty-back-final-marcello.onrender.com/api/transacciones/con-distribucion",
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(transactionData),
      }
    );

    const data = await response.json();
    return data;
  } catch (error) {
    console.error("Error creating transaction with distribution:", error);
    throw error;
  }
};

// Función para obtener previsualización de distribución
export const getDistributionPreview = async (
  montoIngreso,
  fechaIngreso,
  motivoOriginal
) => {
  const token = localStorage.getItem("token");
  try {
    const response = await fetch(
      "https://two024-qwerty-back-final-marcello.onrender.com/api/automation/previsualizar",
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          montoIngreso,
          fechaIngreso,
          motivoOriginal,
        }),
      }
    );

    const data = await response.json();
    return data;
  } catch (error) {
    console.error("Error getting distribution preview:", error);
    throw error;
  }
};

// Función para distribuir ingreso automáticamente
export const distributeIncomeAutomatically = async (
  montoIngreso,
  fechaIngreso,
  motivoOriginal
) => {
  const token = localStorage.getItem("token");
  try {
    const response = await fetch(
      "https://two024-qwerty-back-final-marcello.onrender.com/api/automation/distribuir",
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          montoIngreso,
          fechaIngreso,
          motivoOriginal,
        }),
      }
    );

    const data = await response.json();
    return data;
  } catch (error) {
    console.error("Error distributing income:", error);
    throw error;
  }
};
