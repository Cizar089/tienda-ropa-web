import { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  signInWithEmailAndPassword,
  signInWithPopup,
} from "firebase/auth";

import { auth, googleProvider } from "../../servicios/firebase";
import Toast from "../../componentes/ui/Toast";
import "./Login.css";

import logo from "../../assets/logo.webp";
import google from "../../assets/google.webp";
import whatsapp from "../../assets/whatsapp.webp";
import tiktok from "../../assets/tiktok.png";
import facebook from "../../assets/facebook.webp";

function Login() {
  const navigate = useNavigate();

  const [mostrarLogin, setMostrarLogin] = useState(false);
  const [usuario, setUsuario] = useState(null);

  const [email, setEmail] = useState("");
  const [pass, setPass] = useState("");
  const [mostrarPass, setMostrarPass] = useState(false);

  const [toast, setToast] = useState({
    mensaje: "",
    tipo: "success",
  });

  const abrirLogin = () => {
    setMostrarLogin(true);
  };

  const mostrarToast = (mensaje, tipo = "success") => {
    setToast({ mensaje, tipo });

    setTimeout(() => {
      setToast({ mensaje: "", tipo: "success" });
    }, 3000);
  };

  const loginEmail = async () => {
    if (!email || !pass) {
      mostrarToast("Completa los campos", "error");
      return;
    }

    try {
      const resultado = await signInWithEmailAndPassword(auth, email, pass);

      setUsuario({
        nombre: resultado.user.displayName || resultado.user.email,
        correo: resultado.user.email,
        foto: logo,
        tipo: "correo",
      });

      mostrarToast("Inicio de sesión correcto", "success");
    } catch (error) {
      mostrarToast("Correo o contraseña incorrectos", "error");
    }
  };

  const loginGoogle = async () => {
    try {
      const resultado = await signInWithPopup(auth, googleProvider);

      setUsuario({
        nombre: resultado.user.displayName || resultado.user.email,
        correo: resultado.user.email,
        foto: resultado.user.photoURL || logo,
        tipo: "google",
      });

      mostrarToast("Inicio con Google correcto", "success");
    } catch (error) {
      mostrarToast("No se pudo iniciar con Google", "error");
    }
  };

  const entrarInvitado = () => {
    localStorage.setItem("guest", "true");
    mostrarToast("Entrando como invitado", "success");

    setTimeout(() => {
      navigate("/catalogo");
    }, 1000);
  };

  const entrarSistema = async () => {
  if (!usuario) return;

  try {
    mostrarToast("Enviando código al correo...", "success");

    const respuesta = await fetch(
  "http://localhost:8080/insignis-store/backend/api/enviarCodigo2FA.php",
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
      mostrarToast(data.mensaje || "No se pudo enviar el código", "error");
      return;
    }

    localStorage.setItem("usuarioTemporal", JSON.stringify(usuario));

    mostrarToast("Código enviado al correo", "success");

    setTimeout(() => {
      navigate("/verificacion-2fa");
    }, 1000);
  } catch (error) {
    mostrarToast("Error al conectar con PHP", "error");
  }
};

  const cerrarUsuario = () => {
    setUsuario(null);
    setEmail("");
    setPass("");
    setMostrarLogin(false);
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
    <section className="login-hero">
      <div className="login-pattern"></div>

      <div className="login-contenido">
        <img src={logo} className="login-logo fade-in" alt="Logo Insignis" />

        {usuario ? (
          <div className="usuario-box">
            <img
  src={usuario.foto || logo}
  className={`usuario-foto ${
    usuario.foto === logo || !usuario.foto ? "foto-logo" : ""
  }`}
  alt=""
  onError={(e) => {
    e.currentTarget.src = logo;
    e.currentTarget.classList.add("foto-logo");
  }}
/>

            <h3>{usuario.nombre}</h3>
            <p>{usuario.correo}</p>

            <button className="btn-main" onClick={entrarSistema}>
              ENTRAR
            </button>

            <button className="btn-sec" onClick={cerrarUsuario}>
              CAMBIAR CUENTA
            </button>
          </div>
        ) : (
          <>
            {!mostrarLogin ? (
              <button className="btn-login fade-in fade-delay" onClick={abrirLogin}>
                INICIAR SESIÓN
              </button>
            ) : (
              <button className="btn-login fade-in fade-delay" onClick={entrarInvitado}>
                ENTRAR COMO INVITADO
              </button>
            )}

            <div className={`login-box ${mostrarLogin ? "show" : ""}`}>
              <input
                type="email"
                placeholder="Correo"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />

              <div className="password-box">
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

              {pass.length > 0 && (
                <>
                  <div className="pass-strength">
                    <div
                      className={`pass-strength-bar score-${score}`}
                      style={{ width: `${(score / 3) * 100}%` }}
                    ></div>
                  </div>

                  <div className="pass-rules visible">
                    <div className={`pass-rule ${pass.length >= 6 ? "ok" : "fail"}`}>
                      <span className="dot"></span>
                      Mínimo 6 caracteres
                    </div>

                    <div className={`pass-rule ${/[A-Z]/.test(pass) ? "ok" : "fail"}`}>
                      <span className="dot"></span>
                      Una letra mayúscula
                    </div>

                    <div className={`pass-rule ${/[0-9]/.test(pass) ? "ok" : "fail"}`}>
                      <span className="dot"></span>
                      Un número
                    </div>
                  </div>
                </>
              )}

              <button className="btn-main" onClick={loginEmail}>
                INICIAR SESIÓN
              </button>

              <button className="btn-sec" onClick={() => navigate("/registro")}>
                REGISTRARSE
              </button>

              <div className="divider">o</div>

              <button className="btn-google" onClick={loginGoogle}>
                <img src={google} alt="Google" />
                Google
              </button>
            </div>
          </>
        )}
      </div>

      <div className="redes">
        <a href="https://wa.me/59169166277" target="_blank" rel="noreferrer">
          <img src={whatsapp} alt="WhatsApp" />
        </a>

        <a href="https://www.tiktok.com/@insignis.bo" target="_blank" rel="noreferrer">
          <img src={tiktok} alt="TikTok" />
        </a>

        <a
          href="https://www.facebook.com/share/1E4x8ksJto/"
          target="_blank"
          rel="noreferrer"
        >
          <img src={facebook} alt="Facebook" />
        </a>
      </div>

      <Toast mensaje={toast.mensaje} tipo={toast.tipo} />
    </section>
  );
}

export default Login;