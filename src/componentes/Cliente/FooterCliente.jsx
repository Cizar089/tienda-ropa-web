import { Link } from "react-router-dom";
import logo from "../../assets/logo.webp";
import whatsapp from "../../assets/whatsapp.webp";
import tiktok from "../../assets/tiktok.png";
import facebook from "../../assets/facebook.webp";
import "./FooterCliente.css";

function FooterCliente() {
  return (
    <footer className="footer-insignis">
      <div className="footer-glow"></div>

      <div className="footer-contenido">
        <div className="footer-marca">
          <img src={logo} alt="Insignis" className="footer-logo" />

          <div>
            <h2>INSIGNIS STORE</h2>
            <p>
              Tienda web de ropa urbana. Catálogo, pedidos por WhatsApp,
              seguimiento de compras, promociones y sistema de puntos.
            </p>
          </div>
        </div>

        <div className="footer-links">
          <h3>Secciones</h3>

          <Link to="/inicio">Inicio</Link>
          <Link to="/catalogo">Catálogo</Link>
          <Link to="/carrito">Carrito</Link>
          <Link to="/mis-pedidos">Mis pedidos</Link>
          <Link to="/puntos">Mis puntos</Link>
          <Link to="/premios">Premios</Link>
          <Link to="/sobre-insignis">Sobre Insignis</Link>
        </div>

        <div className="footer-redes-box">
          <h3>Redes sociales</h3>

          <div className="footer-redes">
            <a href="https://wa.me/59169166277" target="_blank" rel="noreferrer">
              <img src={whatsapp} alt="WhatsApp" />
            </a>

            <a
              href="https://www.tiktok.com/@insignis.bo"
              target="_blank"
              rel="noreferrer"
            >
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

          <p className="footer-contacto">
            Atención personalizada y pedidos por WhatsApp
          </p>
        </div>
      </div>

      <div className="footer-copy">
        <p>© 2026 Insignis Store. Todos los derechos reservados.</p>
        <p>Desarrollado por The Papitos.</p>
      </div>
    </footer>
  );
}

export default FooterCliente;