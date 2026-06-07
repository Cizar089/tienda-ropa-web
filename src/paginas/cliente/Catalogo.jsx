import { Link } from "react-router-dom";
import { useEffect, useState } from "react";
import "./Cliente.css";
import logo from "../../assets/logo.webp";
import FooterCliente from "../../componentes/cliente/FooterCliente";
import { obtenerProductos } from "../../servicios/productosService";

function Catalogo() {
  const [productos, setProductos] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [filtrosAbiertos, setFiltrosAbiertos] = useState(false);

  const [busqueda, setBusqueda] = useState("");
  const [tipo, setTipo] = useState("");
  const [color, setColor] = useState("");
  const [precio, setPrecio] = useState("");
  const [soloOfertas, setSoloOfertas] = useState(false);

  useEffect(() => {
    const cargarProductos = async () => {
      try {
        const datos = await obtenerProductos();
        setProductos(datos);
      } catch (error) {
        console.error("Error al cargar productos:", error);
      } finally {
        setCargando(false);
      }
    };

    cargarProductos();
  }, []);

  const obtenerImagenProducto = (imagen) => {
    if (!imagen) return logo;
    if (imagen.startsWith("http")) return imagen;
    return `/${imagen}`;
  };

  const filtrosActivos =
    busqueda !== "" || tipo !== "" || color !== "" || precio !== "" || soloOfertas;

  const limpiarFiltros = () => {
    setBusqueda("");
    setTipo("");
    setColor("");
    setPrecio("");
    setSoloOfertas(false);
  };

  const productosFiltrados = productos.filter((producto) => {
    const nombreProducto = producto.nombre || "";
    const tipoProducto = producto.tipo || "";
    const colorProducto = producto.color || "";
    const precioProducto = Number(producto.precio || 0);
    const descuentoProducto = Number(producto.descuento || 0);

    const coincideBusqueda = nombreProducto
      .toLowerCase()
      .includes(busqueda.toLowerCase());

    const coincideTipo = tipo === "" || tipoProducto === tipo;
    const coincideColor = color === "" || colorProducto === color;
    const coincideOferta =
      !soloOfertas || producto.oferta === true || descuentoProducto > 0;

    let coincidePrecio = true;
    if (precio === "menor100") coincidePrecio = precioProducto < 100;
    if (precio === "100a200")  coincidePrecio = precioProducto >= 100 && precioProducto <= 200;
    if (precio === "mayor200") coincidePrecio = precioProducto > 200;

    return coincideBusqueda && coincideTipo && coincideColor && coincideOferta && coincidePrecio;
  });

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

        <h1 className="titulo-principal">Catálogo</h1>

        <p className="subtitulo">
          Busca prendas por tipo, color, precio, descuento y disponibilidad.
        </p>

        {/* Botón para abrir/cerrar filtros */}
        <div className="filtros-toggle-row">
          <button
            className="btn-filtros-toggle"
            onClick={() => setFiltrosAbiertos(!filtrosAbiertos)}
          >
            <span>{filtrosAbiertos ? "✕ Cerrar filtros" : "⚙ Filtros"}</span>
            {filtrosActivos && !filtrosAbiertos && (
              <span className="filtros-badge">activos</span>
            )}
          </button>

          {filtrosActivos && (
            <button className="btn-limpiar-filtros" onClick={limpiarFiltros}>
              Limpiar filtros
            </button>
          )}
        </div>

        {/* Panel de filtros colapsable */}
        <div className={`filtros-panel ${filtrosAbiertos ? "filtros-panel-abierto" : ""}`}>
          <div className="filtros">
            <input
              type="text"
              placeholder="Buscar producto"
              value={busqueda}
              onChange={(e) => setBusqueda(e.target.value)}
            />

            <select value={tipo} onChange={(e) => setTipo(e.target.value)}>
              <option value="">Todos los tipos</option>
              <option value="Polera">Poleras</option>
              <option value="Canguro">Canguros</option>
              <option value="Sudadera">Sudaderas</option>
              <option value="Pantalon">Pantalones</option>
              <option value="Gorra">Gorras</option>
              <option value="Accesorio">Accesorios</option>
            </select>

            <select value={color} onChange={(e) => setColor(e.target.value)}>
              <option value="">Todos los colores</option>
              <option value="Negro">Negro</option>
              <option value="Blanco">Blanco</option>
              <option value="Rojo">Rojo</option>
              <option value="Azul">Azul</option>
              <option value="Gris">Gris</option>
              <option value="Verde">Verde</option>
            </select>

            <select value={precio} onChange={(e) => setPrecio(e.target.value)}>
              <option value="">Todos los precios</option>
              <option value="menor100">Menor a Bs 100</option>
              <option value="100a200">Bs 100 a Bs 200</option>
              <option value="mayor200">Mayor a Bs 200</option>
            </select>

            <label className="check-oferta">
              <input
                type="checkbox"
                checked={soloOfertas}
                onChange={(e) => setSoloOfertas(e.target.checked)}
              />
              Solo ofertas
            </label>
          </div>
        </div>

        {cargando ? (
          <div className="catalogo-mensaje">
            <h2>Cargando productos...</h2>
          </div>
        ) : productosFiltrados.length === 0 ? (
          <div className="catalogo-mensaje">
            <h2>No hay productos disponibles</h2>
            <p>Intenta cambiar los filtros o revisar más tarde.</p>
          </div>
        ) : (
          <div className="grid-productos">
            {productosFiltrados.map((producto) => (
              <div className="card" key={producto.id}>
                <div className="card-img">
                  <img
                    src={obtenerImagenProducto(producto.imagen)}
                    alt={producto.nombre}
                    onError={(e) => { e.currentTarget.src = logo; }}
                  />
                </div>

                <div className="producto-tags">
                  <span className="pedido-label">{producto.tipo}</span>
                  {(producto.oferta === true || producto.descuento > 0) && (
                    <span className="tag-oferta">Oferta</span>
                  )}
                </div>

                <h3>{producto.nombre}</h3>
                <p>{producto.descripcion}</p>
                <p>Color: {producto.color || "Sin color"}</p>
                <p>Estado: {producto.estado || "Disponible"}</p>

                {producto.descuento > 0 && (
                  <p className="producto-descuento">
                    {producto.descuento}% de descuento
                  </p>
                )}

                <p className="precio">Bs {producto.precio}</p>

                <Link to={`/detalle-producto/${producto.id}`}>
                  <button className="btn-cliente">Ver detalle</button>
                </Link>
              </div>
            ))}
          </div>
        )}

        <FooterCliente />
      </div>
    </div>
  );
}

export default Catalogo;
