export const deleteTransaction = async (id) => {
  const token = localStorage.getItem("token");
  try {
    const response = await fetch(
      `https://two024-qwerty-back-final-marcello.onrender.com/api/transacciones/${id}`,
      {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );

    if (response.ok) {
      return true;
    } else {
      return false;
    }
  } catch (err) {
    return false;
  }
};
