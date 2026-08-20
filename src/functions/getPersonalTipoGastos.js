import { BACK_URL } from "@/lib/backendUrl";
import { queryOptions } from "@tanstack/react-query";

const fetchPersonalTipoGastos = async () => {
  const token = localStorage.getItem("token");
  try {
    const response = await fetch(`${BACK_URL}/api/personal-tipo-gasto`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    if (response.ok) {
      const data = await response.json();
      const customOptions = data.map((tipo) => ({
        label: tipo.nombre,
        value: tipo.nombre,
      }));
      return customOptions;
    } else {
      throw new Error("Error al obtener los tipos de gasto personalizados.");
    }
  } catch (error) {
    console.error("Error al obtener los tipos de gasto personalizados:", error);
  }
};

export default function getPersonalTipoGastos() {
  return queryOptions({
    queryKey: ["getPersonalTipoGastos"],
    queryFn: fetchPersonalTipoGastos,
  });
}
