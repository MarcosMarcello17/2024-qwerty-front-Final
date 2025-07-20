export const getApiTransacciones = async (filtrado = "Todas", mes, ano) => {
  const filtroMes = mes === "00" ? "" : mes;
  const filtroAno = ano === "00" ? "" : ano;
  let transacciones = [];
  let transaccionesSinFiltroCat = [];
  const token = localStorage.getItem("token");
  let url = `https://two024-qwerty-back-final-marcello.onrender.com/api/transacciones/user/filter`;

  // Construir parámetros de query solo cuando hay filtros válidos
  const params = [];

  if (filtrado !== "Todas") {
    params.push(`categoria=${filtrado}`);
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

  console.log(url);
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
    if (filtrado !== "Todas") {
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
};
