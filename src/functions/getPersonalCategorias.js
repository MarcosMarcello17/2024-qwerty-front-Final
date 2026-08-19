import { BACK_URL } from "@/lib/backendUrl";
import { queryOptions } from "@tanstack/react-query";

export function getPersonalCategorias(){ 
    return queryOptions({
    queryKey: ['personalCategorias'],
    queryFn: getCategoriasFromAPI,
});
}
const getCategoriasFromAPI = async () => {
    const token = localStorage.getItem("token");
    const response = await fetch(`${BACK_URL}/api/personal-categoria`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
    });
    if (!response.ok) throw new Error ("Error al obtener las categorias personalizadas");
    if (response.ok) {
        const data = await response.json();
        const customOptions = data.map((cat) => ({
          label: cat.nombre,
          value: cat.nombre,
          iconPath: cat.iconPath,
        }));

        return [
          {
            value: "Otros",
            label: "Otros",
            iconPath: "fa-solid fa-circle-dot",
          },
          {
            value: "Gasto Grupal",
            label: "Gasto Grupal",
            iconPath: "fa-solid fa-people-group",
          },
          ...customOptions,
        ];
      }
}
