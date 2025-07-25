import React, { useEffect, useState } from "react";

const Achievement = ({ achievement }) => {
  const { title, description, completed, type } = achievement;
  const [loading, setLoading] = useState(true);

  const checkIfCompleted = async () => {
    const token = localStorage.getItem("token");
    fetch(
      "https://two024-qwerty-back-final-marcello.onrender.com/api/users/userTransaction",
      {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      }
    )
      .then((response) => response.json())
      .then((data) => {
        if (data >= achievement.goal) {
          achievement.completed = true;
        }
      })
      .then(() => setLoading(false));
  };

  useEffect(() => {
    checkIfCompleted();
  }, []);

  // Función para determinar el color del borde según el tipo
  const getBorderColor = (type) => {
    switch (type.toLowerCase()) {
      case "bronce":
        return "border-orange-700";
      case "plata":
        return "border-gray-400";
      case "oro":
        return "border-yellow-300";
      default:
        return "border-blue-500";
    }
  };

  const getBadgeColor = (type) => {
    switch (type.toLowerCase()) {
      case "bronce":
        return "bg-orange-700 text-white";
      case "plata":
        return "bg-gray-400 text-gray-800";
      case "oro":
        return "bg-yellow-300 text-yellow-900";
      default:
        return "bg-blue-500 text-blue-100";
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center w-full h-full bg-[#001d3d]">
        <div className="text-lg text-gray-600">Loading...</div>
      </div>
    );
  } else {
    return (
      <div className="w-full max-w-sm mx-auto p-2 sm:p-4 bg-[#001d3d] rounded-lg shadow-lg hover:shadow-xl transition-shadow">
        <figure className="px-2 pt-2 sm:px-4 sm:pt-4">
          <img
            src={achievement.img}
            alt={`Achievement: ${title}`}
            className={`w-20 h-20 sm:w-24 sm:h-24 object-contain mx-auto border-4 rounded-full ${getBorderColor(
              type
            )} max-w-full`}
          />
        </figure>
        <div className="text-center px-2 py-2 sm:px-4">
          <h2 className="text-base sm:text-xl font-bold text-white mb-2">
            {title} - Nivel{" "}
            {achievement.type === "Bronce"
              ? 1
              : achievement.type === "Plata"
              ? 2
              : achievement.type === "Oro"
              ? 3
              : 4}
          </h2>
          <p className="text-xs sm:text-sm text-gray-400">{description}</p>

          <div className="mt-3">
            <span
              className={`inline-block px-2 py-1 sm:px-3 rounded-full text-xs font-semibold ${
                completed
                  ? "bg-green-500 text-green-100"
                  : "bg-orange-400 text-orange-100"
              }`}
            >
              {completed ? "Obtenido" : "No Obtenido"}
            </span>
          </div>

          <div className="mt-2 sm:mt-3">
            <span
              className={`inline-block px-2 py-1 sm:px-3 rounded-full text-xs font-bold ${getBadgeColor(
                type
              )}`}
            >
              {type}
            </span>
          </div>
        </div>
      </div>
    );
  }
};

export default Achievement;
