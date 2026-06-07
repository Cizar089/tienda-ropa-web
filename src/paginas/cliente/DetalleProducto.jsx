import { Link, useParams } from "react-router-dom";
import { useEffect, useState } from "react";
import "./Cliente.css";

import logo from "../../assets/logo.webp";
import FooterCliente from "../../componentes/cliente/FooterCliente";
import Toast from "../../componentes/ui/Toast";
import { obtenerProductoPorId } from "../../servicios/productosService";

function DetalleProducto() {
  const { id } = useParams();

  const [producto, setProducto] = useState(null);
  const [cargando, setCargando] = useState(true);
  const [cantidad, setCantidad] = useState(1);
  const [tallaSeleccionada, setTallaSeleccionada] = useState("");
  const [corteSeleccionado, setCorteSeleccionado] = useState("");

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

  useEffect(() => {
    const cargarProducto = async () => {
      try {
        const datos = await obtenerProductoPorId(id);

        if (!datos) {
          mostrarToast("Producto no encontrado", "error");
        }

        setProducto(datos);
      } catch (error) {
        console.error("Error al cargar producto:", error);
        mostrarToast("No se pudo cargar el producto", "error");
      } finally {
        setCargando(false);
      }
    };

    cargarProducto();
  }, [id]);

  const normalizar = (texto) => {
    return String(texto || "")
      .trim()
      .toLowerCase()
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "");
  };

  const obtenerImagenProducto = (imagen) => {
    if (!imagen) return logo;

    if (imagen.startsWith("http")) {
      return imagen;
    }

    return `/${imagen}`;
  };

  const esGorra = () => {
    const tipo = normalizar(producto?.tipo);
    const nombre = normalizar(producto?.nombre);

    return tipo.includes("gorra") || nombre.includes("gorra");
  };

  const esAccesorio = () => {
    const tipo = normalizar(producto?.tipo);
    const nombre = normalizar(producto?.nombre);

    return tipo.includes("accesorio") || nombre.includes("accesorio");
  };

  const esPantalon = () => {
    const tipo = normalizar(producto?.tipo);
    const nombre = normalizar(producto?.nombre);

    return (
      tipo.includes("pantalon") ||
      nombre.includes("pantalon") ||
      tipo.includes("cargo") ||
      nombre.includes("cargo") ||
      nombre.includes("baggy")
    );
  };

  const esPolera = () => {
    const tipo = normalizar(producto?.tipo);
    const nombre = normalizar(producto?.nombre);

    return tipo.includes("polera") || nombre.includes("polera");
  };

  const obtenerTallas = () => {
    if (!producto) return [];

    if (esGorra() || esAccesorio()) {
      return [];
    }

    if (esPantalon()) {
      return ["40", "42", "44"];
    }

    return ["S", "M", "L", "XL"];
  };

  const mostrarTalla = () => {
    if (!producto) return false;

    if (esGorra() || esAccesorio()) {
      return false;
    }

    return true;
  };

  const mostrarCorte = () => {
    if (!producto) return false;

    return esPolera();
  };

  const agregarCarrito = () => {
    if (!producto) return;

    if (mostrarTalla() && !tallaSeleccionada) {
      mostrarToast("Selecciona una talla", "error");
      return;
    }

    if (mostrarCorte() && !corteSeleccionado) {
      mostrarToast("Selecciona un corte", "error");
      return;
    }

    const estadoProducto = normalizar(producto.estado);

    if (estadoProducto === "agotado") {
      mostrarToast("Este producto está agotado", "error");
      return;
    }

    const precioOriginal = Number(producto.precio || 0);
    const descuento = Number(producto.descuento || 0);

    const precioFinal =
      descuento > 0
        ? precioOriginal - (precioOriginal * descuento) / 100
        : precioOriginal;

    const carritoActual = JSON.parse(localStorage.getItem("carrito")) || [];

    const tallaFinal = mostrarTalla() ? tallaSeleccionada : "No aplica";
    const corteFinal = mostrarCorte() ? corteSeleccionado : "No aplica";

    const productoExistente = carritoActual.find(
      (item) =>
        item.id === producto.id &&
        item.talla === tallaFinal &&
        item.corte === corteFinal
    );

    let nuevoCarrito;

    if (productoExistente) {
      nuevoCarrito = carritoActual.map((item) =>
        item.id === producto.id &&
        item.talla === tallaFinal &&
        item.corte === corteFinal
          ? {
              ...item,
              cantidad: item.cantidad + cantidad,
            }
          : item
      );
    } else {
      nuevoCarrito = [
        ...carritoActual,
        {
          id: producto.id,
          nombre: producto.nombre,
          precio: Number(precioFinal.toFixed(2)),
          precioOriginal: precioOriginal,
          descuento: descuento,
          cantidad: cantidad,
          imagen: producto.imagen || "",
          tipo: producto.tipo || "",
          color: producto.color || "",
          talla: tallaFinal,
          corte: corteFinal,
          estado: producto.estado || "Disponible",
        },
      ];
    }

    localStorage.setItem("carrito", JSON.stringify(nuevoCarrito));
    mostrarToast("Producto agregado al carrito", "success");
  };

  const aumentarCantidad = () => {
    setCantidad(cantidad + 1);
  };

  const disminuirCantidad = () => {
    if (cantidad > 1) {
      setCantidad(cantidad - 1);
    } else {
      mostrarToast("La cantidad mínima es 1", "error");
    }
  };

  if (cargando) {
    return (
      <div className="cliente-page">
        <div className="cliente-pattern"></div>

        <div className="cliente-contenido">
          <div className="catalogo-mensaje">
            <h2>Cargando producto...</h2>
          </div>
        </div>

        <Toast mensaje={toast.mensaje} tipo={toast.tipo} />
      </div>
    );
  }

  if (!producto) {
    return (
      <div className="cliente-page">
        <div className="cliente-pattern"></div>

        <div className="cliente-contenido">
          <div className="catalogo-mensaje">
            <h2>Producto no encontrado</h2>

            <p>Este producto no existe o fue eliminado.</p>

            <Link to="/catalogo">
              <button className="btn-cliente">Volver al catálogo</button>
            </Link>
          </div>
        </div>

        <Toast mensaje={toast.mensaje} tipo={toast.tipo} />
      </div>
    );
  }

  const descuento = Number(producto.descuento || 0);
  const precio = Number(producto.precio || 0);

  const precioFinal =
    descuento > 0 ? precio - (precio * descuento) / 100 : precio;

  const tallasDisponibles = obtenerTallas();
  const estadoLower = normalizar(producto.estado);

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

        <Link to="/catalogo">
          <button className="btn-secundario">Volver al catálogo</button>
        </Link>

        <div className="detalle-layout">
          <div className="card detalle-imagen-card">
            <div className="card-img detalle-img-producto">
              <img
                src={obtenerImagenProducto(producto.imagen)}
                alt={producto.nombre}
                onError={(e) => {
                  e.currentTarget.src = logo;
                  mostrarToast("No se pudo cargar la imagen del producto", "error");
                }}
              />
            </div>
          </div>

          <div className="card detalle-info-producto">
            <span className="pedido-label">{producto.tipo || "Producto"}</span>

            <h1>{producto.nombre}</h1>

            <p>
              {producto.descripcion || "Producto disponible en Insignis Store."}
            </p>

            <div className="estado-producto-box">
              <span className="estado-label">Estado de la prenda</span>

              <div
                className={
                  estadoLower === "agotado"
                    ? "estado-producto estado-producto-agotado"
                    : estadoLower === "oferta"
                    ? "estado-producto estado-producto-oferta"
                    : "estado-producto estado-producto-disponible"
                }
              >
                {producto.estado || "Disponible"}
              </div>
            </div>

            <div className="detalle-precios">
              {descuento > 0 ? (
                <>
                  <p className="precio precio-anterior">Bs {precio}</p>

                  <p className="precio">Bs {precioFinal.toFixed(2)}</p>

                  <p className="producto-descuento">
                    {descuento}% de descuento
                  </p>
                </>
              ) : (
                <p className="precio">Bs {precio}</p>
              )}
            </div>

            <div className="opciones-producto">
              {mostrarTalla() && (
                <div>
                  <h3>Selecciona talla</h3>

                  <div className="opciones-botones">
                    {tallasDisponibles.map((talla) => (
                      <button
                        key={talla}
                        className={
                          tallaSeleccionada === talla
                            ? "opcion-btn activo"
                            : "opcion-btn"
                        }
                        onClick={() => {
                          setTallaSeleccionada(talla);
                          mostrarToast(`Talla seleccionada: ${talla}`, "success");
                        }}
                      >
                        {talla}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {mostrarCorte() && (
                <div>
                  <h3>Selecciona corte</h3>

                  <div className="opciones-botones">
                    <button
                      className={
                        corteSeleccionado === "Oversize"
                          ? "opcion-btn activo"
                          : "opcion-btn"
                      }
                      onClick={() => {
                        setCorteSeleccionado("Oversize");
                        mostrarToast("Corte seleccionado: Oversize", "success");
                      }}
                    >
                      Oversize
                    </button>

                    <button
                      className={
                        corteSeleccionado === "Corte normal"
                          ? "opcion-btn activo"
                          : "opcion-btn"
                      }
                      onClick={() => {
                        setCorteSeleccionado("Corte normal");
                        mostrarToast("Corte seleccionado: Corte normal", "success");
                      }}
                    >
                      Corte normal
                    </button>

                    <button
                      className={
                        corteSeleccionado === "Boxy fit"
                          ? "opcion-btn activo"
                          : "opcion-btn"
                      }
                      onClick={() => {
                        setCorteSeleccionado("Boxy fit");
                        mostrarToast("Corte seleccionado: Boxy fit", "success");
                      }}
                    >
                      Boxy fit
                    </button>
                  </div>
                </div>
              )}
            </div>

            <div className="cantidad-box">
              <span>Cantidad</span>

              <div className="cantidad-controles">
                <button onClick={disminuirCantidad}>-</button>
                <strong>{cantidad}</strong>
                <button onClick={aumentarCantidad}>+</button>
              </div>
            </div>

            <div className="detalle-botones">
              <button
                className="btn-cliente"
                onClick={agregarCarrito}
                disabled={estadoLower === "agotado"}
              >
                {estadoLower === "agotado"
                  ? "Producto agotado"
                  : "Agregar al carrito"}
              </button>

              <Link to="/carrito">
                <button className="btn-secundario">Ir al carrito</button>
              </Link>
            </div>
          </div>
        </div>

        <FooterCliente />
      </div>

      <Toast mensaje={toast.mensaje} tipo={toast.tipo} />
    </div>
  );
}

export default DetalleProducto;