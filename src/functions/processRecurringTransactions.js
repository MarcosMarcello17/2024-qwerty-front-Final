const BACK_URL = import.meta.env.VITE_BACK_SERVER_URL;

export const processRecurringTransactions = async () => {
  const token = localStorage.getItem("token");
  try {
    const response = await fetch(`${BACK_URL}/api/recurrents/process`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
    });

    if (!response.ok) {
      throw new Error(`Error: ${response.status}`);
    }

    const data = await response.json();
    return data; // Retorna las transacciones creadas
  } catch (err) {
    console.error("Error processing recurring transactions:", err);
    return [];
  }
};
