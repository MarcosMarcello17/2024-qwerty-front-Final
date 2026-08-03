export const getApiRecurrents = async () => {
  const token = localStorage.getItem("token");
  let url = `https://two024-qwerty-back-final-marcello.onrender.com/api/recurrents`;
  try {
    const response = await fetch(url, {
      method: "GET",
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    if (!response.ok) {
      throw new Error(`Error: ${response.status}`);
    }
    const data = await response.json();
    return data;
  } catch (err) {
    console.error("Error fetching recurrents:", err);
    return [];
  }
};
