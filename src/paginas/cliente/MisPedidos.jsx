import { Link, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import "./Cliente.css";

import logo from "../../assets/logo.webp";
import FooterCliente from "../../componentes/cliente/FooterCliente";
import { obtenerPedidosPorCorreo } from "../../servicios/pedidosService";
import { auth } from "../../servicios/firebase";

function MisPedidos() {
  const navigate = useNavigate();

  const [pedidos, setPedidos] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [correoCliente, setCorreoCliente] = useState("");

  useEffect(() => {
    const cargarPedidos = async () => {
      try {
        const correo = obtenerCorreoCliente();

        if (!correo || correo === "invitado") {
          setCorreoCliente("invitado");
          setPedidos([]);
          setCargando(false);
          return;
        }

        setCorreoCliente(correo);

        const datos = await obtenerPedidosPorCorreo(correo);
        setPedidos(datos);
      } catch (error) {
        console.error("Error al cargar pedidos:", error);
      } finally {
        setCargando(false);
      }
    };

    cargarPedidos();
  }, []);

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

  const formatearFecha = (fecha) => {
    if (!fecha) return "Sin fecha";

    if (fecha.seconds) {
      const fechaJS = new Date(fecha.seconds * 1000);
      return fechaJS.toLocaleDateString("es-BO");
    }

    return "Sin fecha";
  };

  const obtenerCantidadProductos = (productos = []) => {
    return productos.reduce(
      (total, producto) => total + Number(producto.cantidad || 0),
      0
    );
  };

  const mostrarProductos = (productos = []) => {
    if (productos.length === 0) return "Sin productos";

    return productos.map((producto) => producto.nombre).join(", ");
  };

  const esPedidoCompletado = (estado = "") => {
    const estadoLower = estado.toLowerCase();

    return (
      estadoLower === "entregado" ||
      estadoLower === "pedido en destino" ||
      estadoLower === "cancelado"
    );
  };

  const pedidosEnCurso = pedidos.filter(
    (pedido) => !esPedidoCompletado(pedido.estado)
  );

  const historialPedidos = pedidos.filter((pedido) =>
    esPedidoCompletado(pedido.estado)
  );

  const irLogin = () => {
    localStorage.removeItem("guest");
    navigate("/login");
  };

  const renderPedido = (pedido, completado = false) => (
    <div
      className={`pedido-card-horizontal ${completado ? "historial" : ""}`}
      key={pedido.id}
    >
      <div className="pedido-card-logo">
        <img src={logo} alt="Insignis" />
      </div>

      <div className="pedido-card-info">
        <div className="pedido-card-top">
          <div>
            <span className="pedido-label">
              {completado ? "PEDIDO COMPLETADO" : "PEDIDO EN CURSO"}
            </span>

            <h3>{pedido.id}</h3>
          </div>

          <span className="estado">{pedido.estado || "Solicitado"}</span>
        </div>

        <p>
          <strong>Fecha:</strong> {formatearFecha(pedido.fechaCreacion)}
        </p>

        <p>
          <strong>Productos:</strong> {mostrarProductos(pedido.productos)}
        </p>

        <p>
          <strong>Cantidad total:</strong>{" "}
          {obtenerCantidadProductos(pedido.productos)} prendas
        </p>

        <p>
          <strong>Departamento:</strong>{" "}
          {pedido.departamento || "No especificado"}
        </p>

        <p>
          <strong>Correo:</strong> {pedido.correoCliente || correoCliente}
        </p>
      </div>

      <div className="pedido-card-total">
        <span>Total</span>

        <strong>Bs {Number(pedido.total || 0).toFixed(2)}</strong>

        <Link to={`/detalle-pedido/${pedido.id}`}>
          <button className={completado ? "btn-secundario" : "btn-cliente"}>
            Ver detalle
          </button>
        </Link>
      </div>
    </div>
  );

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

        <h1 className="titulo-principal">Mis pedidos</h1>

        <p className="subtitulo">
          Revisa tus pedidos en curso y el historial de compras realizadas en
          Insignis Store.
        </p>

        {cargando ? (
          <div className="catalogo-mensaje">
            <h2>Cargando tus pedidos...</h2>
          </div>
        ) : correoCliente === "invitado" ? (
          <div className="catalogo-mensaje">
            <h2>Inicia sesión para ver tus pedidos</h2>

            <p>
              Tus pedidos se guardan con el correo de tu cuenta. Inicia sesión
              para ver tu historial de compras.
            </p>

            <button className="btn-cliente" onClick={irLogin}>
              Iniciar sesión
            </button>
          </div>
        ) : pedidos.length === 0 ? (
          <div className="catalogo-mensaje">
            <h2>No tienes pedidos todavía</h2>

            <p>
              Cuando confirmes una compra, tus pedidos aparecerán en esta
              sección.
            </p>

            <Link to="/catalogo">
              <button className="btn-cliente">Ver catálogo</button>
            </Link>
          </div>
        ) : (
          <>
            <h2 className="subtitulo-seccion">Pedidos en curso</h2>

            <div className="pedidos-lista">
              {pedidosEnCurso.length === 0 ? (
                <div className="catalogo-mensaje">
                  <h2>No tienes pedidos en curso</h2>
                  <p>Todos tus pedidos ya están completados o cancelados.</p>
                </div>
              ) : (
                pedidosEnCurso.map((pedido) => renderPedido(pedido, false))
              )}
            </div>

            <h2 className="subtitulo-seccion">Historial de pedidos</h2>

            <div className="pedidos-lista">
              {historialPedidos.length === 0 ? (
                <div className="catalogo-mensaje">
                  <h2>No tienes historial todavía</h2>
                  <p>Los pedidos entregados aparecerán aquí.</p>
                </div>
              ) : (
                historialPedidos.map((pedido) => renderPedido(pedido, true))
              )}
            </div>
          </>
        )}

        <FooterCliente />
      </div>
    </div>
  );
}

export default MisPedidos;