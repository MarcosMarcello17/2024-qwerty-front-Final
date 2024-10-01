import React, { useState } from 'react';
import Modal from 'react-modal';

function AlertPending({pendingTransaction, isOpen, isAccepted = () => {}, isRejected = () => {}}) {
    const customStyles = {
        overlay: {
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: 'rgba(0, 255, 255, 0.75)', // Fondo semitransparente
            zIndex: 1002,
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
        },
        content: {
            position: 'relative',
            width: '90%', // El modal ocupa el 90% del ancho en dispositivos pequeños
            maxWidth: '500px', // Máximo ancho del modal para pantallas grandes
            height: 'auto', // Altura automática para ajustarse al contenido
            maxHeight: '90vh', // En pantallas pequeñas, que no exceda el 90% de la altura de la ventana
            padding: '20px', // Padding interno adaptativo
            margin: 'auto', // Centrar el modal
            borderRadius: '10px', // Bordes redondeados
            backgroundColor: '#1a1a1a', // Fondo oscuro para mantener el estilo
            overflowY: 'auto', // Habilitamos scroll si el contenido es demasiado grande
        },
    };
    const [isLoading, setIsLoading] = useState(false);

    const handleAccept = () => {
        setIsLoading(true);
        isAccepted(pendingTransaction);
        setIsLoading(false);
    }

    const handleReject = () => {
        isRejected(pendingTransaction);
    }

    return (
        <Modal 
            isOpen={isOpen}
            style={customStyles}
            className="bg-gray-900 text-white p-4 sm:p-2 rounded-lg shadow-lg"
        >
            <h2>CONFIRMAR TRANSACCION</h2>
            <label>Confirme o rechace la transaccion</label>
            <br/>
            <label>Motivo: {pendingTransaction.motivo}</label>
            <br/>
            <label>Valor: {pendingTransaction.valor}</label>
            <br/>
            <label>Fecha: {pendingTransaction.fecha}</label>
            <br/>
            <button className="bg-green-600 hover:bg-green-700 text-white font-bold py-2 px-3 rounded mr-2" onClick={handleAccept} disabled={isLoading}>
            {isLoading ? (
                            <div className="flex items-center justify-center">
                                <svg className="animate-spin h-5 w-5 text-gray-950" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"></path>
                                </svg>
                                <span className="ml-2">Cargando...</span>
                            </div>
                        ) : "Aceptar"}
                </button>
            <button className="bg-red-500 hover:bg-red-700 text-white font-bold py-2 px-3 rounded" onClick={handleReject}>Rechazar</button>
        </Modal>
    )
}

export default AlertPending