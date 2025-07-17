import React from "react";
import { useNavigate } from "react-router-dom";
import Achievement from "./components/Achievement";
import AppLayout from "./AppLayout";

const AchievementsPage = () => {
  const navigate = useNavigate();

  const achievements = [
    {
      id: 1,
      title: "Transacciones",
      description: "Crear 1 transaccion",
      img: "https://cdn-icons-png.flaticon.com/512/1875/1875506.png",
      type: "Bronce",
      completed: false,
      goal: 1,
    },
    {
      id: 2,
      title: "Transacciones",
      description: "Crear 5 transacciones",
      img: "https://cdn-icons-png.flaticon.com/512/1875/1875506.png",
      type: "Plata",
      completed: false,
      goal: 5,
    },
    {
      id: 3,
      title: "Transacciones",
      description: "Crear 10 transacciones",
      img: "https://cdn-icons-png.flaticon.com/512/1875/1875506.png",
      type: "Oro",
      completed: false,
      goal: 10,
    },
  ];

  return (
    <AppLayout>
      <div className="min-h-screen flex flex-col bg-background text-white ">
        {/* Botón de regreso */}
        <div className="mb-4">
          <button
            onClick={() => navigate("/profile")}
            className="w-full sm:w-auto px-4 py-2 bg-[#ffd60a] text-black rounded-md hover:bg-[#ffc300] transition"
          >
            Volver al Perfil
          </button>
        </div>

        <h1 className="text-2xl sm:text-3xl font-bold text-center text-white mb-6 sm:mb-8">
          Mis Logros
        </h1>

        <div className="flex-1 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 lg:gap-6">
          {achievements.map((achievement) => (
            <Achievement key={achievement.id} achievement={achievement} />
          ))}
        </div>
      </div>
    </AppLayout>
  );
};

export default AchievementsPage;
