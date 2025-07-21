import Modal from "react-modal";
import "./styles/ModalForm.css";
import ModalCategoria from "./ModalCategoria";
import React, { useEffect, useState } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import ConfirmDeleteCategory from "./ConfirmDeleteCategory";

function ModalVerCategorias({
  isModalCategoriaOpen,
  closeModalCategoria,
  payCategories,
  fetchPersonalCategorias,
  setPayCategories,
  getTransacciones,
}) {
  useEffect(() => {
    //fetchPersonalCategorias();
  }, [payCategories]);
  const customStyles = {
    overlay: {
      position: "fixed",
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      backgroundColor: "rgba(0, 0, 0, 0.75)",
      zIndex: 1000,
      display: "flex",
      justifyContent: "center",
      alignItems: "center",
    },
    content: {
      padding: "2rem",
      borderRadius: "0.75rem",
      width: "90vw",
      maxWidth: "500px",
      maxHeight: "90vh", // Limita la altura del modal
      margin: "auto",
      display: "flex",
      flexDirection: "column",
      gap: "1.5rem",
      overflowY: "auto", // Habilita scroll si el contenido excede el tamaño
      zIndex: 1001,
    },
  };
  const [modalError, setModalError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editCategory, setEditCategory] = useState({});
  const [isEditMode, setIsEditMode] = useState(false);
  const [confirmDeleteOpen, setConfirmDeleteOpen] = useState(false);
  const [itemToDelete, setItemToDelete] = useState({});
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
  const closeWindow = () => {
    setModalError("");
    closeModalCategoria();
  };
  const handleEdit = async (categoryValue, newName, newIcon) => {
    const filteredCategories = payCategories.filter(
      (category) => category.value === categoryValue.value
    );
    const token = localStorage.getItem("token");
    const inputValue = {
      nombre: filteredCategories[0].label,
      iconPath: filteredCategories[0].iconPath,
    };
    const newValue = {
      nombre: newName,
      iconPath: newIcon,
    };
    try {
      const response = await fetch(
        "https://two024-qwerty-back-final-marcello.onrender.com/api/personal-categoria/" +
          inputValue.nombre,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify(newValue),
        }
      );
      if (response.ok) {
        setPayCategories([]);
        await getTransacciones();
        setIsModalOpen(false);
      }
    } catch (err) {
      console.error(err);
    }
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
        setPayCategories([]);
        await getTransacciones();
      }
    } catch (err) {
      console.error(err);
    }
  };

  const cancelDelete = () => {
    setConfirmDeleteOpen(false);
    setClickDelete(false);
    setItemToDelete({});
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
        setPayCategories([]);
        await fetchPersonalCategorias();
        setIsModalOpen(false);
        setEditCategory({});
      } else {
        const errorMessage = await response.text();
        console.error("Error al agregar categoria:", errorMessage);
        return "La categoria ya existe";
      }
    } catch (err) {
      console.error(err);
    }
  };

  const confirmDelete = (categoryValue) => {
    setConfirmDeleteOpen(true);
    setItemToDelete(categoryValue);
  };

  return (
    <Modal
      isOpen={isModalCategoriaOpen}
      onRequestClose={closeModalCategoria}
      contentLabel="Mis Categorias"
      style={customStyles}
      className="bg-[#000814] shadow-lg p-4 rounded-lg"
    >
      <div className="text-2xl font-bold text-gray-100 text-center mb-4">
        Mis Categorias
      </div>
      <div className="flex flex-col flex-grow px-4">
        <div className="bg-[#001d3d] p-4 rounded-lg shadow-lg text-white">
          <ul>
            {defaultCategories.map((category) => (
              <li
                key={category.value}
                className="bg-[#003566] p-3 rounded-md shadow mb-3"
              >
                <div className="flex items-center">
                  <FontAwesomeIcon
                    icon={category.iconPath}
                    className={`${category.textColor} text-lg`}
                  />
                  <div className={category.textColor}>{category.label}</div>
                </div>
              </li>
            ))}
          </ul>

          <ul>
            {payCategories.slice(9).map((category) => (
              <li
                key={category.value}
                className="bg-[#003566] p-3 rounded-md shadow mb-3 flex justify-between"
              >
                <div className="flex items-center">
                  <FontAwesomeIcon icon={category.iconPath} />
                  <div className="ml-2">{category.label}</div>
                </div>
                <div className="flex items-center">
                  <button
                    className="text-white hover:bg-[#001d3d] mr-2"
                    onClick={() => {
                      setEditCategory(category);
                      setIsEditMode(true);
                      setIsModalOpen(true);
                    }}
                  >
                    Editar
                  </button>
                  <button
                    className="text-red-500 hover:text-red-700 hover:bg-[#001d3d]"
                    onClick={() => confirmDelete(category.value)}
                  >
                    X
                  </button>
                </div>
              </li>
            ))}
          </ul>
          <button
            className="mt-4 px-4 py-3 bg-[#ffd60a] text-black rounded-md hover:bg-[#ffc300] mr-2"
            onClick={() => {
              setEditCategory({});
              setIsEditMode(false);
              setIsModalOpen(true);
            }}
          >
            Agregar Categoría
          </button>
          <button
            onClick={closeWindow}
            className="flex-1 bg-red-500 text-white font-bold py-3 px-4 rounded hover:bg-red-600 transition-colors duration-300"
          >
            Cerrar
          </button>
        </div>{" "}
      </div>
      <ModalCategoria
        isOpen={isModalOpen}
        onRequestClose={() => setIsModalOpen(false)}
        handleCreateCat={handleAddCategory}
        handleEditCat={handleEdit}
        edit={isEditMode}
        editCat={editCategory}
      />
      <ConfirmDeleteCategory
        isOpen={confirmDeleteOpen}
        handleClose={cancelDelete}
        handleDelete={() => {
          handleDelete(itemToDelete);
        }}
      />
    </Modal>
  );
}

export default ModalVerCategorias;
