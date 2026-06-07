import { Link } from "react-router-dom";
import { useEffect, useState } from "react";
import "./Cliente.css";

import logo from "../../assets/logo.webp";
import FooterCliente from "../../componentes/cliente/FooterCliente";
import { obtenerAnunciosActivos } from "../../servicios/anunciosService";

function Inicio() {
  const [bannerActual, setBannerActual] = useState(0);
  const [anuncios, setAnuncios] = useState([]);
  const [cargandoAnuncios, setCargandoAnuncios] = useState(true);

  useEffect(() => {
    const cargarAnuncios = async () => {
      try {
        const datos = await obtenerAnunciosActivos();
        setAnuncios(datos);
      } catch (error) {
        console.error("Error al cargar anuncios:", error);
        setAnuncios([]);
      } finally {
        setCargandoAnuncios(false);
      }
    };

    cargarAnuncios();
  }, []);

  useEffect(() => {
    if (anuncios.length <= 1) return;

    const intervalo = setInterval(() => {
      setBannerActual((actual) =>
        actual === anuncios.length - 1 ? 0 : actual + 1
      );
    }, 3500);

    return () => clearInterval(intervalo);
  }, [anuncios.length]);

  const cambiarBanner = (index) => {
    setBannerActual(index);
  };

  const obtenerRutaAnuncio = (anuncio) => {
    if (anuncio.ruta) return anuncio.ruta;

    return "/catalogo";
  };

  const obtenerTextoBoton = (anuncio) => {
    if (anuncio.boton) return anuncio.boton;

    return "Ver catálogo";
  };

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

        <section className="hero-cliente">
          <img src={logo} className="hero-logo" alt="Insignis" />

          <h1 className="titulo-principal">INSIGNIS STORE</h1>

          <p className="subtitulo">
            Ropa urbana con estilo propio. Explora prendas, nuevos drops,
            promociones y realiza tus pedidos por WhatsApp.
          </p>
        </section>

        {cargandoAnuncios ? (
          <div className="catalogo-mensaje">
            <h2>Cargando anuncios...</h2>
          </div>
        ) : anuncios.length > 0 ? (
          <section className="banner-slider">
            <div className="banner-track">
              {anuncios.map((anuncio, index) => (
                <div
                  className={`banner-item ${
                    index === bannerActual ? "banner-activo" : ""
                  }`}
                  key={anuncio.id}
                >
                  <div className="banner-info">
                    <span className="banner-label">ANUNCIO INSIGNIS</span>

                    <h2>{anuncio.titulo}</h2>

                    <p>{anuncio.descripcion}</p>

                    <Link to={obtenerRutaAnuncio(anuncio)}>
                      <button className="btn-cliente">
                        {obtenerTextoBoton(anuncio)}
                      </button>
                    </Link>
                  </div>

                  <div className="banner-logo-box">
                    <img src={logo} alt="Insignis" />
                  </div>
                </div>
              ))}
            </div>

            {anuncios.length > 1 && (
              <div className="banner-puntos">
                {anuncios.map((anuncio, index) => (
                  <button
                    key={anuncio.id}
                    className={index === bannerActual ? "punto activo" : "punto"}
                    onClick={() => cambiarBanner(index)}
                  ></button>
                ))}
              </div>
            )}
          </section>
        ) : (
          <div className="catalogo-mensaje">
            <h2>No hay anuncios activos</h2>
            <p>Cuando la tienda publique nuevos anuncios, aparecerán aquí.</p>
          </div>
        )}

        <div className="grid-cards">
          <div className="card">
            <h3>Nuevos drops</h3>
            <p>
              Mira las nuevas colecciones de Insignis y las prendas más recientes.
            </p>

            <Link to="/catalogo">
              <button className="btn-cliente">Ver catálogo</button>
            </Link>
          </div>

          <div className="card">
            <h3>Promociones</h3>
            <p>
              Encuentra prendas con descuentos y ofertas disponibles para clientes.
            </p>

            <Link to="/catalogo">
              <button className="btn-cliente">Comprar ahora</button>
            </Link>
          </div>

          <div className="card">
            <h3>Mis pedidos</h3>
            <p>
              Revisa el estado de tus compras: solicitado, confirmado, en camino
              o en destino.
            </p>

            <Link to="/mis-pedidos">
              <button className="btn-cliente">Ver pedidos</button>
            </Link>
          </div>
        </div>
      </div>

      <FooterCliente />
    </div>
  );
}

export default Inicio;