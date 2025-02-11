import React, { useState } from "react";
import logo from "../../assets/logo-removebg-preview.png";
import ModalVerCategorias from "./ModalVerCategorias";
import { useNavigate } from "react-router-dom";
import ModalGastosCompartidos from "./ModalGastosCompartidos";

function Header({
  payCategories,
  setPayCategories,
  fetchPersonalCategorias,
  getTransacciones,
  openModal = () => {},
}) {
  const [isModalCategoriaOpen, setIsModalCategoriaOpen] = useState(false);
  const [isModalGastosOpen, setIsModalGastosOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const navigate = useNavigate();

  const openModalCategoria = () => setIsModalCategoriaOpen(true);
  const closeModalCategoria = () => setIsModalCategoriaOpen(false);
  const openModalGastos = () => setIsModalGastosOpen(true);
  const closeModalGastos = () => setIsModalGastosOpen(false);
  const toggleMobileMenu = () => setIsMobileMenuOpen(!isMobileMenuOpen);



  return (
    <nav className="bg-[#000814] text-white px-2 py-2 md:px-8 shadow-md">
      <div className="container mx-auto flex justify-between items-center relative">
        {/* Logo */}
        <div
          className="flex items-center cursor-pointer"
          onClick={() => navigate("/")}
        >
          <img
            src={logo}
            alt="logo"
            className="w-12 h-12 md:w-16 md:h-16 lg:w-20 lg:h-20 rounded-full border-4 border-[#ffc300] shadow-md"
          />
        </div>

        {/* Desktop Menu */}
        <div className="hidden md:flex space-x-4">
          <button
            className="px-4 py-2 bg-[#ffd60a] text-gray-900 rounded-lg hover:bg-[#ffc300] transition duration-300 ease-in-out"
            onClick={() => navigate("/profile")}
          >
            Mi Cuenta
          </button>
          <button
            className="px-4 py-2 bg-[#ffd60a] text-gray-900 rounded-lg hover:bg-[#ffc300] transition duration-300 ease-in-out"
            onClick={openModalCategoria}
          >
            Categorías
          </button>
          {/* Grouped menu for the last 5 buttons */}
          <details className="group relative z-50">
            <summary className="px-4 py-2 bg-[#ffd60a] text-gray-900 rounded-lg hover:bg-[#ffc300] transition duration-300 ease-in-out cursor-pointer list-none">
              Más Opciones
            </summary>
            <ul className="absolute left-0 mt-2 w-48 bg-gray-800 text-white rounded-lg shadow-lg p-2 space-y-2 z-50">
              <li>
                <button
                  className="w-full px-4 py-2 bg-[#ffd60a] text-gray-900 rounded-lg hover:bg-[#ffc300] transition duration-300 ease-in-out"
                  onClick={() => openModal()}
                >
                  Agregar Transacción
                </button>
              </li>
              <li>
                <button
                  className="w-full px-4 py-2 bg-[#ffd60a] text-gray-900 rounded-lg hover:bg-[#ffc300] transition duration-300 ease-in-out"
                  onClick={() =>
                    document.getElementById("sendPayModal").showModal()
                  }
                >
                  Realizar Pago
                </button>
              </li>
              <li>
                <button
                  className="w-full px-4 py-2 bg-[#ffd60a] text-gray-900 rounded-lg hover:bg-[#ffc300] transition duration-300 ease-in-out"
                  onClick={() =>
                    document.getElementById("generatePayModal").showModal()
                  }
                >
                  Generar Cobro
                </button>
              </li>
              <li>
                <button
                  className="w-full px-4 py-2 bg-[#ffd60a] text-gray-900 rounded-lg hover:bg-[#ffc300] transition duration-300 ease-in-out"
                  onClick={() => navigate("/presupuestos")}
                >
                  Presupuesto
                </button>
              </li>
              <li>
                <button
                  className="w-full px-4 py-2 bg-[#ffd60a] text-gray-900 rounded-lg hover:bg-[#ffc300] transition duration-300 ease-in-out"
                  onClick={openModalGastos}
                >
                  Gastos Compartidos
                </button>
              </li>
            </ul>
          </details>
        </div>

        {/* Mobile Menu Toggle */}
        <div className="md:hidden">
          <button
            onClick={toggleMobileMenu}
            className="block cursor-pointer text-[#ffd60a] text-3xl"
          >
            {isMobileMenuOpen ? "X" : "☰"}
          </button>
          {isMobileMenuOpen && (
            <div className="absolute right-0 top-14 w-64 bg-gray-800 text-white shadow-lg rounded-md z-50">
              <ul className="flex flex-col p-4 space-y-3">
                <li>
                  <button
                    className="w-full px-4 py-2 bg-[#ffd60a] text-gray-900 rounded-lg hover:bg-[#ffc300] transition duration-300 ease-in-out"
                    onClick={() => {
                      navigate("/profile");
                      setIsMobileMenuOpen(false);
                    }}
                  >
                    Mi Cuenta
                  </button>
                </li>
                <li>
                  <button
                    className="w-full px-4 py-2 bg-[#ffd60a] text-gray-900 rounded-lg hover:bg-[#ffc300] transition duration-300 ease-in-out"
                    onClick={() => {
                      openModalCategoria();
                      setIsMobileMenuOpen(false);
                    }}
                  >
                    Categorías
                  </button>
                </li>
                <li>
                  <button
                    className="w-full px-4 py-2 bg-[#ffd60a] text-gray-900 rounded-lg hover:bg-[#ffc300] transition duration-300 ease-in-out"
                    onClick={() => {
                      openModal();
                      setIsMobileMenuOpen(false);
                    }}
                  >
                    Agregar Transacción
                  </button>
                </li>
                <li>
                  <button
                    className="w-full px-4 py-2 bg-[#ffd60a] text-gray-900 rounded-lg hover:bg-[#ffc300] transition duration-300 ease-in-out"
                    onClick={() => {
                      document.getElementById("sendPayModal").showModal();
                      setIsMobileMenuOpen(false);
                    }}
                  >
                    Realizar Pago
                  </button>
                </li>
                <li>
                  <button
                    className="w-full px-4 py-2 bg-[#ffd60a] text-gray-900 rounded-lg hover:bg-[#ffc300] transition duration-300 ease-in-out"
                    onClick={() => {
                      document.getElementById("generatePayModal").showModal();
                      setIsMobileMenuOpen(false);
                    }}
                  >
                    Generar Cobro
                  </button>
                </li>
                <li>
                  <button
                    className="w-full px-4 py-2 bg-[#ffd60a] text-gray-900 rounded-lg hover:bg-[#ffc300] transition duration-300 ease-in-out"
                    onClick={() => {
                      navigate("/presupuestos");
                      setIsMobileMenuOpen(false);
                    }}
                  >
                    Presupuesto
                  </button>
                </li>
                <li>
                  <button
                    className="w-full px-4 py-2 bg-[#ffd60a] text-gray-900 rounded-lg hover:bg-[#ffc300] transition duration-300 ease-in-out"
                    onClick={() => {
                      openModalGastos();
                      setIsMobileMenuOpen(false);
                    }}
                  >
                    Gastos Compartidos
                  </button>
                </li>
              </ul>
            </div>
          )}
        </div>
      </div>

      <ModalVerCategorias
        isModalCategoriaOpen={isModalCategoriaOpen}
        closeModalCategoria={closeModalCategoria}
        fetchPersonalCategorias={fetchPersonalCategorias}
        setPayCategories={setPayCategories}
        payCategories={payCategories}
        getTransacciones={getTransacciones}
      />
      <ModalGastosCompartidos
        isModalGastosOpen={isModalGastosOpen}
        closeModalGastos={closeModalGastos}
        payCategories={payCategories}
        getTransacciones={getTransacciones}
      />
    </nav>
  );
}

export default Header;
