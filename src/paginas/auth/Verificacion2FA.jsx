import { useState } from "react";
import { useNavigate } from "react-router-dom";
import Toast from "../../componentes/ui/Toast";
import "./Verificacion2FA.css";

import logo from "../../assets/logo.webp";

function Verificacion2FA() {
  const navigate = useNavigate();

  const [codigo, setCodigo] = useState("");

  const [toast, setToast] = useState({
    mensaje: "",
    tipo: "success",
  });

  const usuario = JSON.parse(localStorage.getItem("usuarioTemporal"));

  const mostrarToast = (mensaje, tipo = "success") => {
    setToast({ mensaje, tipo });

    setTimeout(() => {
      setToast({ mensaje: "", tipo: "success" });
    }, 3000);
  };

  const verificarCodigo = async () => {
    if (!usuario) {
      mostrarToast("No hay usuario temporal", "error");
      setTimeout(() => {
        navigate("/login");
      }, 1000);
      return;
    }

    if (!codigo) {
      mostrarToast("Ingresa el código", "error");
      return;
    }

    try {
      const respuesta = await fetch(
  "http://localhost:8080/insignis-store/backend/api/verificarCodigo2FA.php",
  {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      email: usuario.correo,
      codigo: codigo,
    }),
  }
);

      const data = await respuesta.json();

      if (!data.ok) {
        mostrarToast(data.mensaje || "Código incorrecto", "error");
        return;
      }

      mostrarToast("Verificación correcta", "success");

      localStorage.setItem("usuarioLogueado", JSON.stringify(usuario));
      localStorage.removeItem("usuarioTemporal");

      setTimeout(() => {
        if (usuario.correo === "tcjhon078@gmail.com") {
          navigate("/admin");
        } else {
          navigate("/catalogo");
        }
      }, 1000);
    } catch (error) {
      mostrarToast("Error al conectar con PHP", "error");
    }
  };

  return (
    <section className="verificacion-hero">
      <div className="verificacion-pattern"></div>

      <div className="verificacion-contenido">
        <img src={logo} className="verificacion-logo" alt="Logo Insignis" />

        <h2>VERIFICACIÓN 2FA</h2>

        <p className="verificacion-texto">
          Revisa tu correo e ingresa el código de seguridad.
        </p>

        <div className="verificacion-box">
          <input
            type="text"
            placeholder="Código"
            maxLength="6"
            value={codigo}
            onChange={(e) => setCodigo(e.target.value)}
          />

          <button className="verificacion-btn-main" onClick={verificarCodigo}>
            VERIFICAR
          </button>

          <button className="verificacion-btn-sec" onClick={() => navigate("/login")}>
            VOLVER
          </button>
        </div>
      </div>

      <Toast mensaje={toast.mensaje} tipo={toast.tipo} />
    </section>
  );
}

export default Verificacion2FA;