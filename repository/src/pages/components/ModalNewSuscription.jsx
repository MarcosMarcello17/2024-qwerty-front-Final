import React, { useState } from 'react';


function ModalNewSuscription({handleSubmit = () => {}, newSubs = []}) {
    console.log(newSubs);
    const [isModalOpen, setIsModalOpen] = useState(true);
    return ( 
        <dialog id="newSubModal" className={`modal ${isModalOpen ? "open" : ""}`}>
            <div className="modal-box bg-black">
                <h2 className="text-2xl font-bold text-center mb-1 text-gray-100">
                    SE DETECTO UNA POSIBLE SUSCRIPCION
                </h2>
                <form onSubmit={handleSubmit}>
                    <div>
                        Detectamos transacciones realizadas mensualmente con este motivo: 
                    </div>
                    {newSubs.map((sub) => {
                        return(
                            <div>
                                {sub.descripcion}
                            </div>
                        )
                    })}
                    Si queres activar esta transaccion como subscripcion, completa el formulario
                </form>
            </div>
        </dialog>
    );
}

export default ModalNewSuscription;