import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { PlusCircle, Edit3, Trash2, LayoutList } from "lucide-react";
import { useEffect, useState } from "react";
import ModalCategoria from "./components/ModalCategoria";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import AppLayout from "./AppLayout";
import ConfirmDeleteCategory from "./components/ConfirmDeleteCategory";

const defaultCategories = [
  {
    value: "Impuestos y Servicios",
    label: "Impuestos y Servicios",
    iconPath: "fa-solid fa-file-invoice-dollar",
    textColor: "mr-2 text-[#ffd60a]",
  },
  {
    value: "Entretenimiento y Ocio",
    label: "Entretenimiento y Ocio",
    iconPath: "fa-solid fa-ticket",
    textColor: "mr-2 text-[#ffd60a]",
  },
  {
    value: "Hogar y Mercado",
    label: "Hogar y Mercado",
    iconPath: "fa-solid fa-house",
    textColor: "mr-2 text-[#ffd60a]",
  },
  {
    value: "Antojos",
    label: "Antojos",
    iconPath: "fa-solid fa-candy-cane",
    textColor: "mr-2 text-[#ffd60a]",
  },
  {
    value: "Electrodomesticos",
    label: "Electrodomesticos",
    iconPath: "fa-solid fa-blender",
    textColor: "mr-2 text-[#ffd60a]",
  },
  {
    value: "Clase",
    label: "Clase",
    iconPath: "fa-solid fa-chalkboard-user",
    textColor: "mr-2 text-[#ffd60a]",
  },
  {
    value: "Ingreso de Dinero",
    label: "Ingreso de Dinero",
    iconPath: "fa-solid fa-money-bill",
    textColor: "mr-2 text-[#ffd60a]",
  },
];

export default function CategoryPage() {
  const [payCategories, setPayCategories] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [editCategory, setEditCategory] = useState({});
  const [isEditMode, setIsEditMode] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [confirmDeleteOpen, setConfirmDeleteOpen] = useState(false);
  const [itemToDelete, setItemToDelete] = useState({});
  useEffect(() => {
    fetchPersonalCategorias();
  }, []);
  const fetchPersonalCategorias = async () => {
    setIsLoading(true);
    const token = localStorage.getItem("token");
    try {
      const response = await fetch(
        "https://two024-qwerty-back-final-marcello.onrender.com/api/personal-categoria",
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (response.ok) {
        const data = await response.json();
        const customOptions = data.map((cat) => ({
          label: cat.nombre,
          value: cat.nombre,
          iconPath: cat.iconPath,
        }));

        setPayCategories(customOptions);
      }
    } catch (error) {
      console.error("Error al obtener las categorías personalizadas:", error);
    }
  };

  const handleAddCategory = async (newName, newIcon) => {
    const token = localStorage.getItem("token");
    const newValue = {
      nombre: newName,
      iconPath: newIcon,
    };
    try {
      const response = await fetch(
        "https://two024-qwerty-back-final-marcello.onrender.com/api/personal-categoria",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify(newValue),
        }
      );
      if (response.ok) {
        console.log(`Categoría agregada: ${newName}`);
        setPayCategories([]);
        await fetchPersonalCategorias();
        setIsModalOpen(false);
        setEditCategory({});
      } else {
        const errorMessage = await response.text();
        console.error("Error al agregar categoria:", errorMessage);
        console.log("la categoria existeeeeeeeeeee");
        return "La categoria ya existe";
      }
    } catch (err) {
      console.log(err);
    }
  };

  const handleEdit = (categoria) => {
    setEditCategory(categoria);
    setIsEditMode(true);
    setIsModalOpen(true);
  };

  const handleOpenModal = () => {
    setEditCategory({});
    setIsEditMode(false);
    setIsModalOpen(true);
  };

  const confirmDelete = (categoryValue) => {
    setConfirmDeleteOpen(true);
    setItemToDelete(categoryValue);
  };

  const cancelDelete = () => {
    setConfirmDeleteOpen(false);
    setClickDelete(false);
    setItemToDelete({});
  };

  const handleDelete = async (categoryValue) => {
    const filteredCategories = payCategories.filter(
      (category) => category.value === categoryValue
    );
    const token = localStorage.getItem("token");
    const inputValue = {
      nombre: filteredCategories[0].label,
      iconPath: filteredCategories[0].iconPath,
    };
    setConfirmDeleteOpen(false);
    try {
      const response = await fetch(
        "https://two024-qwerty-back-final-marcello.onrender.com/api/personal-categoria",
        {
          method: "DELETE",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify(inputValue),
        }
      );
      if (response.ok) {
        console.log(`Categoría eliminada: ${categoryValue}`);
        setPayCategories([]);
        await fetchPersonalCategorias();
      }
    } catch (err) {
      console.log(err);
    }
  };

  return (
    <AppLayout>
      <div className="space-y-8">
        <div className="flex flex-col sm:flex-row justify-between items-center space-y-4 sm:space-y-0">
          <div className="flex items-center space-x-2">
            <LayoutList className="h-8 w-8 text-primary" />
            <h1 className="text-3xl font-bold font-headline text-white">
              Categorias
            </h1>
          </div>
          <Button
            className="bg-primary hover:bg-primary/90 text-primary-foreground"
            onClick={handleOpenModal}
          >
            <PlusCircle className="mr-2 h-4 w-4" /> Add Payment Method
          </Button>
          <ModalCategoria
            isOpen={isModalOpen}
            onRequestClose={() => {
              setEditCategory({});
              setIsModalOpen(false);
            }}
            handleCreateCat={handleAddCategory}
            handleEditCat={handleEdit}
            edit={isEditMode}
            editCat={editCategory}
          />
        </div>

        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {defaultCategories.map((category) => (
            <Card
              key={category.value}
              className="shadow-lg hover:shadow-xl transition-shadow duration-300 flex flex-col justify-between"
            >
              <CardHeader>
                <div className="flex items-center justify-between">
                  <FontAwesomeIcon
                    icon={category.iconPath}
                    className={`${category.textColor} h-8 w-8 text-primary`}
                  />
                </div>
                <CardTitle className="font-headline pt-2">
                  {category.value}
                </CardTitle>
              </CardHeader>
              <CardContent></CardContent>
            </Card>
          ))}
          {payCategories.map((category) => (
            <Card
              key={category.value}
              className="shadow-lg hover:shadow-xl transition-shadow duration-300 flex flex-col justify-between"
            >
              <CardHeader>
                <div className="flex items-center justify-between">
                  <FontAwesomeIcon
                    icon={category.iconPath}
                    className="h-8 w-8"
                  />
                  <div className="flex space-x-1">
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8"
                      onClick={() => handleEdit(category)}
                    >
                      <Edit3 className="h-4 w-4" />
                      <span className="sr-only">Edit</span>
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8 text-destructive hover:text-destructive/80"
                      onClick={() => confirmDelete(category.value)}
                    >
                      <Trash2 className="h-4 w-4" />
                      <span className="sr-only">Delete</span>
                    </Button>
                  </div>
                </div>
                <CardTitle className="font-headline pt-2">
                  {category.value}
                </CardTitle>
              </CardHeader>
              <CardContent></CardContent>
            </Card>
          ))}
        </div>
        <ConfirmDeleteCategory
          isOpen={confirmDeleteOpen}
          handleClose={cancelDelete}
          handleDelete={() => {
            handleDelete(itemToDelete);
          }}
        />
      </div>
    </AppLayout>
  );
}
