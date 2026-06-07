import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";

import Login from "./paginas/auth/Login";
import Registro from "./paginas/auth/Registro";
import Verificacion2FA from "./paginas/auth/Verificacion2FA";

import AdminAcceso from "./paginas/administrador/AdminAcceso";
import AdminDashboard from "./paginas/administrador/AdminDashboard";
import AdminProductos from "./paginas/administrador/AdminProductos";
import AdminPedidos from "./paginas/administrador/AdminPedidos";
import AdminClientes from "./paginas/administrador/AdminClientes";
import AdminPremios from "./paginas/administrador/AdminPremios";
import AdminAnuncios from "./paginas/administrador/AdminAnuncios";
import AdminReportes from "./paginas/administrador/AdminReportes";

import "./App.css";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Navigate to="/login" />} />

        <Route path="/login" element={<Login />} />
        <Route path="/registro" element={<Registro />} />
        <Route path="/verificacion-2fa" element={<Verificacion2FA />} />

        <Route path="/admin" element={<Navigate to="/admin/acceso" />} />
        <Route path="/admin/acceso" element={<AdminAcceso />} />
        <Route path="/admin/panel" element={<AdminDashboard />} />

        <Route path="/admin/productos" element={<AdminProductos />} />
        <Route path="/admin/pedidos" element={<AdminPedidos />} />
        <Route path="/admin/clientes" element={<AdminClientes />} />

        <Route path="/admin/clientes" element={<h1>Clientes</h1>} />
        <Route path="/admin/premios" element={<AdminPremios />} />
        <Route path="/admin/anuncios" element={<AdminAnuncios />} />
        <Route path="/admin/reportes" element={<AdminReportes />} />
        
      </Routes>
    </BrowserRouter>
  );
}

export default App;