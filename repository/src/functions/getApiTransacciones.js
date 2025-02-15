export const getApiTransacciones = async (filtrado = "Todas", filtroMes, filtroAno) => {
    let transacciones = [];
    let transaccionesSinFiltroCat = [];
    const token = localStorage.getItem("token");
    let url = `http://localhost:8080/api/transacciones/user/filter`;
    if (filtrado !== "Todas" || filtroMes || filtroAno) {
      url += `?categoria=${filtrado}`;
      if (filtroMes) url += `&mes=${filtroMes}`;
      if (filtroAno) url += `&anio=${filtroAno}`;
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
      if (filtrado !== "Todas") {
        transaccionesSinFiltroCat = data.transaccionesSinFiltrarCat;
      }
    } catch (err) {
      console.error("Error fetching transactions:", err);
    }finally{
        return {
            transacciones: transacciones,
            transaccionesSinFiltroCat: transaccionesSinFiltroCat
        }
    }
}