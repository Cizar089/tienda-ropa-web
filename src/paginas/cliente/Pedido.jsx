import { Link, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import "./Cliente.css";

import logo from "../../assets/logo.webp";
import whatsapp from "../../assets/whatsapp.webp";
import FooterCliente from "../../componentes/cliente/FooterCliente";
import Toast from "../../componentes/ui/Toast";

import { registrarPedido } from "../../servicios/pedidosService";
import {
  obtenerCanjesPorCorreo,
  marcarCanjeComoUsado,
} from "../../servicios/canjesService";
import { auth } from "../../servicios/firebase";

function Pedido() {
  const navigate = useNavigate();

  const [nombre, setNombre] = useState("");
  const [carnet, setCarnet] = useState("");
  const [telefono, setTelefono] = useState("");
  const [departamento, setDepartamento] = useState("");

  const [productos, setProductos] = useState([]);
  const [canjes, setCanjes] = useState([]);
  const [canjeSeleccionado, setCanjeSeleccionado] = useState(null);

  const [guardando, setGuardando] = useState(false);

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

  const normalizar = (texto) => {
    return String(texto || "")
      .trim()
      .toLowerCase()
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "");
  };

  const obtenerCorreoCliente = () => {
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

  const correoCliente = obtenerCorreoCliente();

  useEffect(() => {
    const cargarDatos = async () => {
      const carritoGuardado = JSON.parse(localStorage.getItem("carrito")) || [];
      setProductos(carritoGuardado);

      if (correoCliente === "invitado") {
        setCanjes([]);
        return;
      }

      try {
        const canjesCliente = await obtenerCanjesPorCorreo(correoCliente);

        const canjesDisponibles = canjesCliente.filter(
          (canje) => normalizar(canje.estado) !== "usado"
        );

        setCanjes(canjesDisponibles);
      } catch (error) {
        console.error("Error al cargar canjes:", error);
        mostrarToast("No se pudieron cargar tus premios", "error");
      }
    };

    cargarDatos();
  }, [correoCliente]);

  const subtotal = productos.reduce(
    (suma, item) => suma + Number(item.precio || 0) * Number(item.cantidad || 0),
    0
  );

  const buscarProductoParaCanje = (canje) => {
    const tipoCanje = normalizar(canje?.tipo);

    if (tipoCanje === "descuento") {
      return null;
    }

    return productos.find((producto) => {
      const tipoProducto = normalizar(producto.tipo);
      const nombreProducto = normalizar(producto.nombre);

      return tipoProducto === tipoCanje || nombreProducto.includes(tipoCanje);
    });
  };
const calcularCanje = () => {
  if (!canjeSeleccionado) {
    return {
      monto: 0,
      descripcion: "",
      productoGratis: null,
    };
  }

  const tipoCanje = normalizar(canjeSeleccionado.tipo);

  if (tipoCanje === "descuento") {
    const porcentaje = Number(canjeSeleccionado.descuento || 0);
    const monto = (subtotal * porcentaje) / 100;

    return {
      monto,
      descripcion: `${porcentaje}% de descuento`,
      productoGratis: null,
    };
  }

  const productoEncontrado = buscarProductoParaCanje(canjeSeleccionado);

  if (!productoEncontrado) {
    return {
      monto: 0,
      descripcion: "",
      productoGratis: null,
    };
  }

  // Solo descuenta 1 prenda, no todas las cantidades
  const monto = Number(productoEncontrado.precio || 0);

  return {
    monto,
    descripcion: `${productoEncontrado.nombre} gratis`,
    productoGratis: productoEncontrado,
  };
};
  const datosCanje = calcularCanje();
  const montoDescuento = datosCanje.monto;
  const total = Math.max(subtotal - montoDescuento, 0);

  const nombreValido = nombre.trim() !== "" && !/[0-9]/.test(nombre);
  const carnetValido = /^[0-9]{7,8}$/.test(carnet);
  const telefonoValido = /^[0-9]{8}$/.test(telefono);
  const departamentoValido = departamento.trim() !== "";
  const carritoValido = productos.length > 0;

  const formularioCompleto =
    nombreValido &&
    carnetValido &&
    telefonoValido &&
    departamentoValido &&
    carritoValido &&
    !guardando;

  const cambiarNombre = (e) => {
    const valor = e.target.value;

    if (!/[0-9]/.test(valor)) {
      setNombre(valor);
    }
  };

  const cambiarCarnet = (e) => {
    const valor = e.target.value.replace(/\D/g, "");

    if (valor.length <= 8) {
      setCarnet(valor);
    }
  };

  const cambiarTelefono = (e) => {
    const valor = e.target.value.replace(/\D/g, "");

    if (valor.length <= 8) {
      setTelefono(valor);
    }
  };

  const obtenerImagenProducto = (imagen) => {
    if (!imagen) return logo;

    if (imagen.startsWith("http")) {
      return imagen;
    }

    return `/${imagen}`;
  };

  const obtenerMensajeTipo = (tipo) => {
    const tipoNormalizado = normalizar(tipo);

    if (tipoNormalizado === "pantalon") return "Agrega un pantalón para canjear";
    if (tipoNormalizado === "polera") return "Agrega una polera para canjear";
    if (tipoNormalizado === "gorra") return "Agrega una gorra para canjear";
    if (tipoNormalizado === "canguro") return "Agrega un canguro para canjear";

    return `Agrega una prenda de tipo ${tipo} para canjear`;
  };

  const seleccionarCanje = (canje) => {
    if (canjeSeleccionado?.id === canje.id) {
      setCanjeSeleccionado(null);
      mostrarToast("Premio quitado del pedido", "success");
      return;
    }

    const tipoCanje = normalizar(canje.tipo);

    if (tipoCanje !== "descuento") {
      const productoEncontrado = buscarProductoParaCanje(canje);

      if (!productoEncontrado) {
        mostrarToast(obtenerMensajeTipo(canje.tipo), "error");
        return;
      }
    }

    setCanjeSeleccionado(canje);
    mostrarToast(`Premio seleccionado: ${canje.nombrePremio}`, "success");
  };

  const enviarWhatsApp = async () => {
    if (correoCliente === "invitado") {
      mostrarToast("Debes iniciar sesión para realizar pedidos", "error");
      return;
    }

    if (!formularioCompleto) {
      mostrarToast("Completa correctamente todos los datos", "error");
      return;
    }

    if (canjeSeleccionado) {
      const tipoCanje = normalizar(canjeSeleccionado.tipo);

      if (tipoCanje !== "descuento") {
        const productoEncontrado = buscarProductoParaCanje(canjeSeleccionado);

        if (!productoEncontrado) {
          mostrarToast(obtenerMensajeTipo(canjeSeleccionado.tipo), "error");
          return;
        }
      }
    }

    try {
      setGuardando(true);

      const pedidoFirestore = {
        correoCliente,
        nombreCliente: nombre,
        carnetCliente: carnet,
        telefonoCliente: telefono,
        departamento,
        productos,
        subtotal: Number(subtotal.toFixed(2)),
        descuentoCanje: Number(montoDescuento.toFixed(2)),
        total: Number(total.toFixed(2)),
        canjeUsado: canjeSeleccionado
          ? {
              id: canjeSeleccionado.id,
              nombrePremio: canjeSeleccionado.nombrePremio,
              tipo: canjeSeleccionado.tipo || "Premio",
              descuento: Number(canjeSeleccionado.descuento || 0),
              puntosUsados: Number(canjeSeleccionado.puntosUsados || 0),
              descripcionAplicada: datosCanje.descripcion,
              productoAplicado: datosCanje.productoGratis
                ? {
                    id: datosCanje.productoGratis.id,
                    nombre: datosCanje.productoGratis.nombre,
                    tipo: datosCanje.productoGratis.tipo,
                    precio: Number(datosCanje.productoGratis.precio || 0),
                    cantidad: Number(datosCanje.productoGratis.cantidad || 0),
                  }
                : null,
            }
          : null,
      };

      const idPedido = await registrarPedido(pedidoFirestore);

      if (canjeSeleccionado) {
        await marcarCanjeComoUsado(correoCliente, canjeSeleccionado.id);
      }

      const detalle = productos
        .map(
          (p) =>
            `• ${p.nombre} x${p.cantidad} - Talla: ${
              p.talla || "Sin talla"
            } - Corte: ${p.corte || "Sin corte"} - Color: ${
              p.color || "Sin color"
            } - Bs ${(Number(p.precio || 0) * Number(p.cantidad || 0)).toFixed(
              2
            )}`
        )
        .join("\n");

      const textoCanje = canjeSeleccionado
        ? `\nPREMIO CANJEADO:\n${canjeSeleccionado.nombrePremio} - ${
            datosCanje.descripcion
          }\n`
        : "";

      const mensaje = `Hola, quiero confirmar este pedido:

Código: ${idPedido}

DATOS DEL CLIENTE:
Correo: ${correoCliente}
Nombre: ${nombre}
Carnet / CI: ${carnet}
Celular: ${telefono}
Departamento: ${departamento}

PRODUCTOS:
${detalle}
${textoCanje}
Subtotal: Bs ${subtotal.toFixed(2)}
Descuento por canje: Bs ${montoDescuento.toFixed(2)}
Total: Bs ${total.toFixed(2)}`;

      localStorage.removeItem("carrito");
      setProductos([]);

      window.open(
        `https://wa.me/59169166277?text=${encodeURIComponent(mensaje)}`,
        "_blank"
      );

      mostrarToast("Pedido registrado correctamente", "success");

      setTimeout(() => {
        navigate("/mis-pedidos");
      }, 1000);
    } catch (error) {
      console.error("Error al registrar pedido:", error);
      mostrarToast("No se pudo registrar el pedido: " + error.message, "error");
    } finally {
      setGuardando(false);
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

        <h1 className="titulo-principal">Confirmar pedido</h1>

        <p className="subtitulo">
          Completa tus datos, revisa tus prendas y usa un premio canjeado si
          tienes disponible.
        </p>

        <section className="pedido-confirmacion-grid">
          <div className="pedido-form-card">
            <span className="pedido-label">DATOS DEL CLIENTE</span>
            <h2>Información para el pedido</h2>

            <div className="form-cliente pedido-formulario">
              <input
                type="text"
                placeholder="Nombre completo"
                value={nombre}
                onChange={cambiarNombre}
              />

              {nombre !== "" && !nombreValido && (
                <p className="input-error">
                  El nombre no puede contener números.
                </p>
              )}

              <input
                type="text"
                placeholder="Carnet / CI"
                value={carnet}
                onChange={cambiarCarnet}
              />

              {carnet !== "" && !carnetValido && (
                <p className="input-error">
                  El carnet debe tener 7 a 8 dígitos.
                </p>
              )}

              <input
                type="text"
                placeholder="Celular"
                value={telefono}
                onChange={cambiarTelefono}
              />

              {telefono !== "" && !telefonoValido && (
                <p className="input-error">
                  El celular debe tener exactamente 8 dígitos.
                </p>
              )}

              <select
                value={departamento}
                onChange={(e) => setDepartamento(e.target.value)}
              >
                <option value="">Seleccionar departamento</option>
                <option value="Cochabamba">Cochabamba</option>
                <option value="La Paz">La Paz</option>
                <option value="Santa Cruz">Santa Cruz</option>
                <option value="Oruro">Oruro</option>
                <option value="Potosí">Potosí</option>
                <option value="Chuquisaca">Chuquisaca</option>
                <option value="Tarija">Tarija</option>
                <option value="Beni">Beni</option>
                <option value="Pando">Pando</option>
              </select>
            </div>

            {!carritoValido && (
              <p className="pedido-aviso">
                Tu carrito está vacío. Agrega productos antes de confirmar el
                pedido.
              </p>
            )}

            {carritoValido && !formularioCompleto && (
              <p className="pedido-aviso">
                Completa correctamente todos los campos para habilitar el botón
                de WhatsApp.
              </p>
            )}

            <button
              className={`btn-whatsapp-pedido ${
                formularioCompleto ? "habilitado" : "deshabilitado"
              }`}
              onClick={enviarWhatsApp}
              disabled={!formularioCompleto}
            >
              <img src={whatsapp} alt="WhatsApp" />
              {guardando
                ? "Registrando pedido..."
                : "Confirmar pedido por WhatsApp"}
            </button>
          </div>

          <div className="pedido-resumen-card">
            <span className="pedido-label">RESUMEN DEL PEDIDO</span>
            <h2>Pedido nuevo</h2>
            <p>Estado inicial: Solicitado</p>

            {productos.length === 0 ? (
              <div className="catalogo-mensaje">
                <h2>No hay productos en el carrito</h2>
                <p>Vuelve al catálogo y agrega una prenda.</p>

                <Link to="/catalogo">
                  <button className="btn-cliente">Ver catálogo</button>
                </Link>
              </div>
            ) : (
              <>
                <div className="pedido-productos-lista">
                  {productos.map((producto) => (
                    <div
                      className="pedido-producto-card"
                      key={`${producto.id}-${producto.talla}-${producto.corte}`}
                    >
                      <div className="producto-img-mini">
                        <img
                          src={obtenerImagenProducto(producto.imagen)}
                          alt={producto.nombre}
                          onError={(e) => {
                            e.currentTarget.src = logo;
                          }}
                        />
                      </div>

                      <div className="pedido-producto-info">
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

                      <div className="pedido-producto-precio">
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
                </div>

                <section className="canjes-pedido-box">
                  <span className="pedido-label">PREMIOS CANJEADOS</span>
                  <h2>Usar premio en este pedido</h2>

                  {canjes.length === 0 ? (
                    <div className="catalogo-mensaje">
                      <h2>No tienes premios disponibles</h2>

                      <p>
                        Cuando canjees un premio en la tienda de premios, podrás
                        usarlo aquí.
                      </p>

                      <Link to="/premios">
                        <button className="btn-secundario">Ir a premios</button>
                      </Link>
                    </div>
                  ) : (
                    <div className="canjes-pedido-lista">
                      {canjes.map((canje) => {
                        const seleccionado =
                          canjeSeleccionado?.id === canje.id;

                        return (
                          <div
                            className={
                              seleccionado
                                ? "canje-pedido-card activo"
                                : "canje-pedido-card"
                            }
                            key={canje.id}
                          >
                            <div>
                              <h3>{canje.nombrePremio}</h3>

                              <p>Tipo: {canje.tipo || "Premio"}</p>

                              {normalizar(canje.tipo) === "descuento" ? (
                                <p className="producto-descuento">
                                  {canje.descuento}% de descuento
                                </p>
                              ) : (
                                <p>
                                  Canjea una prenda tipo {canje.tipo}. Debe
                                  estar agregada al carrito.
                                </p>
                              )}
                            </div>

                            <button
                              className={
                                seleccionado ? "btn-secundario" : "btn-cliente"
                              }
                              onClick={() => seleccionarCanje(canje)}
                            >
                              {seleccionado ? "Quitar" : "Usar premio"}
                            </button>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </section>

                <div className="detalle-total-final">
                  <span>Subtotal</span>
                  <strong>Bs {subtotal.toFixed(2)}</strong>
                </div>

                {canjeSeleccionado && (
                  <div className="detalle-total-final descuento-final-box">
                    <span>
                      Premio aplicado: {canjeSeleccionado.nombrePremio}
                    </span>

                    <strong>- Bs {montoDescuento.toFixed(2)}</strong>
                  </div>
                )}

                <div className="detalle-total-final">
                  <span>Total del pedido</span>
                  <strong>Bs {total.toFixed(2)}</strong>
                </div>

                <Link to="/carrito">
                  <button className="btn-secundario btn-full">
                    Volver al carrito
                  </button>
                </Link>
              </>
            )}
          </div>
        </section>

        <FooterCliente />
      </div>

      <Toast mensaje={toast.mensaje} tipo={toast.tipo} />
    </div>
  );
}

export default Pedido;