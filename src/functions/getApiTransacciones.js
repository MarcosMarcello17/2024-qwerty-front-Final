import { queryOptions } from "@tanstack/react-query";

const BACK_URL = import.meta.env.VITE_BACK_SERVER_URL;

export function getApiTransacciones(filtros) {
  return queryOptions({
    queryKey: ["getTransacciones", filtros],
    queryFn: () => getTransacciones(filtros),
  });
}

export const getTransacciones = async (
  filtros = { categoria: null, mes: null, ano: null },
) => {
  const { categoria, mes, ano } = filtros;
  try {
    const filtroMes = mes === "00" ? "" : mes;
    const filtroAno = ano === "00" ? "" : ano;
    let transacciones = [];
    let transaccionesSinFiltroCat = [];
    const token = localStorage.getItem("token");
    let url = `${BACK_URL}/api/transacciones/user/filter`;

    // Construir parámetros de query solo cuando hay filtros válidos
    const params = [];

    if (categoria !== "Todas") {
      params.push(`categoria=${categoria}`);
    }

    if (filtroMes) {
      params.push(`mes=${filtroMes}`);
    }

    if (filtroAno) {
      params.push(`anio=${filtroAno}`);
    }

    if (params.length > 0) {
      url += `?${params.join("&")}`;
    }

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
      transacciones = data.transaccionesFiltradas;
      if (categoria !== "Todas") {
        transaccionesSinFiltroCat = data.transaccionesSinFiltrarCat;
      }
    } catch (err) {
      console.error("Error fetching transactions:", err);
    } finally {
      return {
        transacciones: transacciones,
        transaccionesSinFiltroCat: transaccionesSinFiltroCat,
      };
    }
  } catch (err) {
    console.error("Error fetching transactions:", err);
  }
};
