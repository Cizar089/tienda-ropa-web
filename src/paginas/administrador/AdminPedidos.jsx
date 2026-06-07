import { useEffect, useState } from "react";
import {
  collection,
  getDocs,
  updateDoc,
  deleteDoc,
  doc,
  getDoc,
  increment,
  addDoc
} from "firebase/firestore";
import { db } from "../../servicios/firebase";
import "./AdminPedidos.css";

export default function AdminPedidos() {
  const [pedidos, setPedidos] = useState([]);
  const [busqueda, setBusqueda] = useState("");

  const obtenerPedidos = async () => {
    try {
      const datos = await getDocs(collection(db, "Pedidos"));
      const lista = datos.docs.map((item) => ({
        id: item.id,
        ...item.data()
      }));
      setPedidos(lista);
    } catch (error) {
      console.error("Error al obtener pedidos:", error);
    }
  };

  useEffect(() => {
    obtenerPedidos();
  }, []);

  const sumarPuntosCliente = async (pedido) => {
    const correo = pedido.correoCliente;
    const total = Number(pedido.total || 0);
    const puntosGanados = Math.floor(total / 5);

    if (!correo) {
      alert("El pedido no tiene correo del cliente.");
      return false;
    }

    const clienteRef = doc(db, "Clientes", correo);
    const clienteSnap = await getDoc(clienteRef);

    if (!clienteSnap.exists()) {
      alert("No existe un cliente registrado con ese correo.");
      return false;
    }

    await updateDoc(clienteRef, {
      puntosAcumulados: increment(puntosGanados),
      puntosDisponibles: increment(puntosGanados)
    });

    await updateDoc(doc(db, "Pedidos", pedido.id), {
      puntosAsignadosPedido: true,
      puntosGenerados: puntosGanados
    });

    return true;
  };

  const registrarVenta = async (pedido) => {
    if (pedido.ventaRegistrada === true) {
      return;
    }

    await addDoc(collection(db, "Ventas"), {
      pedidoId: pedido.id,
      nombreCliente: pedido.nombreCliente || "",
      correoCliente: pedido.correoCliente || "",
      telefonoCliente: pedido.telefonoCliente || "",
      departamento: pedido.departamento || "",
      productos: pedido.productos || [],
      total: Number(pedido.total || 0),
      estado: "Completada",
      fecha: new Date().toLocaleString(),
      puntosGenerados: Number(pedido.puntosGenerados || 0)
    });

    await updateDoc(doc(db, "Pedidos", pedido.id), {
      ventaRegistrada: true
    });
  };

  const cambiarEstado = async (pedido, nuevoEstado) => {
    try {
      const yaEstabaConfirmado = pedido.estado === "Confirmado";
      const vaAConfirmado = nuevoEstado === "Confirmado";
      const yaTienePuntos = pedido.puntosAsignadosPedido === true;

      if (vaAConfirmado && !yaEstabaConfirmado && !yaTienePuntos) {
        const puntosOk = await sumarPuntosCliente(pedido);

        if (!puntosOk) {
          return;
        }
      }

      if (nuevoEstado === "Pedido en destino") {
        await registrarVenta(pedido);
      }

      await updateDoc(doc(db, "Pedidos", pedido.id), {
        estado: nuevoEstado
      });

      obtenerPedidos();
      alert("Estado actualizado correctamente");
    } catch (error) {
      console.error("Error al cambiar estado:", error);
      alert("No se pudo cambiar el estado");
    }
  };

  const eliminarPedido = async (id) => {
    if (!confirm("¿Seguro que deseas eliminar este pedido?")) return;

    try {
      await deleteDoc(doc(db, "Pedidos", id));
      obtenerPedidos();
      alert("Pedido eliminado");
    } catch (error) {
      console.error("Error al eliminar:", error);
      alert("No se pudo eliminar");
    }
  };

  const pedidosFiltrados = pedidos.filter((pedido) =>
    pedido.nombreCliente?.toLowerCase().includes(busqueda.toLowerCase()) ||
    pedido.correoCliente?.toLowerCase().includes(busqueda.toLowerCase()) ||
    pedido.estado?.toLowerCase().includes(busqueda.toLowerCase())
  );

  return (
    <div className="admin-pedidos">
      <header className="pedidos-header">
        <div>
          <h1>GESTIÓN DE PEDIDOS</h1>
          <p>{pedidos.length} pedidos registrados</p>
        </div>

        <input
          type="text"
          placeholder="Buscar pedido..."
          value={busqueda}
          onChange={(e) => setBusqueda(e.target.value)}
        />
      </header>

      <div className="tabla-pedidos">
        <table>
          <thead>
            <tr>
              <th>CLIENTE</th>
              <th>CORREO</th>
              <th>TELÉFONO</th>
              <th>DEPTO.</th>
              <th>PRODUCTOS</th>
              <th>TOTAL</th>
              <th>PUNTOS</th>
              <th>ESTADO</th>
              <th>ACCIONES</th>
            </tr>
          </thead>

          <tbody>
            {pedidosFiltrados.map((pedido) => (
              <tr key={pedido.id}>
                <td>{pedido.nombreCliente || "Sin nombre"}</td>
                <td>{pedido.correoCliente || "Sin correo"}</td>
                <td>{pedido.telefonoCliente || "Sin teléfono"}</td>
                <td>{pedido.departamento || "Sin dato"}</td>

                <td>
                  {pedido.productos?.map((producto, index) => (
                    <div className="producto-pedido" key={index}>
                      <strong>{producto.nombre}</strong>
                      <span>Cantidad: {producto.cantidad}</span>
                      <span>Color: {producto.color}</span>
                      <span>Precio: Bs.{producto.precio}</span>
                    </div>
                  ))}
                </td>

                <td>
                  <strong>Bs.{pedido.total}</strong>
                </td>

                <td>
                  {pedido.puntosAsignadosPedido ? (
                    <span className="puntos-ok">
                      +{pedido.puntosGenerados} pts
                    </span>
                  ) : (
                    <span className="puntos-pendiente">Pendiente</span>
                  )}
                </td>

                <td>
                  <select
                    className="estado-select"
                    value={pedido.estado || "Solicitado"}
                    onChange={(e) => cambiarEstado(pedido, e.target.value)}
                  >
                    <option value="Solicitado">Solicitado</option>
                    <option value="Confirmado">Confirmado</option>
                    <option value="Pedido en camino">Pedido en camino</option>
                    <option value="Pedido en destino">Pedido en destino</option>
                  </select>
                </td>

                <td>
                  <button
                    className="btn-eliminar-pedido"
                    onClick={() => eliminarPedido(pedido.id)}
                  >
                    ELIMINAR
                  </button>
                </td>
              </tr>
            ))}

            {pedidosFiltrados.length === 0 && (
              <tr>
                <td colSpan="9" className="sin-pedidos">
                  No hay pedidos registrados
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}