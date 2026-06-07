import { Link, useParams } from "react-router-dom";
import { useEffect, useState } from "react";
import "./Cliente.css";

import logo from "../../assets/logo.webp";
import FooterCliente from "../../componentes/cliente/FooterCliente";
import Toast from "../../componentes/ui/Toast";
import { obtenerPedidoPorId } from "../../servicios/pedidosService";

function DetallePedido() {
  const { id } = useParams();

  const [pedido, setPedido] = useState(null);
  const [cargando, setCargando] = useState(true);
  const [productoActual, setProductoActual] = useState(0);

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

  const pasos = [
    {
      titulo: "Solicitado",
      descripcion: "Tu pedido fue registrado.",
    },
    {
      titulo: "Confirmado",
      descripcion: "La tienda confirmó tu compra.",
    },
    {
      titulo: "Pedido en camino",
      descripcion: "Tu pedido está siendo enviado.",
    },
    {
      titulo: "Pedido en destino",
      descripcion: "El pedido llegó a destino.",
    },
  ];

  useEffect(() => {
    const cargarPedido = async () => {
      try {
        const datos = await obtenerPedidoPorId(id);

        if (!datos) {
          mostrarToast("Pedido no encontrado", "error");
        }

        setPedido(datos);
      } catch (error) {
        console.error("Error al cargar pedido:", error);
        mostrarToast("No se pudo cargar el detalle del pedido", "error");
      } finally {
        setCargando(false);
      }
    };

    cargarPedido();
  }, [id]);

  useEffect(() => {
    if (!pedido || !pedido.productos || pedido.productos.length <= 1) return;

    const intervalo = setInterval(() => {
      setProductoActual((actual) =>
        actual === pedido.productos.length - 1 ? 0 : actual + 1
      );
    }, 3000);

    return () => clearInterval(intervalo);
  }, [pedido]);

  const obtenerPasoActual = (estado = "") => {
    if (estado === "Solicitado") return 1;
    if (estado === "Confirmado") return 2;
    if (estado === "Pedido en camino") return 3;
    if (estado === "Pedido en destino") return 4;
    if (estado === "Entregado") return 4;

    return 1;
  };

  const formatearFecha = (fecha) => {
    if (!fecha) return "Sin fecha";

    if (fecha.seconds) {
      const fechaJS = new Date(fecha.seconds * 1000);
      return fechaJS.toLocaleDateString("es-BO");
    }

    return "Sin fecha";
  };

  const obtenerImagenProducto = (imagen) => {
    if (!imagen) return logo;

    if (imagen.startsWith("http")) {
      return imagen;
    }

    return `/${imagen}`;
  };

  const abrirWhatsApp = () => {
    if (!pedido) {
      mostrarToast("No hay pedido seleccionado", "error");
      return;
    }

    const mensaje = `Hola, quiero consultar el estado de mi pedido ${pedido.id}`;

    window.open(
      `https://wa.me/59169166277?text=${encodeURIComponent(mensaje)}`,
      "_blank"
    );

    mostrarToast("Abriendo WhatsApp para consultar tu pedido", "success");
  };

  if (cargando) {
    return (
      <div className="cliente-page">
        <div className="cliente-pattern"></div>

        <div className="cliente-contenido">
          <div className="catalogo-mensaje">
            <h2>Cargando detalle del pedido...</h2>
          </div>
        </div>

        <Toast mensaje={toast.mensaje} tipo={toast.tipo} />
      </div>
    );
  }

  if (!pedido) {
    return (
      <div className="cliente-page">
        <div className="cliente-pattern"></div>

        <div className="cliente-contenido">
          <div className="catalogo-mensaje">
            <h2>Pedido no encontrado</h2>
            <p>Este pedido no existe o fue eliminado.</p>

            <Link to="/mis-pedidos">
              <button className="btn-cliente">Volver a mis pedidos</button>
            </Link>
          </div>
        </div>

        <Toast mensaje={toast.mensaje} tipo={toast.tipo} />
      </div>
    );
  }

  const productos = pedido.productos || [];
  const productoMostrado = productos[productoActual];
  const pasoActual = obtenerPasoActual(pedido.estado);

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

        <Link to="/mis-pedidos">
          <button className="btn-secundario">Volver a mis pedidos</button>
        </Link>

        <section className="detalle-pedido-hero">
          <div>
            <span className="pedido-label">DETALLE DEL PEDIDO</span>
            <h1>{pedido.id}</h1>
            <p>Realizado el {formatearFecha(pedido.fechaCreacion)}</p>
          </div>

          <div className="detalle-estado-box">
            <span>Estado actual</span>
            <strong>{pedido.estado || "Solicitado"}</strong>
          </div>
        </section>

        <section className="seguimiento-detalle-card">
          <h2>Seguimiento del pedido</h2>

          <div className="timeline-pedido">
            {pasos.map((paso, index) => {
              const numeroPaso = index + 1;
              const completado = numeroPaso <= pasoActual;

              return (
                <div className="timeline-item" key={paso.titulo}>
                  <div className={`timeline-circulo ${completado ? "ok" : ""}`}>
                    {completado ? "✓" : numeroPaso}
                  </div>

                  {index < pasos.length - 1 && (
                    <div
                      className={`timeline-linea ${
                        numeroPaso < pasoActual ? "ok" : ""
                      }`}
                    ></div>
                  )}

                  <h3 className={completado ? "paso-ok" : ""}>
                    {paso.titulo}
                  </h3>

                  <p>{paso.descripcion}</p>
                </div>
              );
            })}
          </div>
        </section>

        {productoMostrado && (
          <section className="producto-slider-pedido">
            <div className="producto-slider-info">
              <span className="pedido-label">PRENDAS DEL PEDIDO</span>

              <h2>{productoMostrado.nombre}</h2>

              <p>
                Talla: {productoMostrado.talla || "Sin talla"} | Corte:{" "}
                {productoMostrado.corte || "Sin corte"}
              </p>

              <p>Color: {productoMostrado.color || "Sin color"}</p>

              <p>Cantidad: {productoMostrado.cantidad}</p>

              {Number(productoMostrado.descuento || 0) > 0 && (
                <p className="producto-descuento">
                  {productoMostrado.descuento}% de descuento
                </p>
              )}

              <strong>
                Bs{" "}
                {(
                  Number(productoMostrado.precio || 0) *
                  Number(productoMostrado.cantidad || 0)
                ).toFixed(2)}
              </strong>
            </div>

            <div className="producto-slider-imagen">
              <img
                src={obtenerImagenProducto(productoMostrado.imagen)}
                alt={productoMostrado.nombre}
                onError={(e) => {
                  e.currentTarget.src = logo;
                }}
              />
            </div>

            <div className="producto-slider-puntos">
              {productos.map((producto, index) => (
                <button
                  key={`${producto.id}-${index}`}
                  className={
                    index === productoActual ? "punto activo" : "punto"
                  }
                  onClick={() => {
                    setProductoActual(index);
                    mostrarToast(`Mostrando ${producto.nombre}`, "success");
                  }}
                ></button>
              ))}
            </div>
          </section>
        )}

        <section className="detalle-pedido-grid">
          <div className="detalle-productos-card">
            <h2>Productos del pedido</h2>

            {productos.map((producto, index) => (
              <div
                className="detalle-producto-item"
                key={`${producto.id}-${index}`}
              >
                <div className="producto-img-grande">
                  <img
                    src={obtenerImagenProducto(producto.imagen)}
                    alt={producto.nombre}
                    onError={(e) => {
                      e.currentTarget.src = logo;
                    }}
                  />
                </div>

                <div className="detalle-producto-info">
                  <h3>{producto.nombre}</h3>

                  <p>
                    Talla: {producto.talla || "Sin talla"} | Corte:{" "}
                    {producto.corte || "Sin corte"}
                  </p>

                  <p>Color: {producto.color || "Sin color"}</p>

                  <p>Cantidad: {producto.cantidad}</p>

                  {Number(producto.descuento || 0) > 0 && (
                    <p className="producto-descuento">
                      {producto.descuento}% de descuento
                    </p>
                  )}
                </div>

                <div className="detalle-producto-precio">
                  <span>Subtotal</span>

                  <strong>
                    Bs{" "}
                    {(
                      Number(producto.precio || 0) *
                      Number(producto.cantidad || 0)
                    ).toFixed(2)}
                  </strong>
                </div>
              </div>
            ))}

            {pedido.canjeUsado && (
              <div className="detalle-total-final descuento-final-box">
                <span>Premio aplicado: {pedido.canjeUsado.nombrePremio}</span>
                <strong>
                  - Bs {Number(pedido.descuentoCanje || 0).toFixed(2)}
                </strong>
              </div>
            )}

            <div className="detalle-total-final">
              <span>Total del pedido</span>
              <strong>Bs {Number(pedido.total || 0).toFixed(2)}</strong>
            </div>
          </div>

          <aside className="detalle-info-card">
            <h2>Información del pedido</h2>

            <div className="info-linea">
              <span>Cliente</span>
              <strong>{pedido.nombreCliente || "Sin nombre"}</strong>
            </div>

            <div className="info-linea">
              <span>Correo</span>
              <strong>{pedido.correoCliente || "Sin correo"}</strong>
            </div>

            <div className="info-linea">
              <span>Departamento</span>
              <strong>{pedido.departamento || "No especificado"}</strong>
            </div>

            <div className="info-linea">
              <span>Teléfono</span>
              <strong>{pedido.telefonoCliente || "Sin teléfono"}</strong>
            </div>

            <button className="btn-cliente btn-full" onClick={abrirWhatsApp}>
              Consultar por WhatsApp
            </button>

            <Link to="/catalogo">
              <button className="btn-secundario btn-full">
                Seguir comprando
              </button>
            </Link>
          </aside>
        </section>

        <FooterCliente />
      </div>

      <Toast mensaje={toast.mensaje} tipo={toast.tipo} />
    </div>
  );
}

export default DetallePedido;