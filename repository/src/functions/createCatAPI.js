export const createCatAPI = async (nombre, icono) => {
    const token = localStorage.getItem("token");
    if (!nombre || !icono) {
        console.error("Nombre y icono son obligatorios");
        return;
      }
      try {
        const inputValue = {
          nombre: nombre,
          iconPath: icono,
        };
        const response = await fetch(
          "http://localhost:8080/api/personal-categoria",
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${token}`,
            },
            body: JSON.stringify(inputValue),
          }
        );
        if (response.ok) {
          const newCategoria = await response.json();
          const newOption = {
            label: newCategoria.nombre,
            value: newCategoria.nombre,
            iconPath: newCategoria.iconPath,
          };
          return {
            newCat: newOption,
            error: "",
          }
        } else {
          const errorMessage = await response.text();
          console.error("Error al agregar categoria:", errorMessage);
          return {
            newCat: null,
            error: "La categoria ya existe",
          }
        }
      } catch (error) {
        console.error("Error al agregar categoria personalizada:", error);
        return {
            newCat: null,
            error: "",
          }
      }
}