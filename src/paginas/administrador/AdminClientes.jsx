import { useEffect, useState } from "react";
import { collection, getDocs } from "firebase/firestore";
import { db } from "../../servicios/firebase";
import "./AdminClientes.css";

export default function AdminClientes() {
  const [clientes, setClientes] = useState([]);
  const [busqueda, setBusqueda] = useState("");

  useEffect(() => {
    cargarClientes();
  }, []);

  const cargarClientes = async () => {
    const datos = await getDocs(collection(db, "Clientes"));

    const lista = datos.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }));

    setClientes(lista);
  };

  const clientesFiltrados = clientes.filter(
    (c) =>
      c.nombre?.toLowerCase().includes(busqueda.toLowerCase()) ||
      c.correo?.toLowerCase().includes(busqueda.toLowerCase())
  );

  return (
    <div className="clientes-container">

      <div className="clientes-header">
        <h1>CLIENTES</h1>

        <input
          type="text"
          placeholder="Buscar cliente..."
          value={busqueda}
          onChange={(e) => setBusqueda(e.target.value)}
        />
      </div>

      <table>
        <thead>
          <tr>
            <th>FOTO</th>
            <th>NOMBRE</th>
            <th>CORREO</th>
            <th>ACUMULADOS</th>
            <th>DISPONIBLES</th>
            <th>USADOS</th>
          </tr>
        </thead>

        <tbody>
          {clientesFiltrados.map((cliente) => (
            <tr key={cliente.id}>

              <td>
                <img
                  src={cliente.foto}
                  alt={cliente.nombre}
                  className="foto-cliente"
                />
              </td>

              <td>{cliente.nombre}</td>

              <td>{cliente.correo}</td>

              <td>{cliente.puntosAcumulados}</td>

              <td>{cliente.puntosDisponibles}</td>

              <td>{cliente.puntosUsados}</td>

            </tr>
          ))}
        </tbody>
      </table>

    </div>
  );
}