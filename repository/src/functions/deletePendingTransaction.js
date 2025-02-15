export const deletePendingTransaction = async (id) => {
    const token = localStorage.getItem("token");
    try {
      const response = await fetch(
        `http://localhost:8080/api/transaccionesPendientes/${id}`,
        {
          method: "DELETE",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      if (response.ok) {
        return true;
      }
    } catch (err) {
      console.error("Error al eliminar la transaccion: ", err);
    }
    return false;
  };