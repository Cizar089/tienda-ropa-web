import { Link } from "react-router-dom";
import { useEffect, useState } from "react";
import "./Cliente.css";

import logo from "../../assets/logo.webp";
import FooterCliente from "../../componentes/cliente/FooterCliente";
import Toast from "../../componentes/ui/Toast";

function Carrito() {
  const [productos, setProductos] = useState([]);
  const [mostrarModalVaciar, setMostrarModalVaciar] = useState(false);

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
    const carritoGuardado = JSON.parse(localStorage.getItem("carrito")) || [];
    setProductos(carritoGuardado);
  }, []);

  const guardarCarrito = (nuevoCarrito) => {
    setProductos(nuevoCarrito);
    localStorage.setItem("carrito", JSON.stringify(nuevoCarrito));
  };

  const aumentarCantidad = (id, talla, corte) => {
    const nuevoCarrito = productos.map((item) => {
      const esMismoProducto =
        item.id === id && item.talla === talla && item.corte === corte;

      if (esMismoProducto) {
        return {
          ...item,
          cantidad: item.cantidad + 1,
        };
      }

      return item;
    });

    guardarCarrito(nuevoCarrito);
    mostrarToast("Cantidad aumentada", "success");
  };

  const disminuirCantidad = (id, talla, corte) => {
    let cambio = false;

    const nuevoCarrito = productos.map((item) => {
      const esMismoProducto =
        item.id === id && item.talla === talla && item.corte === corte;

      if (esMismoProducto) {
        if (item.cantidad <= 1) {
          return item;
        }

        cambio = true;

        return {
          ...item,
          cantidad: item.cantidad - 1,
        };
      }

      return item;
    });

    guardarCarrito(nuevoCarrito);

    if (cambio) {
      mostrarToast("Cantidad disminuida", "success");
    } else {
      mostrarToast("La cantidad mínima es 1", "error");
    }
  };

  const eliminarProducto = (id, talla, corte) => {
    const nuevoCarrito = productos.filter(
      (item) => !(item.id === id && item.talla === talla && item.corte === corte)
    );

    guardarCarrito(nuevoCarrito);
    mostrarToast("Producto eliminado del carrito", "success");
  };

  const abrirModalVaciar = () => {
    setMostrarModalVaciar(true);
  };

  const cancelarVaciarCarrito = () => {
    setMostrarModalVaciar(false);
    mostrarToast("Acción cancelada", "error");
  };

  const confirmarVaciarCarrito = () => {
    guardarCarrito([]);
    setMostrarModalVaciar(false);
    mostrarToast("Carrito vaciado correctamente", "success");
  };

  const obtenerImagenProducto = (imagen) => {
    if (!imagen) return logo;

    if (imagen.startsWith("http")) {
      return imagen;
    }

    return `/${imagen}`;
  };

  const total = productos.reduce(
    (suma, item) => suma + Number(item.precio || 0) * Number(item.cantidad || 0),
    0
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

        <h1 className="titulo-principal">Carrito</h1>

        <p className="subtitulo">
          Revisa tus prendas seleccionadas antes de confirmar el pedido.
        </p>

        {productos.length === 0 ? (
          <div className="carrito-vacio">
            <img src={logo} alt="Insignis" />

            <h2>Tu carrito está vacío</h2>

            <p>
              Agrega productos desde el catálogo para poder confirmar tu pedido.
            </p>

            <Link to="/catalogo">
              <button className="btn-cliente">Ver catálogo</button>
            </Link>
          </div>
        ) : (
          <>
            <div className="carrito-lista">
              {productos.map((item) => (
                <div
                  className="carrito-item"
                  key={`${item.id}-${item.talla}-${item.corte}`}
                >
                  <div className="carrito-img">
                    <img
                      src={obtenerImagenProducto(item.imagen)}
                      alt={item.nombre}
                      onError={(e) => {
                        e.currentTarget.src = logo;
                        mostrarToast("No se pudo cargar la imagen", "error");
                      }}
                    />
                  </div>

                  <div className="carrito-info">
                    <span className="pedido-label">
                      {item.tipo || "Producto"}
                    </span>

                    <h3>{item.nombre}</h3>

                    <p>
                      <strong>Talla:</strong> {item.talla || "Sin talla"}
                    </p>

                    <p>
                      <strong>Corte:</strong> {item.corte || "Sin corte"}
                    </p>

                    <p>
                      <strong>Color:</strong> {item.color || "Sin color"}
                    </p>

                    {Number(item.descuento || 0) > 0 ? (
                      <>
                        <p className="precio precio-anterior">
                          Bs {item.precioOriginal}
                        </p>

                        <p className="precio">Bs {item.precio}</p>

                        <p className="producto-descuento">
                          {item.descuento}% de descuento
                        </p>
                      </>
                    ) : (
                      <p className="precio">Bs {item.precio}</p>
                    )}
                  </div>

                  <div className="carrito-cantidad">
                    <span>Cantidad</span>

                    <div className="cantidad-controles">
                      <button
                        onClick={() =>
                          disminuirCantidad(item.id, item.talla, item.corte)
                        }
                      >
                        -
                      </button>

                      <strong>{item.cantidad}</strong>

                      <button
                        onClick={() =>
                          aumentarCantidad(item.id, item.talla, item.corte)
                        }
                      >
                        +
                      </button>
                    </div>
                  </div>

                  <div className="carrito-subtotal">
                    <span>Subtotal</span>

                    <strong>
                      Bs{" "}
                      {(
                        Number(item.precio || 0) * Number(item.cantidad || 0)
                      ).toFixed(2)}
                    </strong>

                    <button
                      className="btn-secundario"
                      onClick={() =>
                        eliminarProducto(item.id, item.talla, item.corte)
                      }
                    >
                      Eliminar
                    </button>
                  </div>
                </div>
              ))}
            </div>

            <div className="total-box carrito-total-box">
              <div>
                <span>Total del carrito</span>
                <h2>Bs {total.toFixed(2)}</h2>
              </div>

              <div className="carrito-acciones">
                <button className="btn-secundario" onClick={abrirModalVaciar}>
                  Vaciar carrito
                </button>

                <Link to="/pedido">
                  <button className="btn-cliente">Confirmar pedido</button>
                </Link>
              </div>
            </div>
          </>
        )}

        <FooterCliente />
      </div>

      {mostrarModalVaciar && (
        <div className="modal-canje-fondo">
          <div className="modal-canje-card">
            <img src={logo} alt="Insignis" />

            <span className="pedido-label">VACIAR CARRITO</span>

            <h2>¿Quieres vaciar tu carrito?</h2>

            <p>
              Se eliminarán todas las prendas seleccionadas. Esta acción no se
              puede deshacer.
            </p>

            <div className="modal-canje-botones">
              <button className="btn-secundario" onClick={cancelarVaciarCarrito}>
                Cancelar
              </button>

              <button className="btn-cliente" onClick={confirmarVaciarCarrito}>
                Sí, vaciar
              </button>
            </div>
          </div>
        </div>
      )}

      <Toast mensaje={toast.mensaje} tipo={toast.tipo} />
    </div>
  );
}

export default Carrito;