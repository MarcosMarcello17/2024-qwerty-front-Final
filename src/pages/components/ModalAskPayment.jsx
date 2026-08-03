import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Send } from "lucide-react";
import React, { useEffect, useState } from "react";

function ModalAskPayment({ closeModal = () => {} }) {
  const [motivo, setMotivo] = useState("");
  const [emailReceptor, setEmailReceptor] = useState("");
  const [valor, setValor] = useState(0);
  const [fecha, setFecha] = useState(new Date().toISOString().split("T")[0]);
  const [modalError, setModalError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const validateForm = () => {
    if (!emailReceptor || !motivo || !valor || !fecha) {
      setModalError("Todos los campos son obligatorios.");
      setIsLoading(false);
      return false;
    }
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(emailReceptor)) {
      setModalError("Ingrese un email válido.");
      setIsLoading(false);
      return false;
    }
    if (valor <= 0) {
      setModalError("El valor debe ser mayor que 0.");
      setIsLoading(false);
      return false;
    }
    setModalError("");
    return true;
  };
  const userExists = async (mail) => {
    let url =
      "https://two024-qwerty-back-final-marcello.onrender.com/api/public/exists/" +
      mail;
    const response = await fetch(url);
    if (response.ok) {
      const exists = await response.json();
      return exists;
    } else {
      console.error("Error al verificar el usuario");
      return false;
    }
  };

  const handleSubmit = async (e) => {
    setModalError("");
    setIsLoading(true);
    e.preventDefault();
    const token = localStorage.getItem("token");
    const transaccion = {
      valor: valor,
      email: emailReceptor,
      motivo: motivo,
      id_reserva: "Cobro",
      fecha: fecha,
    };
    if (await userExists(emailReceptor)) {
      if (validateForm()) {
        const response = await fetch(
          "https://two024-qwerty-back-final-marcello.onrender.com/api/transaccionesPendientes/askPayUser",
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${token}`,
            },
            body: JSON.stringify(transaccion),
          }
        );
        if (response.ok) {
          console.log("Pago enviado");
        }
        cleanForm();
        closeModal();
      } else {
        setIsLoading(false);
      }
    } else {
      setIsLoading(false);
      setModalError("El mail no pertenece a un usuario de este sitio");
    }
  };

  const cleanForm = () => {
    setEmailReceptor("");
    setMotivo("");
    setValor(0);
    setIsLoading(false);
    setFecha(new Date().toISOString().split("T")[0]);
  };

  return (
    <div className="modal-box">
      <form onSubmit={handleSubmit}>
        <div>
          <span>E-Mail:</span>
          <Input
            type="text"
            value={emailReceptor}
            placeholder="persona@email.com"
            onChange={(e) => setEmailReceptor(e.target.value)}
            className="my-1 block w-full p-2 bg-background text-white rounded-md shadow-sm focus:ring-yellow-500 focus:border-yellow-500"
            required
          />
        </div>
        <div>
          <label className="text-gray-100 mt-6">Motivo:</label>
          <Input
            type="text"
            value={motivo}
            placeholder="motivo"
            onChange={(e) => setMotivo(e.target.value)}
            className="my-1 block w-full p-2 bg-background text-white rounded-md shadow-sm focus:ring-yellow-500 focus:border-yellow-500"
            required
          />
        </div>
        <div>
          <label className="text-gray-100 mt-6">Valor:</label>
          <Input
            type="number"
            value={valor}
            onChange={(e) => setValor(e.target.value)}
            className="my-1 block w-full p-2 bg-background text-white rounded-md shadow-sm focus:ring-yellow-500 focus:border-yellow-500"
            required
          />
        </div>
        <div>
          <label>Fecha:</label>
          <input
            type="date"
            value={fecha}
            onChange={(e) => setFecha(e.target.value)}
            className="my-1 block w-full p-1 px-2 bg-background text-white rounded-md shadow-sm focus:ring-yellow-500 focus:border-yellow-500"
            required
          />
        </div>
        {modalError && (
          <div className="text-red-500 text-sm text-center">{modalError}</div>
        )}
        <div className="flex flex-col md:flex-row justify-end mt-4 space-y-2 md:space-y-0 md:space-x-2">
          <Button
            type="submit"
            className="w-full bg-primary hover:bg-primary/90 text-primary-foreground"
          >
            <Send className="mr-2 h-4 w-4" />{" "}
            {isLoading ? (
              <div>
                <span className="loading loading-spinner loading-sm text-white"></span>
                <div className="text-white p-0 m-0">Cargando...</div>
              </div>
            ) : (
              "Enviar"
            )}
          </Button>
          <Button
            type="button"
            className="w-full bg-red-500 hover:bg-red-600 text-white"
            onClick={() => {
              cleanForm();
              closeModal();
            }}
          >
            Cerrar
          </Button>
        </div>
      </form>
    </div>
  );
}

export default ModalAskPayment;
