import { forwardRef, useEffect, useState } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { fas } from "@fortawesome/free-solid-svg-icons";
import { library } from "@fortawesome/fontawesome-svg-core";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import { Button } from "@/components/ui/button";
import { Loader2, Save } from "lucide-react";

// Componente personalizado para el input del DatePicker
const CustomInput = forwardRef(({ value, onClick, placeholder }, ref) => (
  <div className="relative">
    <input
      className="mt-1 block w-full p-2 pr-10 bg-background text-white rounded-md shadow-sm border border-gray-600 focus:border-primary focus:ring-1 focus:ring-primary focus:outline-none"
      onClick={onClick}
      value={value}
      placeholder={placeholder}
      readOnly
      ref={ref}
    />
    <FontAwesomeIcon
      icon="fa-solid fa-calendar-days"
      className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 pointer-events-none"
    />
  </div>
));

function ModalCreateBudget({ closeModal = () => {}, initialBudget = null }) {
  library.add(fas);
  const [payCategories, setPayCategories] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [formMessage, setFormMessage] = useState("");
  const [payCategoriesDefault, setPayCategoriesDefault] = useState([
    {
      value: "Impuestos y Servicios",
      label: "Impuestos y Servicios",
      iconPath: "fa-solid fa-file-invoice-dollar",
    },
    {
      value: "Entretenimiento y Ocio",
      label: "Entretenimiento y Ocio",
      iconPath: "fa-solid fa-ticket",
    },
    {
      value: "Hogar y Mercado",
      label: "Hogar y Mercado",
      iconPath: "fa-solid fa-house",
    },
    { value: "Antojos", label: "Antojos", iconPath: "fa-solid fa-candy-cane" },
    {
      value: "Electrodomesticos",
      label: "Electrodomesticos",
      iconPath: "fa-solid fa-blender",
    },
    { value: "Clase", label: "Clase", iconPath: "fa-solid fa-chalkboard-user" },
  ]);
  const [budgetValues, setBudgetValues] = useState({});
  const [totalBudget, setTotalBudget] = useState("");
  const [errors, setErrors] = useState({});
  const [budgetName, setBudgetName] = useState("");
  const [budgetDate, setBudgetDate] = useState(null);

  useEffect(() => {
    const fetchPersonalCategorias = async () => {
      const token = localStorage.getItem("token");
      try {
        const response = await fetch(
          "https://two024-qwerty-back-final-marcello.onrender.com/api/personal-categoria",
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );
        if (response.ok) {
          const data = await response.json();
          const customOptions = data.map((cat) => ({
            label: cat.nombre,
            value: cat.nombre,
            iconPath: cat.iconPath,
          }));
          setPayCategories([...payCategoriesDefault, ...customOptions]);
        }
      } catch (error) {
        console.error("Error al obtener las categorías personalizadas:", error);
      }
    };
    fetchPersonalCategorias();
  }, []);

  useEffect(() => {
    if (initialBudget) {
      setBudgetName(initialBudget.nameBudget || "");
      let date = null;
      if (initialBudget.budgetMonth) {
        if (initialBudget.budgetMonth instanceof Date) {
          date = initialBudget.budgetMonth;
        } else if (typeof initialBudget.budgetMonth === "string") {
          // Soporta formatos como "2024-06" o "2025-08-01T03:00:00.000Z"
          const tempDate = new Date(initialBudget.budgetMonth);
          date = isNaN(tempDate.getTime()) ? null : tempDate;
        } else {
          date = null;
        }
      }
      setBudgetDate(date);
      setTotalBudget(initialBudget.totalBudget || "");
      setBudgetValues(initialBudget.categoryBudgets || {});
    }
  }, [initialBudget]);

  const handleInputChange = (value, category) => {
    const numericValue = parseFloat(value);
    setBudgetValues((prevValues) => ({
      ...prevValues,
      [category]: numericValue,
    }));
    setErrors((prevErrors) => ({
      ...prevErrors,
      [category]: numericValue < 0 ? "El valor no puede ser negativo" : "",
    }));
  };

  const addCategory = (category) => {
    if (!budgetValues[category.value] && category) {
      setBudgetValues((prevValues) => ({
        ...prevValues,
        [category.value]: 0,
      }));
    }
  };

  const handleSubmit = (event) => {
    event.preventDefault();
    if (!budgetName) {
      alert("El nombre del presupuesto es obligatorio.");
      return;
    }
    if (!budgetDate) {
      alert("La fecha (mes y año) es obligatoria.");
      return;
    }
    const totalCategoryBudget = Object.values(budgetValues).reduce(
      (acc, curr) => acc + (curr || 0),
      0
    );
    if (totalCategoryBudget >= totalBudget) {
      setErrors((prevErrors) => ({
        ...prevErrors,
        totalBudget:
          "La suma de los presupuestos no debe igualar o exceder el presupuesto total",
      }));
      return;
    } else {
      setErrors((prevErrors) => ({ ...prevErrors, totalBudget: "" }));
    }
    const hasNegativeValues = Object.values(budgetValues).some(
      (value) => value < 0
    );
    if (hasNegativeValues) {
      alert("Algunos valores de categorías son negativos. Revise los campos.");
      return;
    }
    const filteredBudgetValues = Object.fromEntries(
      Object.entries(budgetValues).filter(([_, value]) => value > 0)
    );
    const formData = initialBudget
      ? {
          ...initialBudget,
          nameBudget: budgetName,
          totalBudget: totalBudget,
          budgetMonth: budgetDate,
          categoryBudgets: filteredBudgetValues,
        }
      : {
          nameBudget: budgetName,
          totalBudget: totalBudget,
          budgetMonth: budgetDate,
          categoryBudgets: filteredBudgetValues,
        };
    createOrUpdateBudget(formData);
  };

  const createOrUpdateBudget = async (budget) => {
    const token = localStorage.getItem("token");
    setIsLoading(true);
    const url = initialBudget
      ? "https://two024-qwerty-back-final-marcello.onrender.com/api/presupuesto/editPresupuesto"
      : "https://two024-qwerty-back-final-marcello.onrender.com/api/presupuesto";
    const method = initialBudget ? "PUT" : "POST";
    try {
      const response = await fetch(url, {
        method: method,
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(budget),
      });
      if (response.ok) {
        setFormMessage(
          initialBudget ? "Presupuesto actualizado!" : "Presupuesto creado!"
        );
        closeModal();
      } else {
        const errorMessage = await response.text();
        console.error(
          "Error en la respuesta del servidor",
          response.status,
          errorMessage
        );
      }
    } catch (error) {
      console.error(
        initialBudget
          ? "Error al actualizar el presupuesto:"
          : "Error al crear el presupuesto:",
        error
      );
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="modal-box w-full max-w-lg p-6 bg-card rounded-lg shadow-lg mx-4 md:mx-auto lg:w-1/2">
      <h3 className="text-xl font-bold mb-4 text-white">
        {initialBudget ? "Editar Presupuesto" : "Agregar Nuevo Presupuesto"}
      </h3>
      <form onSubmit={handleSubmit} className="space-y-8">
        <div>
          <label className="block text-white mb-2">
            Nombre del Presupuesto
          </label>
          <input
            type="text"
            placeholder="Nombre del Presupuesto"
            className="mt-1 block w-full p-2 bg-background text-white rounded-md shadow-sm border border-gray-600 focus:border-primary focus:ring-1 focus:ring-primary focus:outline-none"
            value={budgetName}
            onChange={(e) => setBudgetName(e.target.value)}
            required
          />
        </div>

        <div className="w-full">
          <label className="block text-white mb-2">Fecha (Mes y Año)</label>
          <DatePicker
            selected={budgetDate}
            onChange={(date) => setBudgetDate(date)}
            dateFormat="yyyy-MM"
            showMonthYearPicker
            customInput={<CustomInput placeholder="Selecciona mes y año" />}
            required
            className="react-datepicker-wrapper"
            wrapperClassName="w-full"
          />
        </div>

        <div>
          <label className="block text-white mb-2">
            <FontAwesomeIcon
              className="mr-2"
              color="#FFFFFF"
              icon="fa-solid fa-wallet"
            />
            Presupuesto Total
          </label>
          <input
            type="number"
            placeholder="Monto Total"
            className="mt-1 block w-full p-2 bg-background text-white rounded-md shadow-sm border border-gray-600 focus:border-primary focus:ring-1 focus:ring-primary focus:outline-none"
            value={totalBudget}
            onChange={(e) => setTotalBudget(parseFloat(e.target.value))}
            required
          />
          {errors.totalBudget && (
            <p className="text-red-500 text-sm">{errors.totalBudget}</p>
          )}
        </div>

        <div>
          <label className="block text-white mb-2">Agregar Presupuesto</label>
          <div className="relative">
            <select
              className="mt-1 block w-full p-2 pr-10 bg-background text-white rounded-md shadow-sm border border-gray-600 focus:border-primary focus:ring-1 focus:ring-primary focus:outline-none appearance-none cursor-pointer"
              onChange={(e) => {
                const selectedCategory = payCategories.find(
                  (cat) => cat.value === e.target.value
                );
                if (selectedCategory) addCategory(selectedCategory);
                e.target.value = "";
              }}
            >
              <option value="">Seleccionar categoría</option>
              {payCategories.map((category) => (
                <option key={category.value} value={category.value}>
                  {category.label}
                </option>
              ))}
            </select>
            <FontAwesomeIcon
              icon="fa-solid fa-chevron-down"
              className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 pointer-events-none"
            />
          </div>
        </div>

        {Object.keys(budgetValues).map((category, index) => {
          const iconPath =
            payCategories.find((cat) => cat.value === category)?.iconPath ||
            "fa-solid fa-question";
          return (
            <div key={category}>
              <label className="block text-white mb-2">
                <FontAwesomeIcon
                  className="mr-2"
                  color="#FFFFFF"
                  icon={iconPath}
                />
                {category}
              </label>
              <input
                type="number"
                id={`amount-${index}`}
                placeholder={`Monto para ${category}`}
                className="mt-1 block w-full p-2 bg-background text-white rounded-md shadow-sm border border-gray-600 focus:border-primary focus:ring-1 focus:ring-primary focus:outline-none"
                value={budgetValues[category] || ""}
                onChange={(e) => handleInputChange(e.target.value, category)}
              />
              {errors[category] && (
                <p className="text-red-500 text-sm">{errors[category]}</p>
              )}
            </div>
          );
        })}

        <div className="flex gap-4">
          <Button
            type="submit"
            className="w-full bg-primary hover:bg-primary/90 text-primary-foreground"
          >
            {isLoading ? (
              <div>
                <Loader2 />
                Cargando...
              </div>
            ) : (
              <>
                <Save className="mr-2 h-4 w-4" /> Guardar{" "}
              </>
            )}
          </Button>
          <Button
            type="button"
            className="w-full bg-red-600 hover:bg-red-700 text-white"
            onClick={() => closeModal()}
          >
            Cerrar
          </Button>
        </div>
      </form>
    </div>
  );
}

export default ModalCreateBudget;
