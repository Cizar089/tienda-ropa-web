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
    imagen: "",
    activo: true,
    fecha: new Date().toISOString().slice(0, 10)
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
      imagen: "",
      activo: true,
      fecha: new Date().toISOString().slice(0, 10)
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
      imagen: form.imagen,
      activo: form.activo,
      fecha: form.fecha
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
      imagen: anuncio.imagen || "",
      activo: anuncio.activo ?? true,
      fecha: anuncio.fecha || new Date().toISOString().slice(0, 10)
    });
  };

  const eliminarAnuncio = async (id) => {
    if (!confirm("¿Eliminar anuncio?")) return;

    await deleteDoc(doc(db, "Anuncios", id));
    cargarAnuncios();
  };

  const obtenerImagen = (imagen) => {
    if (!imagen) return "";
    if (imagen.startsWith("http")) return imagen;
    if (imagen.startsWith("/")) return imagen;
    return `/${imagen}`;
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

          <label>IMAGEN</label>
          <input
            name="imagen"
            value={form.imagen}
            onChange={manejarCambio}
            placeholder="imagenes/anuncio1.webp"
          />

          <label>FECHA</label>
          <input
            type="date"
            name="fecha"
            value={form.fecha}
            onChange={manejarCambio}
          />

          <label>ESTADO</label>
          <select name="activo" value={form.activo} onChange={manejarCambio}>
            <option value="true">Activo</option>
            <option value="false">Inactivo</option>
          </select>

          <div className="preview-anuncio">
            {form.imagen ? (
              <img src={obtenerImagen(form.imagen)} alt="preview" />
            ) : (
              <span>Vista previa</span>
            )}
          </div>

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
                {anuncio.imagen ? (
                  <img src={obtenerImagen(anuncio.imagen)} alt={anuncio.titulo} />
                ) : (
                  <div className="sin-imagen">IMG</div>
                )}

                <div className="anuncio-info">
                  <span className={anuncio.activo ? "estado activo" : "estado inactivo"}>
                    {anuncio.activo ? "ACTIVO" : "INACTIVO"}
                  </span>

                  <h3>{anuncio.titulo}</h3>
                  <p>{anuncio.descripcion}</p>
                  <small>{anuncio.fecha}</small>

                  <div className="acciones-anuncio">
                    <button onClick={() => editarAnuncio(anuncio)}>EDITAR</button>
                    <button className="eliminar" onClick={() => eliminarAnuncio(anuncio.id)}>
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