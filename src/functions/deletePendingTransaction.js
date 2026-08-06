const BACK_URL = import.meta.env.VITE_BACK_SERVER_URL;

export const deletePendingTransaction = async (id) => {
  const token = localStorage.getItem("token");
  try {
    const response = await fetch(
      `${BACK_URL}/api/transaccionesPendientes/${id}`,
      {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      },
    );
    if (response.ok) {
      return true;
    }
  } catch (err) {
    console.error("Error al eliminar la transaccion: ", err);
  }
  return false;
};
