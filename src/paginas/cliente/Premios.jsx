import { Link, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import "./Cliente.css";

import logo from "../../assets/logo.webp";
import FooterCliente from "../../componentes/cliente/FooterCliente";
import Toast from "../../componentes/ui/Toast";

import { obtenerPremiosActivos } from "../../servicios/premiosService";
import { obtenerClientePorCorreo } from "../../servicios/clientesService";
import { canjearPremioCliente } from "../../servicios/canjesService";
import { auth } from "../../servicios/firebase";

function Premios() {
  const navigate = useNavigate();

  const [premios, setPremios] = useState([]);
  const [cliente, setCliente] = useState(null);
  const [cargando, setCargando] = useState(true);
  const [canjeando, setCanjeando] = useState(false);
  const [correoCliente, setCorreoCliente] = useState("invitado");

  const [premioPendiente, setPremioPendiente] = useState(null);

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

  const obtenerCorreoCliente = () => {
    const esInvitado = localStorage.getItem("guest") === "true";

    if (esInvitado) return "invitado";

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

  const cargarDatos = async () => {
    try {
      const correo = obtenerCorreoCliente();
      setCorreoCliente(correo);

      if (correo === "invitado") {
        setPremios([]);
        setCliente(null);
        setCargando(false);
        return;
      }

      const premiosFirestore = await obtenerPremiosActivos();
      setPremios(premiosFirestore);

      const clienteFirestore = await obtenerClientePorCorreo(correo);
      setCliente(clienteFirestore);
    } catch (error) {
      console.error("Error al cargar premios:", error);
      mostrarToast("No se pudieron cargar los premios", "error");
    } finally {
      setCargando(false);
    }
  };

  useEffect(() => {
    cargarDatos();
  }, []);

  const puntosDisponibles = Number(cliente?.puntosDisponibles || 0);

  const abrirConfirmacionCanje = (premio) => {
    if (correoCliente === "invitado") {
      mostrarToast("Debes iniciar sesión para canjear premios", "error");

      setTimeout(() => {
        navigate("/login");
      }, 1000);

      return;
    }

    const puntosNecesarios = Number(premio.puntosNecesarios || 0);

    if (puntosDisponibles < puntosNecesarios) {
      mostrarToast("No tienes puntos suficientes para este premio", "error");
      return;
    }

    setPremioPendiente(premio);
  };

  const cancelarCanje = () => {
    setPremioPendiente(null);
    mostrarToast("Canje cancelado", "error");
  };

  const confirmarCanje = async () => {
    if (!premioPendiente) return;

    try {
      setCanjeando(true);

      await canjearPremioCliente(correoCliente, premioPendiente);

      mostrarToast("Canje realizado correctamente", "success");

      setPremioPendiente(null);

      await cargarDatos();
    } catch (error) {
      console.error("Error al canjear premio:", error);
      mostrarToast(error.message || "No se pudo realizar el canje", "error");
    } finally {
      setCanjeando(false);
    }
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

        <h1 className="titulo-principal">Premios disponibles</h1>

        <p className="subtitulo">
          Canjea tus puntos por descuentos o prendas seleccionadas de Insignis.
        </p>

        {cargando ? (
          <div className="catalogo-mensaje">
            <h2>Cargando premios...</h2>
          </div>
        ) : correoCliente === "invitado" ? (
          <div className="acceso-restringido">
            <img src={logo} alt="Insignis" />

            <h2>Inicia sesión para acceder a la tienda de premios</h2>

            <p>
              Los premios, puntos y canjes están conectados a tu cuenta. Inicia
              sesión para ver tus puntos disponibles y canjear beneficios.
            </p>

            <button className="btn-cliente" onClick={() => navigate("/login")}>
              Iniciar sesión
            </button>
          </div>
        ) : (
          <>
            <section className="premios-header">
              <div>
                <span className="pedido-label">PUNTOS DISPONIBLES</span>
                <h2>{puntosDisponibles} puntos</h2>
              </div>

              <Link to="/puntos">
                <button className="btn-secundario">Ver historial</button>
              </Link>
            </section>

            {premios.length === 0 ? (
              <div className="catalogo-mensaje">
                <h2>No hay premios disponibles</h2>
                <p>Vuelve más tarde para ver nuevos premios de Insignis.</p>
              </div>
            ) : (
              <div className="grid-cards">
                {premios.map((premio) => {
                  const puntosNecesarios = Number(
                    premio.puntosNecesarios || 0
                  );

                  const disponible = puntosDisponibles >= puntosNecesarios;

                  return (
                    <div className="card premio-card" key={premio.id}>
                      <div className="card-img">
                        <img src={logo} alt={premio.nombre} />
                      </div>

                      <span className="pedido-label">
                        {premio.tipo || "Premio"}
                      </span>

                      <h3>{premio.nombre}</h3>

                      <p>{premio.descripcion}</p>

                      {Number(premio.descuento || 0) > 0 && (
                        <p className="producto-descuento">
                          {premio.descuento}% de descuento
                        </p>
                      )}

                      <div className="premio-puntos">
                        <span>Necesitas</span>
                        <strong>{puntosNecesarios} puntos</strong>
                      </div>

                      <button
                        className={disponible ? "btn-cliente" : "btn-secundario"}
                        onClick={() => abrirConfirmacionCanje(premio)}
                        disabled={!disponible || canjeando}
                      >
                        {canjeando
                          ? "Procesando..."
                          : disponible
                          ? "Canjear premio"
                          : "Puntos insuficientes"}
                      </button>
                    </div>
                  );
                })}
              </div>
            )}
          </>
        )}

        <FooterCliente />
      </div>

      {premioPendiente && (
        <div className="modal-canje-fondo">
          <div className="modal-canje-card">
            <img src={logo} alt="Insignis" />

            <span className="pedido-label">CONFIRMAR CANJE</span>

            <h2>¿Quieres canjear este premio?</h2>

            <h3>{premioPendiente.nombre}</h3>

            <p>{premioPendiente.descripcion}</p>

            <div className="premio-puntos modal-puntos">
              <span>Se descontarán</span>
              <strong>{Number(premioPendiente.puntosNecesarios || 0)} puntos</strong>
            </div>

            <div className="modal-canje-botones">
              <button
                className="btn-secundario"
                onClick={cancelarCanje}
                disabled={canjeando}
              >
                Cancelar
              </button>

              <button
                className="btn-cliente"
                onClick={confirmarCanje}
                disabled={canjeando}
              >
                {canjeando ? "Canjeando..." : "Sí, canjear"}
              </button>
            </div>
          </div>
        </div>
      )}

      <Toast mensaje={toast.mensaje} tipo={toast.tipo} />
    </div>
  );
}

export default Premios;