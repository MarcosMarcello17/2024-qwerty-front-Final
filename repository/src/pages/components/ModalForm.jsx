import { useState, useEffect } from "react";
import Modal from "react-modal";
import Select from "react-select";
import "./styles/ModalForm.css";
import ModalCategoria from "./ModalCategoria";
import CreatableSelect from "react-select/creatable";
import { Repeat } from "lucide-react";
import { Switch } from "@/components/ui/switch";
import AutomaticDistribution from "../../components/AutomaticDistribution";
import { checkCanDistributeAutomatically } from "../../functions/automaticDistributionAPI";
import { distributeIncomeAutomatically } from "../../functions/distributeIncomeAPI";

function ModalForm({
  isModalOpen,
  closeModal,
  agregarTransaccion,
  edit,
  motivo,
  valor,
  fecha,
  handleMotivoChange,
  setValor,
  selectedCategory,
  payCategories,
  handleCategoryChange,
  handleCreateCat,
  setFecha,
  handlePayChange,
  selectedPayMethod,
  payOptions,
  handleCreateTP,
  handleGroupChange,
  selectedGroup,
  grupos,
}) {
  const [isRecurrent, setIsRecurrent] = useState(false);
  const [showDistributionModal, setShowDistributionModal] = useState(false);
  const [canDistributeAutomatically, setCanDistributeAutomatically] =
    useState(false);
  const [isIngresoCategory, setIsIngresoCategory] = useState(false);
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
      padding: "1.5rem",
      borderRadius: "0.75rem",
      width: "90vw",
      maxWidth: "500px",
      maxHeight: "90vh",
      margin: "auto",
      display: "flex",
      flexDirection: "column",
      gap: "1rem",
      zIndex: 1001,
      overflow: "auto",
    },
  };
  const customSelectStyles = {
    control: (provided) => ({
      ...provided,
      backgroundColor: "#000814",
      color: "white",
      borderColor: "#000814",
      borderRadius: "calc(0.5rem - 2px)",
    }),
    menu: (provided) => ({
      ...provided,
      backgroundColor: "#000814",
    }),
    option: (provided, state) => ({
      ...provided,
      backgroundColor: state.isSelected ? "#ffc300" : "#000814",
      color: state.isSelected ? "black" : "white",
    }),
    singleValue: (provided) => ({
      ...provided,
      color: "white",
    }),
    placeholder: (provided) => ({
      ...provided,
      color: "white",
    }),
    input: (provided) => ({
      ...provided,
      color: "white",
    }),
    indicatorSeparator: (provided) => ({
      ...provided,
      backgroundColor: "transparent",
    }),
    dropdownIndicator: (provided) => ({
      ...provided,
      color: "white",
    }),
  };
  const [modalError, setModalError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [activeGroups, setActiveGroups] = useState([]);
  const [isModalCategoriaOpen, setIsModalCategoriaOpen] = useState(false);
  const [isGroupDisabled, setIsGroupDisabled] = useState(false);
  const [isCategoryDisabled, setIsCategoryDisabled] = useState(false);
  useEffect(() => {
    if (grupos == null) {
      grupos = [selectedGroup];
    }
    setActiveGroups(grupos.filter((grupo) => grupo.estado === true));
  }, [grupos]);

  // Verificar si la categoría es "Ingreso de Dinero"
  useEffect(() => {
    const isIngreso =
      selectedCategory && selectedCategory.value === "Ingreso de Dinero";
    setIsIngresoCategory(isIngreso);

    if (isIngreso && fecha) {
      checkDistributionAvailability();
    } else {
      setCanDistributeAutomatically(false);
    }
  }, [selectedCategory, fecha]);

  const checkDistributionAvailability = async () => {
    try {
      const canDistribute = await checkCanDistributeAutomatically(fecha);
      setCanDistributeAutomatically(canDistribute);
    } catch (error) {
      console.error("Error checking distribution availability:", error);
      setCanDistributeAutomatically(false);
    }
  };

  useEffect(() => {
    if (selectedCategory && selectedCategory.value === "Gasto Grupal") {
      setIsGroupDisabled(false);
      setIsCategoryDisabled(false);
    } else if (selectedCategory && selectedCategory.value != "Gasto Grupal") {
      setIsGroupDisabled(true);
      setIsCategoryDisabled(false);
    } else if (selectedGroup) {
      setIsGroupDisabled(false);
      setIsCategoryDisabled(true);
    } else {
      setIsCategoryDisabled(false);
      setIsGroupDisabled(false);
    }
    if (edit && handleGroupChange != null) {
      setIsGroupDisabled(true);
    }
  }, [selectedCategory, selectedGroup]);
  const openModalCategoria = () => {
    setIsModalCategoriaOpen(true);
  };
  const closeModalCategoria = () => {
    setIsModalCategoriaOpen(false);
  };
  const sendTransaccion = async (e) => {
    e.preventDefault();
    if (valor <= 0) {
      setModalError("Ingrese un valor positivo");
      return;
    }
    setIsLoading(true);
    try {
      await agregarTransaccion(e, selectedCategory.value, isRecurrent);
    } catch (error) {
      console.error("Error al agregar transacción:", error);
    } finally {
      setIsLoading(false); // Desactivamos el spinner al finalizar
      closeModal();
      setModalError("");
      setIsRecurrent(false);
    }
  };

  const handleDistributeAutomatically = async () => {
    if (!isIngresoCategory || !canDistributeAutomatically) {
      return;
    }
    setShowDistributionModal(true);
  };

  const handleConfirmDistribution = async (shouldDistribute) => {
    setShowDistributionModal(false);

    if (shouldDistribute) {
      setIsLoading(true);
      try {
        const result = await distributeIncomeAutomatically(
          parseFloat(valor),
          fecha,
          motivo || "Distribución automática"
        );

        if (result.success) {
          alert(
            `¡Distribución exitosa! Se crearon ${result.transaccionesCreadas} transacciones automáticamente según tus presupuestos.`
          );
        } else {
          alert(`Error en la distribución: ${result.error}`);
        }
      } catch (error) {
        console.error("Error al distribuir ingreso:", error);
        alert("Error de conexión al distribuir el ingreso");
      } finally {
        setIsLoading(false);
        closeModal();
        setModalError("");
      }
    }
  };

  const handleCancelDistribution = () => {
    setShowDistributionModal(false);
  };
  const closeWindow = () => {
    setModalError("");
    setIsRecurrent(false);
    closeModal();
  };

  const handleCategorySelect = (category) => {
    handleCategoryChange(category);
    if (category.value === "Gasto Grupal") {
      setIsGroupDisabled(false); // Habilita grupo si es gasto grupal
      setIsCategoryDisabled(true); // Desactiva categoría
    } else {
      setIsGroupDisabled(true); // Desactiva grupo
      handleGroupChange(null); // Limpia selección de grupo
    }
  };

  const handleGroupSelect = (group) => {
    handleGroupChange(group);
    if (group) {
      setIsCategoryDisabled(true); // Desactiva categoría si hay grupo seleccionado
      handleCategoryChange({ value: "Gasto Grupal", label: "Gasto Grupal" });
    } else {
      setIsCategoryDisabled(false); // Habilita categoría si no hay grupo
    }
  };

  return (
    <Modal
      isOpen={isModalOpen}
      onRequestClose={closeModal}
      contentLabel="Agregar Transacción"
      style={customStyles}
      className="bg-card shadow-lg p-4 rounded-lg"
    >
      <h2 className="text-xl font-bold text-center mb-2 text-gray-100">
        {edit ? "Editar Transacción" : "Agregar Nueva Transacción"}
      </h2>
      <form onSubmit={sendTransaccion} className="flex flex-col gap-2.5">
        <div>
          <label className="text-sm text-gray-100 mb-1 block">Motivo:</label>
          <input
            type="text"
            value={motivo}
            onChange={handleMotivoChange}
            className="mt-1 block w-full p-2 bg-background text-white rounded-md shadow-sm"
            required
          />
        </div>
        <div>
          <label className="text-sm text-gray-100 mb-1 block">Valor:</label>
          <input
            type="number"
            value={valor}
            onChange={(e) => setValor(e.target.value)}
            className="mt-1 block w-full p-2 bg-background text-white rounded-md shadow-sm"
            required
          />
        </div>
        <div>
          <label className="text-sm text-gray-100 mb-1 block">
            Medio de Pago:
          </label>
          <CreatableSelect
            options={payOptions}
            onChange={handlePayChange}
            onCreateOption={handleCreateTP}
            value={selectedPayMethod}
            className="custom-select mt-1 block w-full text-white rounded-md shadow-sm border-transparent"
            styles={customSelectStyles}
            required
          />
        </div>
        <div>
          <label className="text-sm text-gray-100 mb-1 block">Categoria:</label>
          {handleGroupChange ? (
            <div className="flex items-center">
              <Select
                options={payCategories}
                onChange={handleCategorySelect}
                value={selectedCategory}
                isDisabled={isCategoryDisabled} // Desactivar si ya hay un grupo seleccionado
                className="custom-select mt-1 block w-full text-white rounded-md shadow-sm border-transparent"
                styles={customSelectStyles}
                required
              />
              <button
                type="button"
                onClick={() => openModalCategoria()}
                className="ml-2 bg-[#ffd60a] py-1 px-2 rounded text-black hover:bg-[#ffc300]"
              >
                +
              </button>
            </div>
          ) : (
            // Renderiza un input de solo lectura cuando handleGroupChange es null
            <input
              type="text"
              value={
                selectedCategory
                  ? selectedCategory.label
                  : "Ningún grupo seleccionado"
              }
              readOnly
              className="mt-1 block w-full p-2 border bg-[#001d3d] text-white rounded-md shadow-sm"
            />
          )}
        </div>
        <div>
          <label className="text-sm text-gray-100 mb-1 block">Fecha:</label>
          <input
            type="date"
            value={fecha}
            onChange={(e) => setFecha(e.target.value)}
            className="mt-1 block w-full p-2 border bg-background text-white rounded-md shadow-sm "
            required
          />
        </div>
        <div>
          <label className="text-sm text-gray-100 mb-1 block">
            Grupo (solo para gastos grupales):
          </label>
          {isGroupDisabled && (
            <p className="text-yellow-500 text-xs text-center mb-1">
              {edit && selectedCategory.label == "Gasto Grupal"
                ? "(no se pueden agregar transacciones propias a grupos)"
                : "(Opción habilitada únicamente para categoría: Gasto Grupal)"}
            </p>
          )}
          {handleGroupChange ? (
            // Renderiza el componente Select cuando handleGroupChange no es null
            <Select
              options={[
                { value: null, label: "Select..." },
                ...activeGroups.map((grupo) => ({
                  value: grupo.id,
                  label: grupo.nombre,
                })),
              ]}
              onChange={handleGroupSelect}
              value={selectedGroup}
              isDisabled={isGroupDisabled} // Desactivar si la categoría no es "Gasto Grupal"
              className="custom-select mt-1 block w-full border bg-gray-900 text-white rounded-md shadow-sm border-transparent"
              styles={customSelectStyles}
            />
          ) : (
            // Renderiza un input de solo lectura cuando handleGroupChange es null
            <input
              type="text"
              value={
                selectedGroup
                  ? selectedGroup.nombre
                  : "Ningún grupo seleccionado"
              }
              readOnly
              className="mt-1 block w-full p-2 border bg-[#001d3d] text-white border-[#ffc300] rounded-md shadow-sm focus:ring-yellow-500 focus:border-yellow-500"
            />
          )}
        </div>
        <div className="flex items-center bg-[#0a223a] rounded-lg p-3 mt-2 mb-2 border border-[#132c47]">
          <div className="flex items-center mr-3">
            <Repeat className="h-5 w-5 text-[#b5e0ff] mr-2" />
            <div>
              <span className="font-medium text-white text-sm block">
                Transacción Recurrente
              </span>
              <p className="text-xs text-[#b5e0ff]">
                Se registrará automáticamente cada mes
              </p>
            </div>
          </div>
          <div className="ml-auto">
            <Switch
              checked={isRecurrent}
              onCheckedChange={() => setIsRecurrent(!isRecurrent)}
            />
          </div>
        </div>
        {modalError && (
          <div className="text-red-500 text-sm text-center">{modalError}</div>
        )}

        {/* Mostrar opción de distribución automática para ingresos existentes - Diseño compacto */}
        {isIngresoCategory && canDistributeAutomatically && edit && (
          <div className="bg-[#0a223a] rounded-lg p-3 mt-2 mb-2 border border-[#132c47]">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center">
                <Repeat className="h-5 w-5 text-[#b5e0ff] mr-2" />
                <span className="font-medium text-white text-sm">
                  Distribución Automática Disponible
                </span>
              </div>
              <button
                type="button"
                onClick={handleDistributeAutomatically}
                className="bg-[#ffd60a] text-black font-bold py-1.5 px-3 rounded-lg hover:bg-[#ffc300] transition-colors duration-300 text-sm"
              >
                Distribuir
              </button>
            </div>
            <p className="text-xs text-[#b5e0ff]">
              Distribuye proporcionalmente según tus presupuestos del mes
            </p>
          </div>
        )}

        <div className="flex gap-2 mt-2">
          <button
            type="submit"
            disabled={isLoading}
            className="flex-1 bg-[#ffd60a] bg-opacity-90 font-bold text-gray-950 py-2 px-4 rounded-lg hover:bg-[#ffc300]"
          >
            {isLoading ? (
              <div className="flex items-center justify-center">
                <svg
                  className="animate-spin h-5 w-5 text-gray-950"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                >
                  <circle
                    className="opacity-25"
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    strokeWidth="4"
                  ></circle>
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
                  ></path>
                </svg>
                <span className="ml-2">Cargando...</span>
              </div>
            ) : edit ? (
              "Guardar Cambios"
            ) : (
              "Agregar Transacción"
            )}
          </button>
          <button
            onClick={closeWindow}
            className="flex-1 bg-red-500 text-white font-bold py-3 px-4 rounded hover:bg-red-600 transition-colors duration-300"
          >
            Cerrar
          </button>
        </div>
      </form>
      <ModalCategoria
        isOpen={isModalCategoriaOpen}
        onRequestClose={closeModalCategoria}
        handleCreateCat={handleCreateCat}
      />

      <AutomaticDistribution
        isVisible={showDistributionModal}
        valor={valor}
        fecha={fecha}
        motivo={motivo}
        onDistribute={handleConfirmDistribution}
        onCancel={handleCancelDistribution}
      />
    </Modal>
  );
}

export default ModalForm;
