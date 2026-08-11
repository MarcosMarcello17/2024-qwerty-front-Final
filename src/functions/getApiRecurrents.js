import { BACK_URL } from "@/lib/backendUrl";

export const getApiRecurrents = async () => {
  const token = localStorage.getItem("token");
  let url = `${BACK_URL}/api/recurrents`;
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
