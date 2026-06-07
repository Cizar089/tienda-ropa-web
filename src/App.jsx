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

import "./App.css";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Ruta principal */}
        <Route path="/" element={<Navigate to="/login" />} />

        {/* Autenticación */}
        <Route path="/login" element={<Login />} />
        <Route path="/registro" element={<Registro />} />
        <Route path="/verificacion-2fa" element={<Verificacion2FA />} />

        {/* Cliente */}
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

        {/* Ruta incorrecta */}
        <Route path="*" element={<Navigate to="/login" />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;