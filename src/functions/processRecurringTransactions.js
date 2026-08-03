export const processRecurringTransactions = async () => {
  const token = localStorage.getItem("token");
  try {
    const response = await fetch(
      "https://two024-qwerty-back-final-marcello.onrender.com/api/recurrents/process",
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      }
    );

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
