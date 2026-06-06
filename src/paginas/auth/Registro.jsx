import { useState } from "react";
import { useNavigate } from "react-router-dom";
import Toast from "../../componentes/ui/Toast";
import "./Registro.css";

import logo from "../../assets/logo.webp";

function Registro() {
  const navigate = useNavigate();

  const [email, setEmail] = useState("");
  const [pass, setPass] = useState("");
  const [repetirPass, setRepetirPass] = useState("");
  const [mostrarPass, setMostrarPass] = useState(false);

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

  const registrarUsuario = () => {
    if (!email || !pass || !repetirPass) {
      mostrarToast("Completa todos los campos", "error");
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

    mostrarToast("Registro listo para Firebase", "success");

    setTimeout(() => {
      navigate("/login");
    }, 1200);
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
                <div className={`registro-pass-rule ${pass.length >= 6 ? "ok" : "fail"}`}>
                  <span className="dot"></span>
                  Mínimo 6 caracteres
                </div>

                <div className={`registro-pass-rule ${/[A-Z]/.test(pass) ? "ok" : "fail"}`}>
                  <span className="dot"></span>
                  Una letra mayúscula
                </div>

                <div className={`registro-pass-rule ${/[0-9]/.test(pass) ? "ok" : "fail"}`}>
                  <span className="dot"></span>
                  Un número
                </div>
              </div>
            </>
          )}

          <button className="registro-btn-main" onClick={registrarUsuario}>
            REGISTRARSE
          </button>

          <button className="registro-btn-sec" onClick={() => navigate("/login")}>
            YA TENGO CUENTA
          </button>
        </div>
      </div>

      <Toast mensaje={toast.mensaje} tipo={toast.tipo} />
    </section>
  );
}

export default Registro;