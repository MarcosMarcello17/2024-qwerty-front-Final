import React, { useEffect, useState } from "react";
import Modal from "react-modal";

function AlertPending({
  pendingTransaction,
  isOpen,
  isAccepted = () => {},
  isRejected = () => {},
  payCategories,
}) {
  const defaultMediosDePago = [
    {
      value: "Tarjeta de credito",
      label: "Tarjeta de credito",
      textColor: "mr-2 text-yellow-500",
    },
    {
      value: "Tarjeta de Debito",
      label: "Tarjeta de debito",
      textColor: "mr-2 text-yellow-500",
    },
    { value: "Efectivo", label: "Efectivo", textColor: "mr-2 text-yellow-500" },
  ];
  const [isLoading, setIsLoading] = useState(false);
  const [categoria, setCategoria] = useState("");
  const [payOptions, setPayOptions] = useState([]);
  const [payOption, setPayOption] = useState("");
  const [errorMessage, setErrorMessage] = useState("");

  const fetchPersonalTipoGastos = async () => {
    const token = localStorage.getItem("token");
    try {
      const response = await fetch(
        "https://two024-qwerty-back-final-marcello.onrender.com/api/personal-tipo-gasto",
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      if (response.ok) {
        const data = await response.json();
        const customOptions = data.map((tipo) => ({
          label: tipo.nombre,
          value: tipo.nombre,
          textColor: "mr-2 text-white",
        }));
        setPayOptions([...defaultMediosDePago, ...customOptions]);
      }
    } catch (error) {
      console.error(
        "Error al obtener los tipos de gasto personalizados:",
        error
      );
    }
  };

  useEffect(() => {
    fetchPersonalTipoGastos();
  }, []);

  const handleAccept = () => {
    if (pendingTransaction.id_reserva == "Cobro") {
      if (!categoria || !payOption) {
        setErrorMessage("Todos los campos son obligatorios.");
        return;
      }
    }

    setIsLoading(true);
    setErrorMessage("");
    isAccepted(pendingTransaction, categoria, payOption);
    setIsLoading(false);
  };

  const handleReject = () => {
    isRejected(pendingTransaction);
  };

  const handleCategoryChange = (e) => {
    const selectedValue = e.target.value;
    setCategoria(selectedValue);
    setSelectedCategory(
      payCategories.find((cat) => cat.value === selectedValue)
    );
  };
  if (pendingTransaction.id_reserva == "Cobro") {
    return (
      <Modal
        isOpen={isOpen}
        className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-90 z-50"
        overlayClassName="flex items-center justify-center"
      >
        <div className="relative w-11/12 max-w-lg bg-[#000814] text-white p-6 rounded-lg shadow-lg overflow-y-auto max-h-[90vh]">
          <h2 className="text-xl font-bold mb-4">CONFIRMAR TRANSACCION</h2>
          <label className="block mb-2">
            Confirme o rechace la transaccion
          </label>
          <label className="block mb-2">
            Motivo: {pendingTransaction.motivo}
          </label>
          <label className="block mb-2">
            Valor: {pendingTransaction.valor}
          </label>
          <label className="block mb-2">
            Fecha: {pendingTransaction.fecha}
          </label>
          {pendingTransaction.sentByEmail && (
            <label className="block mb-2">
              Enviado por: {pendingTransaction.sentByEmail}
            </label>
          )}

          {/* Si hay un mensaje de error, lo mostramos */}
          {errorMessage && (
            <div className="text-red-500 mb-4">{errorMessage}</div>
          )}

          <div>
            <label className="text-gray-100 mb-6">Categoría:</label>
            <select
              value={categoria}
              onChange={handleCategoryChange}
              className="select select-warning w-full mt-1 block text-white bg-[#000814]"
            >
              <option value="">Selecciona una categoría</option>
              {payCategories.map((cat) => (
                <option key={cat.value} value={cat.value}>
                  {cat.label}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="text-gray-100 mb-6">Tipo de Gasto:</label>
            <select
              value={payOption}
              onChange={(e) => setPayOption(e.target.value)}
              className="select select-warning w-full mt-1 block text-white bg-[#000814]"
            >
              <option value="">Selecciona una Tipo de Gasto</option>
              {payOptions.map((cat) => (
                <option key={cat.value} value={cat.value}>
                  {cat.label}
                </option>
              ))}
            </select>
          </div>

          <div className="flex justify-end mt-2">
            <button
              className="bg-[#FFD60A] hover:bg-[#FFC300] text-black font-bold py-2 px-4 rounded mr-2"
              onClick={handleAccept}
              disabled={isLoading}
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
              ) : (
                "Aceptar"
              )}
            </button>
            <button
              className="bg-red-500 hover:bg-red-700 text-white font-bold py-2 px-4 rounded"
              onClick={handleReject}
            >
              Rechazar
            </button>
          </div>
        </div>
      </Modal>
    );
  } else if (pendingTransaction.id_reserva == "Pago") {
    return (
      <Modal
        isOpen={isOpen}
        className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-90 z-50"
        overlayClassName="flex items-center justify-center"
      >
        <div className="relative w-11/12 max-w-lg bg-[#000814] text-white p-6 rounded-lg shadow-lg overflow-y-auto max-h-[90vh]">
          <h2 className="text-xl font-bold mb-4">ATENCION</h2>
          <label className="block mb-2">Usted ha recibido un pago!</label>
          <label className="block mb-2">
            Motivo: {pendingTransaction.motivo}
          </label>
          <label className="block mb-2">
            Valor: {pendingTransaction.valor}
          </label>
          <label className="block mb-2">
            Fecha: {pendingTransaction.fecha}
          </label>
          {pendingTransaction.sentByEmail && (
            <label className="block mb-2">
              Enviado por: {pendingTransaction.sentByEmail}
            </label>
          )}
          <div className="flex justify-end mt-2">
            <button
              className="bg-[#FFD60A] hover:bg-[#FFC300] text-black font-bold py-2 px-4 rounded mr-2"
              onClick={handleAccept}
              disabled={isLoading}
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
              ) : (
                "Aceptar"
              )}
            </button>
          </div>
        </div>
      </Modal>
    );
  } else if (pendingTransaction.id_reserva == "Grupo") {
    return (
      <Modal
        isOpen={isOpen}
        className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-90 z-50"
        overlayClassName="flex items-center justify-center"
      >
        <div className="relative w-11/12 max-w-lg bg-[#000814] text-white p-6 rounded-lg shadow-lg overflow-y-auto max-h-[90vh]">
          <h2 className="text-xl font-bold mb-4">ATENCION</h2>
          <label className="block mb-2">Se lo a invitado al grupo:</label>
          <label className="block mb-2">
            Grupo: {pendingTransaction.motivo}
          </label>
          {pendingTransaction.sentByEmail && (
            <label className="block mb-2">
              Enviado por: {pendingTransaction.sentByEmail}
            </label>
          )}
          <div className="flex justify-end mt-2">
            <button
              className="bg-[#FFD60A] hover:bg-[#FFC300] text-black font-bold py-2 px-4 rounded mr-2"
              onClick={handleAccept}
              disabled={isLoading}
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
              ) : (
                "Aceptar"
              )}
            </button>
            <button
              className="bg-red-500 hover:bg-red-700 text-white font-bold py-2 px-4 rounded"
              onClick={handleReject}
            >
              Rechazar
            </button>
          </div>
        </div>
      </Modal>
    );
  } else {
    return (
      <Modal
        isOpen={isOpen}
        className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-90 z-50"
        overlayClassName="flex items-center justify-center"
      >
        <div className="relative w-11/12 max-w-lg bg-[#000814] text-white p-6 rounded-lg shadow-lg overflow-y-auto max-h-[90vh]">
          <h2 className="text-xl font-bold mb-4">CONFIRMAR TRANSACCION</h2>
          <label className="block mb-2">
            Confirme o rechace la transaccion
          </label>
          <label className="block mb-2">
            Motivo: {pendingTransaction.motivo}
          </label>
          <label className="block mb-2">
            Valor: {pendingTransaction.valor}
          </label>
          <label className="block mb-4">
            Fecha: {pendingTransaction.fecha}
          </label>
          <div className="flex justify-end">
            <button
              className="bg-[#FFD60A] hover:bg-[#FFC300] text-black font-bold py-2 px-4 rounded mr-2"
              onClick={handleAccept}
              disabled={isLoading}
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
              ) : (
                "Aceptar"
              )}
            </button>
            <button
              className="bg-red-500 hover:bg-red-700 text-white font-bold py-2 px-4 rounded"
              onClick={handleReject}
            >
              Rechazar
            </button>
          </div>
        </div>
      </Modal>
    );
  }
}

export default AlertPending;
