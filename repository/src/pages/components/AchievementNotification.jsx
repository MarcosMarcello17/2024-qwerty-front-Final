import React, { useState, useEffect, useRef } from "react";

const AchievementNotification = ({ achievement, onClose }) => {
  const [visible, setVisible] = useState(true);
  const [achievementDesc, setAchievementDesc] = useState("");
  const dialogRef = useRef(null);

  // Actualiza el mensaje de logro en base a `achievement`
  useEffect(() => {
    if (achievement === 1) {
      setAchievementDesc("Transacciones (Bronce): Crear 1 transacción");
    } else if (achievement === 5) {
      setAchievementDesc("Transacciones (Plata): Crear 5 transacciones");
    } else {
      setAchievementDesc("Transacciones (Oro): Crear 10 transacciones");
    }
  }, [achievement]);

  // Maneja el temporizador de cierre automático
  useEffect(() => {
    const timer = setTimeout(() => {
      setVisible(false);
      if (onClose) {
        onClose();
      }
    }, 5000);

    return () => clearTimeout(timer); // Limpieza del temporizador al desmontar el componente
  }, [onClose]);

  // Muestra el `dialog` cuando es visible
  useEffect(() => {
    if (dialogRef.current && visible) {
      dialogRef.current.showModal();
    }
  }, [visible]);

  // Si el componente no está visible, no renderiza nada
  if (!visible) return null;

  return (
    <dialog ref={dialogRef} className="modal">
      <div className="modal-box bg-[#000814]">
        <button
          className="btn btn-sm btn-circle btn-ghost absolute right-2 top-2"
          onClick={() => {
            setVisible(false);
            if (onClose) {
              onClose();
            }
          }}
        >
          ✕
        </button>
        <h3 className="font-bold text-lg text-white">
          ¡Nuevo Logro Desbloqueado!
        </h3>
        <img
          src="https://cdn-icons-png.flaticon.com/512/1875/1875506.png"
          alt={`Achievement`}
          className={`w-28 h-28 object-contain mx-auto border-4 rounded-full border-[#FFC300]`}
        />
        <p className="py-4 text-white">{achievementDesc}</p>
      </div>
    </dialog>
  );
};

export default AchievementNotification;
