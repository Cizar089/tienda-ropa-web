import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import Login from "./paginas/auth/Login";
import Registro from "./paginas/auth/Registro";
import Verificacion2FA from "./paginas/auth/Verificacion2FA";
import "./App.css";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Navigate to="/login" />} />
        <Route path="/login" element={<Login />} />
        <Route path="/registro" element={<Registro />} />
        <Route path="/verificacion-2fa" element={<Verificacion2FA />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;