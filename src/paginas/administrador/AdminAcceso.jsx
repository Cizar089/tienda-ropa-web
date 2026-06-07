import { useState } from "react";
import { useNavigate } from "react-router-dom";
import "./AdminAcceso.css";

export default function AdminAcceso() {
  const [codigo, setCodigo] = useState("");
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const validar = (e) => {
    e.preventDefault();

    if (codigo === "0717") {
      localStorage.setItem("adminAccess", "true");
      navigate("/admin/panel");
    } else {
      setError("Código incorrecto");
    }
  };

  return (
    <div className="acceso-admin">
      <form className="acceso-card" onSubmit={validar}>
        <h1>INSIGNIS</h1>
        <p>Acceso administrador</p>

        <input
          type="password"
          maxLength="4"
          placeholder="0000"
          value={codigo}
          onChange={(e) => setCodigo(e.target.value)}
        />

        {error && <span>{error}</span>}

        <button>ENTRAR</button>
      </form>
    </div>
  );
}