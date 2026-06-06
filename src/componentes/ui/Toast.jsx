import "./Toast.css";
import logo from "../../assets/logo.webp";

function Toast({ mensaje, tipo = "success" }) {
  if (!mensaje) return null;

  return (
    <div className={`toast ${tipo}`}>
      <img src={logo} alt="Insignis" />
      <div>
        <span>INSIGNIS</span>
        <p>{mensaje}</p>
      </div>
    </div>
  );
}

export default Toast;