import { useEffect, useState } from "react";
import {
  collection,
  addDoc,
  getDocs,
  updateDoc,
  deleteDoc,
  doc
} from "firebase/firestore";
import { db } from "../../servicios/firebase";
import "./AdminPremios.css";

export default function AdminPremios() {
  const [premios, setPremios] = useState([]);
  const [editandoId, setEditandoId] = useState(null);

  const [form, setForm] = useState({
    nombre: "",
    descripcion: "",
    puntosNecesarios: "",
    tipo: "descuento",
    activo: true
  });

  const cargarPremios = async () => {
    const datos = await getDocs(collection(db, "Premios"));
    const lista = datos.docs.map((d) => ({
      id: d.id,
      ...d.data()
    }));
    setPremios(lista);
  };

  useEffect(() => {
    cargarPremios();
  }, []);

  const manejarCambio = (e) => {
    const { name, value } = e.target;

    setForm({
      ...form,
      [name]: name === "activo" ? value === "true" : value
    });
  };

  const limpiar = () => {
    setForm({
      nombre: "",
      descripcion: "",
      puntosNecesarios: "",
      tipo: "descuento",
      activo: true
    });
    setEditandoId(null);
  };

  const guardarPremio = async (e) => {
    e.preventDefault();

    if (!form.nombre || !form.puntosNecesarios || !form.tipo) {
      alert("Completa los campos principales");
      return;
    }

    const premio = {
      nombre: form.nombre,
      descripcion: form.descripcion,
      puntosNecesarios: Number(form.puntosNecesarios),
      tipo: form.tipo,
      activo: form.activo
    };

    if (editandoId) {
      await updateDoc(doc(db, "Premios", editandoId), premio);
      alert("Premio actualizado");
    } else {
      await addDoc(collection(db, "Premios"), premio);
      alert("Premio agregado");
    }

    limpiar();
    cargarPremios();
  };

  const editarPremio = (premio) => {
    setEditandoId(premio.id);
    setForm({
      nombre: premio.nombre || "",
      descripcion: premio.descripcion || "",
      puntosNecesarios: premio.puntosNecesarios || "",
      tipo: premio.tipo || "descuento",
      activo: premio.activo ?? true
    });
  };

  const eliminarPremio = async (id) => {
    if (!confirm("¿Eliminar premio?")) return;

    await deleteDoc(doc(db, "Premios", id));
    cargarPremios();
  };

  return (
    <div className="admin-premios">
      <header className="premios-header">
        <p>INSIGNIS STORE / RECOMPENSAS</p>
        <h1>GESTIÓN DE PREMIOS</h1>
      </header>

      <section className="premios-layout">
        <form className="premios-form" onSubmit={guardarPremio}>
          <h2>{editandoId ? "Editar premio" : "Nuevo premio"}</h2>

          <label>NOMBRE</label>
          <input
            name="nombre"
            value={form.nombre}
            onChange={manejarCambio}
            placeholder="Ej: Descuento 10%"
          />

          <label>DESCRIPCIÓN</label>
          <textarea
            name="descripcion"
            value={form.descripcion}
            onChange={manejarCambio}
            placeholder="Descripción del premio..."
          />

          <label>PUNTOS NECESARIOS</label>
          <input
            type="number"
            name="puntosNecesarios"
            value={form.puntosNecesarios}
            onChange={manejarCambio}
            placeholder="100"
          />

          <label>TIPO</label>
          <select name="tipo" value={form.tipo} onChange={manejarCambio}>
            <option value="descuento">Descuento</option>
            <option value="gorra">Gorra</option>
            <option value="polera">Polera</option>
            <option value="pantalon">Pantalón</option>
          </select>

          <label>ESTADO</label>
          <select name="activo" value={form.activo} onChange={manejarCambio}>
            <option value="true">Activo</option>
            <option value="false">Inactivo</option>
          </select>

          <button>{editandoId ? "ACTUALIZAR" : "AGREGAR"}</button>

          {editandoId && (
            <button type="button" className="cancelar" onClick={limpiar}>
              CANCELAR
            </button>
          )}
        </form>

        <div className="premios-lista">
          <h2>Premios disponibles</h2>

          <div className="premios-grid">
            {premios.map((premio) => (
              <div className="premio-card" key={premio.id}>
                <span className={premio.activo ? "estado activo" : "estado inactivo"}>
                  {premio.activo ? "ACTIVO" : "INACTIVO"}
                </span>

                <h3>{premio.nombre}</h3>
                <p>{premio.descripcion}</p>

                <strong>{premio.puntosNecesarios} puntos</strong>
                <small>{premio.tipo}</small>

                <div className="acciones-premio">
                  <button onClick={() => editarPremio(premio)}>EDITAR</button>
                  <button
                    className="eliminar"
                    onClick={() => eliminarPremio(premio.id)}
                  >
                    ELIMINAR
                  </button>
                </div>
              </div>
            ))}

            {premios.length === 0 && (
              <p className="vacio">No hay premios registrados.</p>
            )}
          </div>
        </div>
      </section>
    </div>
  );
}