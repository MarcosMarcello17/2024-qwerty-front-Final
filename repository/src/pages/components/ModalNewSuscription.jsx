import React, { useState } from "react";

function ModalNewSuscription({ newSubs = [] }) {
  const [selectedSubs, setSelectedSubs] = useState([]);

  const handleCheckboxChange = (sub) => {
    setSelectedSubs((prev) => {
      if (prev.includes(sub)) {
        return prev.filter((s) => s !== sub);
      } else {
        return [...prev, sub];
      }
    });
  };

  const handleSubmit = (sub) => {
    console.log("Guardando suscripción: ", sub);
  };

  const onSubmit = (e) => {
    e.preventDefault();
    selectedSubs.forEach((sub) => {
      console.log(sub.transacciones);
      const lastTransaction = sub.transacciones[sub.transacciones.length - 1];
      handleSubmit({
        descripcion: sub.descripcion,
        monto: lastTransaction.valor,
      });
    });
    document.getElementById("newSubModal").close();
  };

  return (
    <dialog id="newSubModal" className="modal">
      <div className="modal-box bg-[#000814]">
        <h2 className="text-2xl font-bold text-center mb-1 text-gray-100">
          SE DETECTARON POSIBLES SUSCRIPCIONES
        </h2>
        <form onSubmit={onSubmit} className="space-y-4">
          <div className="text-white mb-4">
            Selecciona las transacciones que deseas registrar como
            suscripciones:
          </div>
          <div className="space-y-2">
            {newSubs.map((sub, index) => (
              <div key={index} className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id={`sub-${index}`}
                  checked={selectedSubs.includes(sub)}
                  onChange={() => handleCheckboxChange(sub)}
                  className="checkbox border border-[#ffd60a]"
                />
                <label
                  htmlFor={`sub-${index}`}
                  className="text-white cursor-pointer"
                >
                  {sub.descripcion}
                </label>
              </div>
            ))}
            <div className="text-gray-200 mb-4 text-xs">
              Las suscripciones seleccionadas se guardarán con el último monto
              registrado en la transacción. Y son agregadas automaticamente cada
              mes
            </div>
          </div>

          <div className="flex justify-end gap-2 mt-4">
            <button
              type="button"
              onClick={() => {
                document.getElementById("newSubModal").close();
              }}
              className="btn bg-red-600 border-none hover:bg-red-700 text-white"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={selectedSubs.length === 0}
              className="btn border-none bg-[#ffd60a] hover:bg-[#ffc300] disabled:bg-gray-500"
            >
              Guardar Suscripciones
            </button>
          </div>
        </form>
      </div>
    </dialog>
  );
}

export default ModalNewSuscription;
