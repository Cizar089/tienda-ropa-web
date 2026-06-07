import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { collection, getDocs } from "firebase/firestore";
import { db } from "../../servicios/firebase";
import "./AdminDashboard.css";

export default function AdminDashboard() {
  const [productos, setProductos] = useState([]);
  const [pedidos, setPedidos] = useState([]);
  const [clientes, setClientes] = useState([]);
  const [ventas, setVentas] = useState([]);
  const [premios, setPremios] = useState([]);
  const [anuncios, setAnuncios] = useState([]);

  useEffect(() => {
    cargarDatos();
  }, []);

  const cargarColeccion = async (nombreColeccion) => {
    const snap = await getDocs(collection(db, nombreColeccion));
    return snap.docs.map((d) => ({ id: d.id, ...d.data() }));
  };

  const cargarDatos = async () => {
    try {
      setProductos(await cargarColeccion("Productos"));
      setPedidos(await cargarColeccion("Pedidos"));
      setClientes(await cargarColeccion("Clientes"));
      setVentas(await cargarColeccion("Ventas"));
      setPremios(await cargarColeccion("Premios"));
      setAnuncios(await cargarColeccion("Anuncios"));
    } catch (error) {
      console.error("Error al cargar panel:", error);
    }
  };

  const pedidosSolicitados = pedidos.filter((p) => p.estado === "Solicitado").length;
  const pedidosConfirmados = pedidos.filter((p) => p.estado === "Confirmado").length;
  const pedidosCamino = pedidos.filter((p) => p.estado === "Pedido en camino").length;
  const pedidosDestino = pedidos.filter((p) => p.estado === "Pedido en destino").length;

  const productosConStock = productos.filter((p) => p.stock !== undefined);
  const productosBajoStock = productosConStock.filter((p) => Number(p.stock) <= 5).length;

  const productosOferta = productos.filter(
    (p) => p.estado === "oferta" || p.oferta === true
  ).length;

  const ventasTotal = ventas.reduce(
    (acc, venta) => acc + Number(venta.total || 0),
    0
  );

  const puntosTotales = clientes.reduce(
    (acc, cliente) => acc + Number(cliente.puntosAcumulados || 0),
    0
  );

  return (
    <div className="nasa-dashboard">
      <header className="nasa-header">
        <div>
          <p className="nasa-subtitle">INSIGNIS STORE / ADMIN CONTROL</p>
          <h1>PANEL CENTRAL</h1>
        </div>

        <div className="nasa-status">
          <span></span>
          SISTEMA ONLINE
        </div>
      </header>

      <nav className="nasa-nav">
        <Link to="/admin/productos">📦 Productos</Link>
        <Link to="/admin/pedidos">🛒 Pedidos</Link>
        <Link to="/admin/clientes">👥 Clientes</Link>
        <Link to="/admin/premios">🎁 Premios</Link>
        <Link to="/admin/anuncios">📢 Anuncios</Link>
        <Link to="/admin/reportes">📈 Reportes PDF</Link>
        <Link to="/login">🚪 Salir</Link>
      </nav>

      <section className="nasa-grid">
        <div className="nasa-card">
          <p>PRODUCTOS</p>
          <h2>{productos.length}</h2>
          <span>Inventario registrado</span>
        </div>

        <div className="nasa-card warning">
          <p>BAJO STOCK</p>
          <h2>{productosBajoStock}</h2>
          <span>Productos críticos</span>
        </div>

        <div className="nasa-card orange">
          <p>EN OFERTA</p>
          <h2>{productosOferta}</h2>
          <span>Promociones activas</span>
        </div>

        <div className="nasa-card blue">
          <p>PEDIDOS</p>
          <h2>{pedidos.length}</h2>
          <span>Total registrados</span>
        </div>

        <div className="nasa-card green">
          <p>CONFIRMADOS</p>
          <h2>{pedidosConfirmados}</h2>
          <span>Compras aprobadas</span>
        </div>

        <div className="nasa-card cyan">
          <p>CLIENTES</p>
          <h2>{clientes.length}</h2>
          <span>Usuarios registrados</span>
        </div>

        <div className="nasa-card money">
          <p>VENTAS</p>
          <h2>Bs. {ventasTotal}</h2>
          <span>Total confirmado</span>
        </div>

        <div className="nasa-card purple">
          <p>PUNTOS</p>
          <h2>{puntosTotales}</h2>
          <span>Puntos entregados</span>
        </div>
      </section>

      <section className="nasa-panels">
        <div className="nasa-panel">
          <h3>CONTROL DE PEDIDOS</h3>

          <div className="mission-row">
            <span>Solicitados</span>
            <b>{pedidosSolicitados}</b>
          </div>

          <div className="mission-row">
            <span>Confirmados</span>
            <b>{pedidosConfirmados}</b>
          </div>

          <div className="mission-row">
            <span>Pedido en camino</span>
            <b>{pedidosCamino}</b>
          </div>

          <div className="mission-row">
            <span>Pedido en destino</span>
            <b>{pedidosDestino}</b>
          </div>
        </div>

        <div className="nasa-panel">
          <h3>ÚLTIMOS PEDIDOS</h3>

          {pedidos.slice(0, 5).map((pedido) => (
            <div className="nasa-row" key={pedido.id}>
              <div>
                <strong>{pedido.nombreCliente || "Cliente"}</strong>
                <p>{pedido.correoCliente || "Sin correo"}</p>
              </div>
              <span>{pedido.estado || "Solicitado"}</span>
              <b>Bs. {pedido.total || 0}</b>
            </div>
          ))}

          {pedidos.length === 0 && (
            <p className="empty">No hay pedidos registrados.</p>
          )}
        </div>

        <div className="nasa-panel">
          <h3>PRODUCTOS BAJO STOCK</h3>

          {productosConStock
            .filter((p) => Number(p.stock) <= 5)
            .slice(0, 5)
            .map((producto) => (
              <div className="nasa-row" key={producto.id}>
                <div>
                  <strong>{producto.nombre}</strong>
                  <p>{producto.tipo}</p>
                </div>
                <span className="danger">STOCK {producto.stock}</span>
              </div>
            ))}

          {productosBajoStock === 0 && (
            <p className="empty">No hay productos con bajo stock.</p>
          )}
        </div>

        <div className="nasa-panel">
          <h3>MÓDULOS ACTIVOS</h3>

          <div className="mission-row">
            <span>Premios disponibles</span>
            <b>{premios.length}</b>
          </div>

          <div className="mission-row">
            <span>Anuncios publicados</span>
            <b>{anuncios.length}</b>
          </div>

          <div className="mission-row">
            <span>Productos en oferta</span>
            <b>{productosOferta}</b>
          </div>

          <div className="mission-row">
            <span>Puntos entregados</span>
            <b>{puntosTotales}</b>
          </div>
        </div>
      </section>
    </div>
  );
}