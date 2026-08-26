import { mutationOptions } from "@tanstack/react-query";

const BACK_URL = import.meta.env.VITE_BACK_SERVER_URL;

const createPaymentMethodAPI = async (inputValue) => {
  const token = localStorage.getItem("token");
  try {
    const response = await fetch(`${BACK_URL}/api/personal-tipo-gasto`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(inputValue),
    });

    if (response.ok) {
      const newTipoGasto = await response.json();
      return {
        label: newTipoGasto.nombre,
        value: newTipoGasto.nombre,
      };
    } else {
      throw new Error("Error al agregar el tipo de gasto personalizado");
    }
  } catch (error) {
    console.error("Error al agregar el tipo de gasto personalizado:", error);
    throw new Error("Error al agregar el tipo de gasto personalizado:", error);
  }
};

export default function postNuevoMedioDePago({ nombre }) {
  return mutationOptions({
    mutationKey: ["postNuevoMedioDePago", { nombre }],
    mutationFn: async ({ nombre }) => {
      return createPaymentMethodAPI(nombre);
    },
  });
}
