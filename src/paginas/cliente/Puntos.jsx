import { Link, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import "./Cliente.css";

import logo from "../../assets/logo.webp";
import FooterCliente from "../../componentes/cliente/FooterCliente";
import { auth } from "../../servicios/firebase";
import { obtenerClientePorCorreo } from "../../servicios/clientesService";
import { obtenerHistorialPuntosPorCorreo } from "../../servicios/puntosService";
import { obtenerCanjesPorCorreo } from "../../servicios/canjesService";

function Puntos() {
  const navigate = useNavigate();

  const [cliente, setCliente] = useState(null);
  const [historial, setHistorial] = useState([]);
  const [canjes, setCanjes] = useState([]);
  const [correoCliente, setCorreoCliente] = useState("invitado");
  const [cargando, setCargando] = useState(true);

  const obtenerCorreoCliente = () => {
    const esInvitado = localStorage.getItem("guest") === "true";

    if (esInvitado) {
      return "invitado";
    }

    const usuarioCliente = JSON.parse(localStorage.getItem("usuarioCliente"));

    if (usuarioCliente && usuarioCliente.correo) {
      return usuarioCliente.correo.toLowerCase();
    }

    const usuarioTemporal = JSON.parse(localStorage.getItem("usuarioTemporal"));

    if (usuarioTemporal && usuarioTemporal.correo) {
      return usuarioTemporal.correo.toLowerCase();
    }

    const usuarioActual = auth.currentUser;

    if (usuarioActual && usuarioActual.email) {
      return usuarioActual.email.toLowerCase();
    }

    return "invitado";
  };

  useEffect(() => {
    const cargarDatos = async () => {
      try {
        const correo = obtenerCorreoCliente();
        setCorreoCliente(correo);

        if (correo === "invitado") {
          setCliente(null);
          setHistorial([]);
          setCanjes([]);
          setCargando(false);
          return;
        }

        const clienteFirestore = await obtenerClientePorCorreo(correo);
        const historialFirestore = await obtenerHistorialPuntosPorCorreo(correo);
        const canjesFirestore = await obtenerCanjesPorCorreo(correo);

        setCliente(clienteFirestore);
        setHistorial(historialFirestore);
        setCanjes(canjesFirestore);
      } catch (error) {
        console.error("Error al cargar puntos:", error);
      } finally {
        setCargando(false);
      }
    };

    cargarDatos();
  }, []);

  const formatearFecha = (fecha) => {
    if (!fecha) return "Sin fecha";

    if (fecha.seconds) {
      const fechaJS = new Date(fecha.seconds * 1000);
      return fechaJS.toLocaleDateString("es-BO");
    }

    return "Sin fecha";
  };

  const puntos = {
    disponibles: Number(cliente?.puntosDisponibles || 0),
    acumulados: Number(cliente?.puntosAcumulados || 0),
    usados: Number(cliente?.puntosUsados || 0),
  };

  const esAumento = (tipo = "") => {
    const tipoLower = tipo.toLowerCase();

    return (
      tipoLower === "ganado" ||
      tipoLower === "aumento" ||
      tipoLower === "sumado"
    );
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

        <h1 className="titulo-principal">Mis puntos</h1>

        <p className="subtitulo">
          Acumula puntos por compras confirmadas y úsalos para canjear
          descuentos, premios o prendas seleccionadas de Insignis Store.
        </p>

        {cargando ? (
          <div className="catalogo-mensaje">
            <h2>Cargando tus puntos...</h2>
          </div>
        ) : correoCliente === "invitado" ? (
          <div className="acceso-restringido">
            <img src={logo} alt="Insignis" />

            <h2>Inicia sesión para acceder a tus puntos</h2>

            <p>
              Tus puntos, canjes e historial están conectados a tu cuenta.
              Inicia sesión para revisar tus beneficios.
            </p>

            <button className="btn-cliente" onClick={() => navigate("/login")}>
              Iniciar sesión
            </button>
          </div>
        ) : (
          <>
            <section className="puntos-resumen">
              <div className="puntos-card destacado">
                <span>Puntos disponibles</span>
                <strong>{puntos.disponibles}</strong>
              </div>

              <div className="puntos-card">
                <span>Puntos acumulados</span>
                <strong>{puntos.acumulados}</strong>
              </div>

              <div className="puntos-card">
                <span>Puntos usados</span>
                <strong>{puntos.usados}</strong>
              </div>
            </section>

            <section className="puntos-cta">
              <div>
                <h2>Canjea tus puntos</h2>
                <p>
                  Revisa los premios disponibles y usa tus puntos para obtener
                  descuentos o prendas especiales.
                </p>
              </div>

              <Link to="/premios">
                <button className="btn-cliente">Ver premios</button>
              </Link>
            </section>

            <h2 className="subtitulo-seccion">Historial de puntos</h2>

            {historial.length === 0 ? (
              <div className="catalogo-mensaje">
                <h2>No tienes movimientos de puntos</h2>
                <p>
                  Cuando ganes o uses puntos, aparecerán registrados en esta
                  sección.
                </p>
              </div>
            ) : (
              <div className="tabla-scroll">
                <table className="tabla-cliente">
                  <thead>
                    <tr>
                      <th>Fecha</th>
                      <th>Descripción</th>
                      <th>Movimiento</th>
                      <th>Puntos</th>
                    </tr>
                  </thead>

                  <tbody>
                    {historial.map((item) => {
                      const aumento = esAumento(item.tipo);

                      return (
                        <tr key={item.id}>
                          <td>{formatearFecha(item.fecha)}</td>

                          <td>{item.descripcion || "Movimiento de puntos"}</td>

                          <td>
                            <span
                              className={
                                aumento
                                  ? "estado estado-ganado"
                                  : "estado estado-usado"
                              }
                            >
                              {aumento ? "Aumento" : "Descuento"}
                            </span>
                          </td>

                          <td>
                            <span
                              className={
                                aumento
                                  ? "puntos-movimiento puntos-ganado"
                                  : "puntos-movimiento puntos-usado"
                              }
                            >
                              {aumento ? "+" : "-"}
                              {Number(item.puntos || 0)}
                            </span>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}

            <h2 className="subtitulo-seccion">Historial de canjes</h2>

            {canjes.length === 0 ? (
              <div className="catalogo-mensaje">
                <h2>No tienes canjes realizados</h2>
                <p>
                  Cuando canjees un premio, aparecerá registrado en esta sección.
                </p>
              </div>
            ) : (
              <div className="tabla-scroll">
                <table className="tabla-cliente">
                  <thead>
                    <tr>
                      <th>Fecha</th>
                      <th>Premio</th>
                      <th>Puntos usados</th>
                      <th>Estado</th>
                    </tr>
                  </thead>

                  <tbody>
                    {canjes.map((canje) => (
                      <tr key={canje.id}>
                        <td>{formatearFecha(canje.fechaCanje)}</td>

                        <td>{canje.nombrePremio || "Premio canjeado"}</td>

                        <td>
                          <span className="puntos-movimiento puntos-usado">
                            -{Number(canje.puntosUsados || 0)}
                          </span>
                        </td>

                        <td>
                          <span className="estado">
                            {canje.estado || "Solicitado"}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </>
        )}

        <FooterCliente />
      </div>
    </div>
  );
}

export default Puntos;