export const deleteTransaction = async (id) => {
  const token = localStorage.getItem("token");
  try {
    const response = await fetch(`${BACK_URL}/api/transacciones/${id}`, {
      method: "DELETE",
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    if (response.ok) {
      return true;
    } else {
      return false;
    }
  } catch (err) {
    return false;
  }
};
