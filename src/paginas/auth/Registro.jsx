import { useState } from "react";
import { useNavigate } from "react-router-dom";
import Toast from "../../componentes/ui/Toast";
import "./Registro.css";
import { API_URL } from "../../servicios/apiConfig";
import logo from "../../assets/logo.webp";

function Registro() {
  const navigate = useNavigate();

  const [nombre, setNombre] = useState("");
  const [email, setEmail] = useState("");
  const [pass, setPass] = useState("");
  const [repetirPass, setRepetirPass] = useState("");
  const [mostrarPass, setMostrarPass] = useState(false);
  const [enviando, setEnviando] = useState(false);

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

  const validarCorreo = (correo) => {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(correo);
  };

  const cambiarNombre = (e) => {
    const valor = e.target.value;

    if (!/[0-9]/.test(valor)) {
      setNombre(valor);
    }
  };

  const registrarUsuario = async () => {
    if (!nombre || !email || !pass || !repetirPass) {
      mostrarToast("Completa todos los campos", "error");
      return;
    }

    if (nombre.trim().length < 3) {
      mostrarToast("El nombre debe tener mínimo 3 caracteres", "error");
      return;
    }

    if (/[0-9]/.test(nombre)) {
      mostrarToast("El nombre no puede tener números", "error");
      return;
    }

    if (!validarCorreo(email)) {
      mostrarToast("Ingresa un correo válido", "error");
      return;
    }

    if (pass.length < 6) {
      mostrarToast("Mínimo 6 caracteres", "error");
      return;
    }

    if (!/[A-Z]/.test(pass)) {
      mostrarToast("Agrega una mayúscula", "error");
      return;
    }

    if (!/[0-9]/.test(pass)) {
      mostrarToast("Agrega un número", "error");
      return;
    }

    if (pass !== repetirPass) {
      mostrarToast("Las contraseñas no coinciden", "error");
      return;
    }

    try {
      setEnviando(true);

      mostrarToast("Enviando código al correo...", "success");

      const respuesta = await fetch(
  `${API_URL}/enviarCodigo2FA.php`,
  {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            email: email.toLowerCase(),
            nombre: nombre.trim(),
          }),
        }
      );

      const data = await respuesta.json();

      if (!data.ok) {
        mostrarToast(data.mensaje || "No se pudo enviar el código", "error");
        return;
      }

      sessionStorage.setItem(
        "registroTemporal",
        JSON.stringify({
          nombre: nombre.trim(),
          correo: email.toLowerCase(),
          password: pass,
          foto: "",
          tipo: "correo",
        })
      );

      sessionStorage.setItem("flujo2FA", "registro");

      mostrarToast("Código enviado al correo", "success");

      setTimeout(() => {
        navigate("/verificacion-2fa");
      }, 1000);
    } catch (error) {
      console.error("Error registro:", error);
      mostrarToast("Error al conectar con PHP", "error");
    } finally {
      setEnviando(false);
    }
  };

  const calcularFuerza = () => {
    let score = 0;

    if (pass.length >= 6) score++;
    if (/[A-Z]/.test(pass)) score++;
    if (/[0-9]/.test(pass)) score++;

    return score;
  };

  const score = calcularFuerza();

  return (
    <section className="registro-hero">
      <div className="registro-pattern"></div>

      <div className="registro-contenido">
        <img src={logo} className="registro-logo" alt="Logo Insignis" />

        <div className="registro-box">
          <input
            type="text"
            placeholder="Nombre completo"
            value={nombre}
            onChange={cambiarNombre}
          />

          <input
            type="email"
            placeholder="Correo"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />

          <div className="registro-password-box">
            <input
              type={mostrarPass ? "text" : "password"}
              placeholder="Contraseña"
              value={pass}
              onChange={(e) => setPass(e.target.value)}
            />

            <button type="button" onClick={() => setMostrarPass(!mostrarPass)}>
              👁
            </button>
          </div>

          <div className="registro-password-box">
            <input
              type={mostrarPass ? "text" : "password"}
              placeholder="Repetir contraseña"
              value={repetirPass}
              onChange={(e) => setRepetirPass(e.target.value)}
            />

            <button type="button" onClick={() => setMostrarPass(!mostrarPass)}>
              👁
            </button>
          </div>

          {pass.length > 0 && (
            <>
              <div className="registro-pass-strength">
                <div
                  className={`registro-pass-strength-bar score-${score}`}
                  style={{ width: `${(score / 3) * 100}%` }}
                ></div>
              </div>

              <div className="registro-pass-rules visible">
                <div
                  className={`registro-pass-rule ${
                    pass.length >= 6 ? "ok" : "fail"
                  }`}
                >
                  <span className="dot"></span>
                  Mínimo 6 caracteres
                </div>

                <div
                  className={`registro-pass-rule ${
                    /[A-Z]/.test(pass) ? "ok" : "fail"
                  }`}
                >
                  <span className="dot"></span>
                  Una letra mayúscula
                </div>

                <div
                  className={`registro-pass-rule ${
                    /[0-9]/.test(pass) ? "ok" : "fail"
                  }`}
                >
                  <span className="dot"></span>
                  Un número
                </div>
              </div>
            </>
          )}

          <button
            className="registro-btn-main"
            onClick={registrarUsuario}
            disabled={enviando}
          >
            {enviando ? "ENVIANDO CÓDIGO..." : "REGISTRARSE"}
          </button>

          <button
            className="registro-btn-sec"
            onClick={() => navigate("/login")}
            disabled={enviando}
          >
            YA TENGO CUENTA
          </button>
        </div>
      </div>

      <Toast mensaje={toast.mensaje} tipo={toast.tipo} />
    </section>
  );
}

export default Registro;