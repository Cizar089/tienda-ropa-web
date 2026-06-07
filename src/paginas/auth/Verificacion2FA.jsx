import { useState } from "react";
import { API_URL } from "../../servicios/apiConfig";
import { useNavigate } from "react-router-dom";
import {
  createUserWithEmailAndPassword,
  updateProfile,
} from "firebase/auth";

import { auth } from "../../servicios/firebase";
import { crearClienteSiNoExiste } from "../../servicios/clientesService";

import Toast from "../../componentes/ui/Toast";
import "./Login.css";

import logo from "../../assets/logo.webp";

function Verificacion2FA() {
  const navigate = useNavigate();

  const [codigo, setCodigo] = useState("");
  const [verificando, setVerificando] = useState(false);

  const [toast, setToast] = useState({
    mensaje: "",
    tipo: "success",
  });

  const mostrarToast = (mensaje, tipo = "success") => {
    setToast({ mensaje, tipo });

    setTimeout(() => {
      setToast({ mensaje: "", tipo: "success" });
    }, 3000);
  };

  const obtenerDatosFlujo = () => {
    const flujo = sessionStorage.getItem("flujo2FA");

    if (flujo === "registro") {
      const registroTemporal = JSON.parse(
        sessionStorage.getItem("registroTemporal")
      );

      return {
        flujo: "registro",
        usuario: registroTemporal,
      };
    }

    const usuarioTemporal = JSON.parse(localStorage.getItem("usuarioTemporal"));

    return {
      flujo: "login",
      usuario: usuarioTemporal,
    };
  };

  const verificarCodigo = async () => {
    if (!codigo) {
      mostrarToast("Ingresa el código de verificación", "error");
      return;
    }

    if (codigo.length < 4) {
      mostrarToast("El código está incompleto", "error");
      return;
    }

    const { flujo, usuario } = obtenerDatosFlujo();

    if (!usuario) {
      mostrarToast("No se encontraron datos del usuario", "error");

      setTimeout(() => {
        navigate("/login");
      }, 1000);

      return;
    }

    try {
      setVerificando(true);

      const respuesta = await fetch(
  `${API_URL}/verificarCodigo2FA.php`,
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

      if (flujo === "registro") {
        await registrarCuentaFirebase(usuario);
        return;
      }

      finalizarLogin(usuario);
    } catch (error) {
      console.error("Error al verificar código:", error);
      mostrarToast("Error al verificar el código", "error");
    } finally {
      setVerificando(false);
    }
  };

  const registrarCuentaFirebase = async (usuario) => {
    try {
      const resultado = await createUserWithEmailAndPassword(
        auth,
        usuario.correo,
        usuario.password
      );

      await updateProfile(resultado.user, {
        displayName: usuario.nombre,
      });

      const cliente = {
        nombre: usuario.nombre,
        correo: usuario.correo,
        foto: logo,
        tipo: "correo",
      };

      await crearClienteSiNoExiste(cliente);

      localStorage.removeItem("guest");
      localStorage.removeItem("usuarioTemporal");
      localStorage.setItem("usuarioCliente", JSON.stringify(cliente));

      sessionStorage.removeItem("registroTemporal");
      sessionStorage.removeItem("flujo2FA");

      mostrarToast("Registro completado correctamente", "success");

      setTimeout(() => {
        navigate("/inicio");
      }, 1000);
    } catch (error) {
      console.error("Error al crear cuenta:", error);

      if (error.code === "auth/email-already-in-use") {
        mostrarToast("Este correo ya está registrado", "error");

        setTimeout(() => {
          navigate("/login");
        }, 1200);

        return;
      }

      mostrarToast("No se pudo crear la cuenta", "error");
    }
  };

  const finalizarLogin = (usuario) => {
    localStorage.removeItem("guest");
    localStorage.removeItem("usuarioTemporal");
    localStorage.setItem("usuarioCliente", JSON.stringify(usuario));

    sessionStorage.removeItem("flujo2FA");

    mostrarToast("Verificación correcta", "success");

    setTimeout(() => {
      navigate("/inicio");
    }, 1000);
  };

  const reenviarCodigo = async () => {
    const { usuario } = obtenerDatosFlujo();

    if (!usuario) {
      mostrarToast("No se encontraron datos del usuario", "error");
      return;
    }

    try {
      mostrarToast("Reenviando código...", "success");

      const respuesta = await fetch(
  `${API_URL}/enviarCodigo2FA.php`,
  {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            email: usuario.correo,
            nombre: usuario.nombre,
          }),
        }
      );

      const data = await respuesta.json();

      if (!data.ok) {
        mostrarToast(data.mensaje || "No se pudo reenviar el código", "error");
        return;
      }

      mostrarToast("Código reenviado al correo", "success");
    } catch (error) {
      console.error("Error al reenviar código:", error);
      mostrarToast("Error al conectar con PHP", "error");
    }
  };

  return (
    <section className="login-hero">
      <div className="login-pattern"></div>

      <div className="login-contenido">
        <img src={logo} className="login-logo fade-in" alt="Logo Insignis" />

        <div className="usuario-box">
          <img src={logo} className="usuario-foto foto-logo" alt="Insignis" />

          <h3>Verificación 2FA</h3>

          <p>Ingresa el código enviado a tu correo.</p>

          <div className="login-box show">
            <input
              type="text"
              placeholder="Código de verificación"
              value={codigo}
              onChange={(e) => setCodigo(e.target.value.replace(/\D/g, ""))}
              maxLength={6}
            />

            <button
              className="btn-main"
              onClick={verificarCodigo}
              disabled={verificando}
            >
              {verificando ? "VERIFICANDO..." : "VERIFICAR"}
            </button>

            <button className="btn-sec" onClick={reenviarCodigo}>
              REENVIAR CÓDIGO
            </button>

            <button className="btn-sec" onClick={() => navigate("/login")}>
              VOLVER AL LOGIN
            </button>
          </div>
        </div>
      </div>

      <Toast mensaje={toast.mensaje} tipo={toast.tipo} />
    </section>
  );
}

export default Verificacion2FA;