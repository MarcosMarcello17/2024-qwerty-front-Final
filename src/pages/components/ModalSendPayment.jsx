import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Send } from "lucide-react";
import React, { useEffect, useState } from "react";
import CreatableSelect from "react-select/creatable";

function ModalSendPayment({ closeModal = () => {}, payCategories }) {
  const defaultMediosDePago = [
    {
      value: "Tarjeta de credito",
      label: "Tarjeta de credito",
      textColor: "mr-2 text-yellow-500",
    },
    {
      value: "Tarjeta de Debito",
      label: "Tarjeta de debito",
      textColor: "mr-2 text-yellow-500",
    },
    { value: "Efectivo", label: "Efectivo", textColor: "mr-2 text-yellow-500" },
  ];
  const [payOption, setPayOption] = useState("");
  const [motivo, setMotivo] = useState("");
  const [categoria, setCategoria] = useState("");
  const [payOptions, setPayOptions] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [emailReceptor, setEmailReceptor] = useState("");
  const [valor, setValor] = useState(0);
  const [fecha, setFecha] = useState(new Date().toISOString().split("T")[0]);
  const [modalError, setModalError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const fetchPersonalTipoGastos = async () => {
    const token = localStorage.getItem("token");
    try {
      const response = await fetch(
        "https://two024-qwerty-back-final-marcello.onrender.com/api/personal-tipo-gasto",
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      if (response.ok) {
        const data = await response.json();
        const customOptions = data.map((tipo) => ({
          label: tipo.nombre,
          value: tipo.nombre,
          textColor: "mr-2 text-white",
        }));
        setPayOptions([...defaultMediosDePago, ...customOptions]);
      }
    } catch (error) {
      console.error(
        "Error al obtener los tipos de gasto personalizados:",
        error
      );
    }
  };

  useEffect(() => {
    fetchPersonalTipoGastos();
  }, []);

  const validateForm = () => {
    if (!emailReceptor || !motivo || !valor || !categoria || !fecha) {
      setModalError("Todos los campos son obligatorios.");
      return false;
    }
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(emailReceptor)) {
      setModalError("Ingrese un email válido.");
      return false;
    }
    if (valor <= 0) {
      setModalError("El valor debe ser mayor que 0.");
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
    setIsLoading(true);
    e.preventDefault();
    const token = localStorage.getItem("token");
    const transaccion = {
      valor: valor,
      motivo: motivo,
      fecha: fecha,
      categoria: categoria,
      tipoGasto: payOption,
    };
    if (await userExists(emailReceptor)) {
      if (validateForm()) {
        const response = await fetch(
          "https://two024-qwerty-back-final-marcello.onrender.com/api/transacciones/enviarPago/" +
            emailReceptor,
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
      setModalError("El mail no pertenece a un usuario de este sitio");
      setIsLoading(false);
    }
  };

  const handleCategoryChange = (e) => {
    const selectedValue = e.target.value;
    setCategoria(selectedValue);
    setSelectedCategory(
      payCategories.find((cat) => cat.value === selectedValue)
    );
  };

  const cleanForm = () => {
    setEmailReceptor("");
    setMotivo("");
    setValor(0);
    setPayOption("");
    setCategoria("");
    setIsLoading(false);
    setFecha(new Date().toISOString().split("T")[0]);
    setModalError("");
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
          <label className="text-gray-100 mt-1">Medio de Pago:</label>
          <select
            value={payOption}
            onChange={(e) => setPayOption(e.target.value)}
            className="my-1 block w-full p-2 bg-background text-white rounded-md shadow-sm focus:ring-yellow-500 focus:border-yellow-500"
            required
          >
            <option value="" disabled>
              Selecciona un Medio De Pago
            </option>
            {payOptions.map((cat) => (
              <option key={cat.value} value={cat.value}>
                {cat.label}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label>Categoría:</label>
          <select
            value={categoria}
            onChange={handleCategoryChange}
            className="my-1 block w-full p-2 bg-background text-white rounded-md shadow-sm focus:ring-yellow-500 focus:border-yellow-500"
            required
          >
            <option value="">Selecciona una categoría</option>
            {payCategories.map((cat) => (
              <option key={cat.value} value={cat.value}>
                {cat.label}
              </option>
            ))}
          </select>
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

export default ModalSendPayment;
