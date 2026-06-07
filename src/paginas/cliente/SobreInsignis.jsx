import { Link } from "react-router-dom";
import "./Cliente.css";

import logo from "../../assets/logo.webp";
import whatsapp from "../../assets/whatsapp.webp";
import tiktok from "../../assets/tiktok.png";
import facebook from "../../assets/facebook.webp";

import FooterCliente from "../../componentes/cliente/FooterCliente";

function SobreInsignis() {
  return (
    <div className="cliente-page">
      <div className="cliente-pattern"></div>

      <div className="cliente-contenido">
        <header className="cliente-header">
          <img src={logo} className="cliente-logo" alt="Insignis" />

          <nav className="cliente-nav">
  <Link to="/inicio">Inicio</Link>
  <Link to="/catalogo">Catálogo</Link>
  <Link to="/carrito">Carrito</Link>
  <Link to="/mis-pedidos">Mis pedidos</Link>
  <Link to="/puntos">Mis puntos</Link>
  <Link to="/premios">Premios</Link>
  <Link to="/sobre-insignis">Sobre Insignis</Link>
</nav>
        </header>

        <section className="sobre-hero">
          <div className="sobre-hero-info">
            <span className="pedido-label">CONOCE NUESTRA MARCA</span>

            <h1 className="titulo-principal">Sobre Insignis</h1>

            <p className="subtitulo">
              Insignis Store es una tienda de ropa urbana creada para ofrecer
              prendas modernas, cómodas y con identidad propia. Nuestra idea es
              que cada cliente pueda encontrar ropa con estilo, hacer pedidos de
              forma rápida y recibir atención personalizada por WhatsApp.
            </p>

            <div className="sobre-hero-botones">
              <Link to="/catalogo">
                <button className="btn-cliente">Ver catálogo</button>
              </Link>

              <Link to="/carrito">
                <button className="btn-secundario">Comprar ahora</button>
              </Link>
            </div>
          </div>

          <div className="sobre-hero-logo">
            <img src={logo} alt="Insignis" />
          </div>
        </section>

        <section className="sobre-info-grid">
          <div className="sobre-card-grande">
            <div className="card-img">
              <img src={logo} alt="Historia Insignis" />
            </div>

            <h2>Historia de Insignis</h2>

            <p>
              Insignis nace como una marca enfocada en ropa urbana, diseños
              limpios y prendas que puedan usarse en el día a día. La tienda
              busca mejorar la forma de vender ropa, dejando de depender solo de
              mensajes sueltos y ofreciendo una experiencia más ordenada desde
              la web.
            </p>
          </div>

          <div className="sobre-card-grande">
            <div className="card-img">
              <img src={logo} alt="Trabajo Insignis" />
            </div>

            <h2>Forma de trabajo</h2>

            <p>
              Trabajamos con catálogo digital, control de stock, pedidos por
              carrito, confirmación mediante WhatsApp y coordinación de pago por
              QR. Así el cliente puede revisar productos, confirmar su pedido y
              hacer seguimiento de su compra.
            </p>
          </div>
        </section>

        <section className="grid-cards">
          <div className="card">
            <div className="card-img">
              <img src={logo} alt="Materiales" />
            </div>

            <h3>Materiales</h3>

            <p>
              Usamos materiales cómodos y resistentes para poleras, canguros,
              sudaderas, pantalones, gorras y accesorios. La prioridad es que
              cada prenda tenga buena presentación y comodidad.
            </p>
          </div>

          <div className="card">
            <div className="card-img">
              <img src={logo} alt="Pedidos" />
            </div>

            <h3>Pedidos organizados</h3>

            <p>
              Cada pedido guarda información del cliente, productos, cantidades,
              total, departamento de envío y estado. Esto ayuda a evitar
              confusiones y mejorar la atención.
            </p>
          </div>

          <div className="card">
            <div className="card-img">
              <img src={logo} alt="Envíos" />
            </div>

            <h3>Envíos</h3>

            <p>
              Realizamos envíos a Cochabamba, La Paz, Santa Cruz, Oruro, Potosí,
              Chuquisaca, Tarija, Beni y Pando. El cliente selecciona su
              departamento al confirmar el pedido.
            </p>
          </div>

          <div className="card">
            <div className="card-img">
              <img src={logo} alt="Puntos" />
            </div>

            <h3>Puntos y beneficios</h3>

            <p>
              Los clientes podrán acumular puntos por compras confirmadas y
              canjearlos por descuentos, premios o prendas seleccionadas según
              las promociones disponibles.
            </p>
          </div>
        </section>

        <section className="sobre-redes-section">
          <div>
            <span className="pedido-label">REDES PERSONALIZADAS</span>
            <h2>Síguenos en nuestras redes</h2>

            <p>
              Mantente atento a nuestros nuevos drops, promociones, anuncios,
              horarios de atención y novedades de la tienda. También puedes
              escribirnos directamente para consultar productos o coordinar tu
              pedido.
            </p>
          </div>

          <div className="sobre-redes">
            <a href="https://wa.me/59169166277" target="_blank" rel="noreferrer">
              <img src={whatsapp} alt="WhatsApp" />
              <span>WhatsApp</span>
            </a>

            <a
              href="https://www.tiktok.com/@insignis.bo"
              target="_blank"
              rel="noreferrer"
            >
              <img src={tiktok} alt="TikTok" />
              <span>TikTok</span>
            </a>

            <a
              href="https://www.facebook.com/share/1E4x8ksJto/"
              target="_blank"
              rel="noreferrer"
            >
              <img src={facebook} alt="Facebook" />
              <span>Facebook</span>
            </a>
          </div>
        </section>

        <section className="sobre-cta">
          <div>
            <h2>¿Listo para elegir tu prenda?</h2>

            <p>
              Explora el catálogo de Insignis, agrega productos al carrito y
              confirma tu pedido por WhatsApp.
            </p>
          </div>

          <Link to="/catalogo">
            <button className="btn-cliente">Ir al catálogo</button>
          </Link>
        </section>

        <FooterCliente />
      </div>
    </div>
  );
}

export default SobreInsignis;