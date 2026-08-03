import React, { useState, useEffect, useRef } from "react";
import { Trophy, X, Star } from "lucide-react";

const AchievementNotification = ({ achievement, onClose }) => {
  const [visible, setVisible] = useState(true);
  const [achievementDesc, setAchievementDesc] = useState("");
  const [achievementType, setAchievementType] = useState("");
  const dialogRef = useRef(null);

  // Actualiza el mensaje de logro en base a `achievement`
  useEffect(() => {
    if (achievement === 1) {
      setAchievementDesc("Crear 1 transacción");
      setAchievementType("Bronce");
    } else if (achievement === 5) {
      setAchievementDesc("Crear 5 transacciones");
      setAchievementType("Plata");
    } else {
      setAchievementDesc("Crear 10 transacciones");
      setAchievementType("Oro");
    }
  }, [achievement]);

  // Función para determinar el color del borde según el tipo
  const getBorderColor = (type) => {
    switch (type.toLowerCase()) {
      case "bronce":
        return "border-orange-600";
      case "plata":
        return "border-gray-400";
      case "oro":
        return "border-yellow-400";
      default:
        return "border-primary";
    }
  };

  const getBadgeColor = (type) => {
    switch (type.toLowerCase()) {
      case "bronce":
        return "bg-orange-600 text-white";
      case "plata":
        return "bg-gray-400 text-gray-800";
      case "oro":
        return "bg-yellow-400 text-yellow-900";
      default:
        return "bg-primary text-primary-foreground";
    }
  };

  const getGlowColor = (type) => {
    switch (type.toLowerCase()) {
      case "bronce":
        return "shadow-orange-600/20";
      case "plata":
        return "shadow-gray-400/20";
      case "oro":
        return "shadow-yellow-400/30";
      default:
        return "shadow-primary/20";
    }
  };

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
    <dialog ref={dialogRef} className="modal flex items-center justify-center">
      <div className="modal-box p-5 bg-card border border-border shadow-2xl w-full max-w-md mx-auto animate-in fade-in-0 zoom-in-95 duration-300">
        {/* Header con icono y botón de cerrar */}
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <div
              className={`p-2 rounded-full bg-primary/20 ${getGlowColor(
                achievementType
              )}`}
            >
              <Trophy className="w-5 h-5 text-primary" />
            </div>
            <h3 className="font-bold text-lg text-foreground">¡Nuevo Logro!</h3>
          </div>
          <button
            className="btn btn-sm btn-circle btn-ghost hover:bg-accent hover:text-accent-foreground transition-colors"
            onClick={() => {
              setVisible(false);
              if (onClose) {
                onClose();
              }
            }}
          >
            <X className="w-4 h-4 text-white" />
          </button>
        </div>

        {/* Contenido principal */}
        <div className="text-center space-y-4 px-2">
          {/* Icono del logro con animación */}
          <div className="relative flex justify-center">
            <div
              className={`absolute inset-0 rounded-full ${getBorderColor(
                achievementType
              )} opacity-20 animate-pulse`}
            ></div>
            <img
              src="https://cdn-icons-png.flaticon.com/512/1875/1875506.png"
              alt="Achievement"
              className={`w-20 h-20 object-contain border-4 rounded-full ${getBorderColor(
                achievementType
              )} ${getGlowColor(achievementType)} shadow-lg relative z-10`}
            />
            {/* Estrellas decorativas */}
            <Star className="w-4 h-4 text-primary absolute -top-1 -right-1 animate-pulse" />
            <Star className="w-3 h-3 text-accent absolute -bottom-1 -left-1 animate-pulse delay-75" />
          </div>

          {/* Información del logro */}
          <div className="space-y-2">
            <h4 className="text-xl font-bold text-foreground">
              Transacciones - Nivel{" "}
              {achievementType === "Bronce"
                ? 1
                : achievementType === "Plata"
                ? 2
                : 3}
            </h4>
            <p className="text-muted-foreground">{achievementDesc}</p>

            {/* Badge del tipo de logro */}
            <div className="flex justify-center">
              <span
                className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-sm font-semibold ${getBadgeColor(
                  achievementType
                )} shadow-sm`}
              >
                <Trophy className="w-3 h-3" />
                {achievementType}
              </span>
            </div>
          </div>
        </div>

        {/* Footer con indicador de tiempo */}
        <div className="mt-6 pt-4 border-t border-border">
          <div className="flex items-center justify-center gap-2 text-xs text-muted-foreground">
            <div className="w-2 h-2 bg-primary rounded-full animate-pulse"></div>
            <span>Se cerrará automáticamente en 5 segundos</span>
          </div>
        </div>
      </div>
    </dialog>
  );
};

export default AchievementNotification;
