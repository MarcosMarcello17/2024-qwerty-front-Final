import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom'; 
import TransaccionesTable from './TransaccionesTable';
import ModalForm from './ModalForm';
import './styles/HomePage.css';
import logo from "../assets/logo-removebg-preview.png";



function HomePage() {
    const [transacciones, setTransacciones] = useState([]);
    const [motivo, setMotivo] = useState("");
    const [showNoTransactions, setShowNoTransactions] = useState(false);
    const [valor, setValor] = useState("");    
    const [fecha, setFecha] = useState("");    
    const [error, setError] = useState(null);
    const [edit, setEdit] = useState(false);
    const [tipoGasto, setTipoGasto] = useState("");
    const [categoria, setCategoria] = useState("");
    const [payOptions, setPayOptions] = useState([
        { value: "credito", label: "Tarjeta de credito" },
        { value: "debito", label: "Tarjeta de debito" },
        { value: "efectivo", label: "Efectivo" }
    ]);
    const [payCategories, setPayCategories] = useState([
        {value: "Impuestos y Servicios", label: "Impuestos y Servicios", iconPath: "fa-solid fa-file-invoice-dollar"},
        {value: "Entretenimiento y Ocio", label: "Entretenimiento y Ocio", iconPath: "fa-solid fa-ticket"},
        {value: "Hogar y Mercado", label: "Hogar y Mercado", iconPath: "fa-solid fa-house"},
        {value: "Antojos", label: "Antojos", iconPath: "fa-solid fa-candy-cane"},
        {value: "Electrodomesticos", label: "Electrodomesticos", iconPath: "fa-solid fa-blender"},
      ]);
    const [selectedPayMethod, setSelectedPayMethod] = useState(null);
    const [selectedCategory, setSelectedCategory] = useState(null);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [transaccionId, setTransaccionId] = useState(null);
    const [modalError, setModalError] = useState("");
    const navigate = useNavigate();
    const [categoriaSeleccionada, setCategoriaSeleccionada] = useState('Todas');
    const [categoriasConTodas, setCategoriasConTodas] = useState([]);

    useEffect(() => {
        getTransacciones();
        fetchPersonalTipoGastos();
        fetchPersonalCategorias();
    }, []);
    useEffect(() => {
        if (payCategories.length > 0) {
            setCategoriasConTodas([{ value: "Todas", label: "Todas" }, {value: "Otros", label: "Otros"}, ...payCategories]);
        }
    }, [payCategories]);

    const getTransacciones = async(filtrado = "Todas") => {
        const token = localStorage.getItem("token");
        let url = "";
        if (filtrado === "Todas") {
            url = "http://localhost:8080/api/transacciones/user";
        } else {
            url = `http://localhost:8080/api/transacciones/user/filter?categoria=${filtrado}`;
        }
        try {
            const response = await fetch(url, {
                method: "GET",
                headers: {
                    "Authorization": `Bearer ${token}`,
                },
            });
    
            if (!response.ok) {
                throw new Error(`Error: ${response.status}`);
            }
    
            const data = await response.json();
            setTransacciones(data);
        } catch (err) {
            console.error("Error fetching transactions:", err);
        }
    };

    const fetchPersonalTipoGastos = async () => {
        const token = localStorage.getItem("token");
        try {
            const response = await fetch("http://localhost:8080/api/personal-tipo-gasto", {
                headers: {
                    "Authorization": `Bearer ${token}`
                }
            });
            
            if (response.ok) {
                const data = await response.json();
                const customOptions = data.map(tipo => ({ label: tipo.nombre, value: tipo.nombre }));
                setPayOptions([...payOptions, ...customOptions]);
            }
        } catch (error) {
            console.error("Error al obtener los tipos de gasto personalizados:", error);
        }
    };
    const fetchPersonalCategorias = async () => {
        const token = localStorage.getItem("token");
        try {
            const response = await fetch("http://localhost:8080/api/personal-categoria", {
                headers: {
                    "Authorization": `Bearer ${token}`
                }
            });
            
            if (response.ok) {
                const data = await response.json();
                const customOptions = data.map(cat => ({ label: cat.nombre, value: cat.nombre , iconPath: cat.iconPath}));
                setPayCategories([...payCategories, ...customOptions]);
            }
        } catch (error) {
            console.error("Error al obtener las categorías personalizadas:", error);
        }
    };

    const openModal = () => {
        setIsModalOpen(true)
    };
    const closeModal = () => {
        setIsModalOpen(false);
        clearForm();
        setEdit(false);
    };

    const clearForm = () => {
        setMotivo("");
        setValor("");
        setSelectedPayMethod(null);
        setFecha("");
        setSelectedCategory(null);
    };

    const editRow = (row) => {
        setEdit(true);
        setMotivo(row.motivo);
        setValor(row.valor);
        const selectedOption = payOptions.find(option => option.value === row.tipoGasto);
        setSelectedPayMethod(selectedOption || null);
        const selectedPayCategory = payCategories.find(option => option.value == row.categoria);
        setSelectedCategory(selectedPayCategory || null);
        setFecha(row.fecha);
        setTransaccionId(row.id);
        openModal();
    };

    const agregarTransaccion = async (e, categoria) => {
        e.preventDefault();
        const token = localStorage.getItem("token");

        const url = edit 
        ? `http://localhost:8080/api/transacciones/${transaccionId}` 
        : "http://localhost:8080/api/transacciones";
        
        const method = edit ? "PUT" : "POST";

        try {
            if(valor <= 0){
                setModalError("El valor debe ser mayor a 0");
                return;
            }else if(selectedPayMethod == null){
                setModalError("Elegir un medio de pago");
                return;
            }
            const response = await fetch(url, {
                method: method,
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${token}`
                },
                body: JSON.stringify({ motivo, valor, tipoGasto, fecha, categoria})
            });

            if (response.ok) {
                const data = await response.json();
                if (edit) {
                    const updatedTransacciones = transacciones.map(t =>
                        t.id === data.id ? data : t
                    );
                    setTransacciones(updatedTransacciones);
                } else {
                    const updatedTransacciones = [...transacciones, data];
                    updatedTransacciones.sort((a, b) => new Date(b.fecha) - new Date(a.fecha));
                    setTransacciones(updatedTransacciones);
                }
                setModalError("");
                closeModal();
            } else {
                setModalError("Error al agregar o actualizar la transacción");
            }
        } catch (err) {
            setModalError("Ocurrió un error. Intenta nuevamente.");
        }
    };

    const deleteRow = async (id) => {
        const token = localStorage.getItem("token");
        try {
            const response = await fetch(`http://localhost:8080/api/transacciones/${id}`, {
                method: "DELETE",
                headers: {
                    "Authorization": `Bearer ${token}`
                }
            });
            
            if (response.ok) {
                setTransacciones(transacciones.filter(t => t.id !== id));
            } else {
                setError("Error al eliminar la transacción");
            }
        } catch (err) {
            setError("Ocurrió un error. Intenta nuevamente.");
        }
    };

    const handlePayChange = (value) => {
        setTipoGasto(value ? value.value : "");
        setSelectedPayMethod(value);
    };

    const handleMotivoChange = (e) => {
        setMotivo(e.target.value);
    };
    const handleCategoryChange  = (value) => {
        setCategoria(value ? value.value : "");
        setSelectedCategory(value);
    };

    const handleCreateTP = async (inputValue) => {
        const token = localStorage.getItem("token");

        try {
            const response = await fetch("http://localhost:8080/api/personal-tipo-gasto", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${token}`
                },
                body: JSON.stringify(inputValue)
            });
            
            if (response.ok) {
                const newTipoGasto = await response.json();
                const newOption = { label: newTipoGasto.nombre, value: newTipoGasto.nombre };
                setPayOptions(prevOptions => [...prevOptions, newOption]);
                setSelectedPayMethod(newOption);
                setTipoGasto(newTipoGasto.nombre);
            }
        } catch (error) {
            console.error("Error al agregar el tipo de gasto personalizado:", error);
        }
    };
    const handleCreateCat = async (nombre, icono) => {
        const token = localStorage.getItem("token");
        if (!nombre || !icono) {
            console.error("Nombre y icono son obligatorios");
            return;
        }
        try {
            const inputValue = {
                nombre: nombre,
                iconPath: icono 
            };
            const response = await fetch("http://localhost:8080/api/personal-categoria", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${token}`
                },
                body: JSON.stringify(inputValue)
            });
            if (response.ok) {
                const newCategoria = await response.json();
                const newOption = { label: newCategoria.nombre, value: newCategoria.nombre, iconPath: newCategoria.iconPath};
                setPayCategories(prevOptions => [...prevOptions, newOption]);
                console.log(payCategories);
                setSelectedCategory(newOption);
                setCategoria(newCategoria.nombre);
            } else {
                const errorMessage = await response.text();
                console.error("Error al agregar categoria:", errorMessage);
            }
        } catch (error) {
            console.error("Error al agregar categoria personalizada:", error);
        }
    };
    const handleChange = (event) => {
        let cat = event.target.value
        setCategoriaSeleccionada(cat);
        getTransacciones(cat)
      };
    
    return (
        <div className="container min-h-screen min-w-full max-w-full bg-black">
            <div className="bg-black flex items-center justify-center w-full p-4">
            <div className="grid grid-cols-3 grid-rows-2 gap-0 w-full">
                <div></div>
                <div className="flex justify-center items-center"> {/* Ajustar tamaño del logo */}
                    <div className="w-16 h-16 md:w-36 md:h-36 rounded-full overflow-hidden border-4 border-yellow-600"> {/* Cambié de w-24 a w-16 para pantallas pequeñas */}
                        <img 
                            src={logo} 
                            alt="logo" 
                            className="w-full h-full object-cover"
                        />
                    </div>
                </div>
                <div className="flex justify-end items-center px-4 md:px-20"> {/* Ajustar padding */}
                    <button 
                        className="w-auto bg-yellow-500 bg-opacity-80 text-gray-950 text-sm py-2 px-4 rounded-lg hover:bg-yellow-700"
                        onClick={() => navigate('/profile')}
                    >
                        Mi Cuenta
                    </button>
                </div>
                <div className="flex justify-start items-center px-6">
                    <h2 className="text-2xl py-2 font-bold text-gray-100">Historial de Transacciones</h2>
                </div>
                <div className="flex justify-center items-center py-4">
                    <button 
                        className="bg-yellow-500 bg-opacity-80 text-gray-900 py-2 px-4 rounded-lg hover:bg-red-700 w-full md:w-auto"
                        onClick={openModal}
                    >
                        Agregar Transacción
                    </button>
                </div>
                <div className="flex justify-end items-center px-4 md:px-6"> {/* Ajustamos el padding en pantallas pequeñas */}
                    <div className="flex flex-col">
                        <label htmlFor="categorias" className="mb-2 text-lg font-medium text-gray-200">
                            Filtrar por categoría:
                        </label>
                        <select
                            id="categorias"
                            value={categoriaSeleccionada}
                            onChange={handleChange}
                            className="block w-full md:w-64 px-4 py-2 text-gray-700 bg-white border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        >
                            {categoriasConTodas.map(cat => (
                                <option key={cat.value} value={cat.value}>{cat.label}</option>
                            ))}
                        </select>
                    </div>
                </div>
            </div>
        </div>
            <TransaccionesTable
                transacciones={transacciones}
                payCategories={payCategories}
                editRow={editRow}
                deleteRow={deleteRow}
                onTableEmpty={() => setShowNoTransactions(true)}
                onTransactions={() => setShowNoTransactions(false)}
            />
            {showNoTransactions && (
                <div className='flex flex-col justify-center mb-0 items-center'>
                    {categoriaSeleccionada !== "Todas" && (
                        <p className="text-red-500 font-bold mb-4">Su filtro no coincide con ninguna transacción</p>
                    )}
                    <button 
                        className="bg-yellow-500 bg-opacity-80 text-gray-950 font-extrabold py-6 px-16 rounded-lg hover:bg-yellow-700"
                        onClick={openModal}
                    >
                        Ingrese una transacción
                    </button>
                </div>
            )}
            <ModalForm
                isModalOpen={isModalOpen}
                closeModal={closeModal}
                agregarTransaccion={agregarTransaccion}
                edit={edit}
                motivo={motivo}
                valor={valor}
                fecha={fecha}
                handleMotivoChange={handleMotivoChange}
                setValor={setValor}
                handlePayChange={handlePayChange}
                selectedPayMethod={selectedPayMethod}
                selectedCategory={selectedCategory}
                payCategories={payCategories}
                handleCategoryChange={handleCategoryChange}
                payOptions={payOptions}
                handleCreateTP={handleCreateTP}
                handleCreateCat={handleCreateCat}
                setFecha={setFecha}
                error={modalError}
            />
        </div>
    );
}

export default HomePage;
