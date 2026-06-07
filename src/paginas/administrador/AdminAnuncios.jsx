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
import "./AdminAnuncios.css";

export default function AdminAnuncios() {
  const [anuncios, setAnuncios] = useState([]);
  const [editandoId, setEditandoId] = useState(null);

  const [form, setForm] = useState({
    titulo: "",
    descripcion: "",
    activo: true
  });

  const cargarAnuncios = async () => {
    const datos = await getDocs(collection(db, "Anuncios"));
    const lista = datos.docs.map((d) => ({
      id: d.id,
      ...d.data()
    }));
    setAnuncios(lista);
  };

  useEffect(() => {
    cargarAnuncios();
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
      titulo: "",
      descripcion: "",
      activo: true
    });
    setEditandoId(null);
  };

  const guardarAnuncio = async (e) => {
    e.preventDefault();

    if (!form.titulo || !form.descripcion) {
      alert("Completa título y descripción");
      return;
    }

    const anuncio = {
      titulo: form.titulo,
      descripcion: form.descripcion,
      activo: form.activo
    };

    if (editandoId) {
      await updateDoc(doc(db, "Anuncios", editandoId), anuncio);
      alert("Anuncio actualizado");
    } else {
      await addDoc(collection(db, "Anuncios"), anuncio);
      alert("Anuncio agregado");
    }

    limpiar();
    cargarAnuncios();
  };

  const editarAnuncio = (anuncio) => {
    setEditandoId(anuncio.id);
    setForm({
      titulo: anuncio.titulo || "",
      descripcion: anuncio.descripcion || "",
      activo: anuncio.activo ?? true
    });
  };

  const eliminarAnuncio = async (id) => {
    if (!confirm("¿Eliminar anuncio?")) return;

    await deleteDoc(doc(db, "Anuncios", id));
    cargarAnuncios();
  };

  return (
    <div className="admin-anuncios">
      <header className="anuncios-header">
        <div>
          <p>INSIGNIS STORE / COMUNICADOS</p>
          <h1>GESTIÓN DE ANUNCIOS</h1>
        </div>
      </header>

      <section className="anuncios-layout">
        <form className="anuncios-form" onSubmit={guardarAnuncio}>
          <h2>{editandoId ? "Editar anuncio" : "Nuevo anuncio"}</h2>

          <label>TÍTULO</label>
          <input
            name="titulo"
            value={form.titulo}
            onChange={manejarCambio}
            placeholder="Ej: Nuevo Drop Insignis"
          />

          <label>DESCRIPCIÓN</label>
          <textarea
            name="descripcion"
            value={form.descripcion}
            onChange={manejarCambio}
            placeholder="Escribe el anuncio..."
          />

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

        <div className="anuncios-lista">
          <h2>Anuncios publicados</h2>

          <div className="anuncios-grid">
            {anuncios.map((anuncio) => (
              <div className="anuncio-card" key={anuncio.id}>
                <div className="anuncio-info">
                  <span className={anuncio.activo ? "estado activo" : "estado inactivo"}>
                    {anuncio.activo ? "ACTIVO" : "INACTIVO"}
                  </span>

                  <h3>{anuncio.titulo}</h3>
                  <p>{anuncio.descripcion}</p>

                  <div className="acciones-anuncio">
                    <button onClick={() => editarAnuncio(anuncio)}>EDITAR</button>
                    <button
                      className="eliminar"
                      onClick={() => eliminarAnuncio(anuncio.id)}
                    >
                      ELIMINAR
                    </button>
                  </div>
                </div>
              </div>
            ))}

            {anuncios.length === 0 && (
              <p className="vacio">No hay anuncios registrados.</p>
            )}
          </div>
        </div>
      </section>
    </div>
  );
}