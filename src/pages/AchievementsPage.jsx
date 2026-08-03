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
      <div className="min-h-screen flex flex-col bg-background text-white px-2 sm:px-0">
        <h1 className="text-xl sm:text-3xl font-bold text-center text-white mb-6 sm:mb-8">
          Mis Logros
        </h1>

        <div className="flex-1 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 lg:gap-6">
          {achievements.map((achievement) => (
            <div key={achievement.id} className="w-full max-w-xs mx-auto">
              <Achievement achievement={achievement} />
            </div>
          ))}
        </div>
      </div>
    </AppLayout>
  );
};

export default AchievementsPage;
