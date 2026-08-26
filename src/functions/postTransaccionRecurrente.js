import { mutationOptions } from "@tanstack/react-query";

const BACK_URL = import.meta.env.VITE_BACK_SERVER_URL;

const agregarTransaccionRecurrente = async (bodyTrans) => {
  try {
    const token = localStorage.getItem("token");
    const body = {
      motivo: bodyTrans.motivo,
      categoria: bodyTrans.categoria,
      tipoGasto: bodyTrans.tipoGasto,
      valor: bodyTrans.valor,
      frecuencia: "mensual",
    };
    const response = await fetch(`${BACK_URL}/api/recurrents`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(body),
    });
    if (!response.ok) {
      throw new Error(
        "La transacción se guardó, pero no pudimos marcarla como recurrente.",
      );
    }
  } catch (err) {
    throw new Error(
      "La transacción se guardó, pero ocurrio un error al marcarla como recurrente: ",
      err,
    );
  }
};

export default function postTransaccionRecurrente({ bodyTrans }) {
  return mutationOptions({
    mutationKey: ["postTransaccionRecurrente", { bodyTrans }],
    mutationFn: async ({ bodyTrans }) => {
      return agregarTransaccionRecurrente(bodyTrans);
    },
  });
}
