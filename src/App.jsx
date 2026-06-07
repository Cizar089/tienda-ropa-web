import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";

import Login from "./paginas/auth/Login";
import Registro from "./paginas/auth/Registro";
import Verificacion2FA from "./paginas/auth/Verificacion2FA";

import Inicio from "./paginas/cliente/Inicio";
import Catalogo from "./paginas/cliente/Catalogo";
import DetalleProducto from "./paginas/cliente/DetalleProducto";
import Carrito from "./paginas/cliente/Carrito";
import Pedido from "./paginas/cliente/Pedido";
import MisPedidos from "./paginas/cliente/MisPedidos";
import DetallePedido from "./paginas/cliente/DetallePedido";
import SobreInsignis from "./paginas/cliente/SobreInsignis";
import Puntos from "./paginas/cliente/Puntos";
import Premios from "./paginas/cliente/Premios";

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

        <Route path="/inicio" element={<Inicio />} />
        <Route path="/catalogo" element={<Catalogo />} />
        <Route path="/detalle-producto/:id" element={<DetalleProducto />} />
        <Route path="/carrito" element={<Carrito />} />
        <Route path="/pedido" element={<Pedido />} />
        <Route path="/mis-pedidos" element={<MisPedidos />} />
        <Route path="/detalle-pedido/:id" element={<DetallePedido />} />
        <Route path="/puntos" element={<Puntos />} />
        <Route path="/premios" element={<Premios />} />
        <Route path="/sobre-insignis" element={<SobreInsignis />} />

        <Route path="/admin" element={<Navigate to="/admin/acceso" />} />
        <Route path="/admin/acceso" element={<AdminAcceso />} />
        <Route path="/admin/panel" element={<AdminDashboard />} />
        <Route path="/admin/productos" element={<AdminProductos />} />
        <Route path="/admin/pedidos" element={<AdminPedidos />} />
        <Route path="/admin/clientes" element={<AdminClientes />} />
        <Route path="/admin/premios" element={<AdminPremios />} />
        <Route path="/admin/anuncios" element={<AdminAnuncios />} />
        <Route path="/admin/reportes" element={<AdminReportes />} />

        <Route path="*" element={<Navigate to="/login" />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;