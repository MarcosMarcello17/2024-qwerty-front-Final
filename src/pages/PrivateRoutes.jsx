import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';

const PrivateRoutes = () => {
    const token = localStorage.getItem('token'); // Verifica si el token existe

    // Si no hay token, redirige al login
    if (!token) {
        return <Navigate to="/" />;
    }

    // Si hay token, renderiza el componente hijo (la página protegida)
    return <Outlet />;
};

export default PrivateRoutes;