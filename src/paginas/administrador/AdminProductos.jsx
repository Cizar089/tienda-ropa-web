import { useEffect, useState } from "react";
import {
  collection,
  addDoc,
  getDocs,
  deleteDoc,
  updateDoc,
  doc
} from "firebase/firestore";
import { db } from "../../servicios/firebase";
import "./AdminProductos.css";
import logo from "../../assets/logo.webp";

export default function AdminProductos() {
  const [productos, setProductos] = useState([]);
  const [tab, setTab] = useState("agregar");
  const [busqueda, setBusqueda] = useState("");
  const [editandoId, setEditandoId] = useState(null);

  const [form, setForm] = useState({
    nombre: "",
    precio: "",
    stock: "",
    color: "",
    descuento: "",
    tipo: "Polera",
    estado: "disponible",
    imagen: "",
    descripcion: ""
  });

  const productosRef = collection(db, "Productos");

  const obtenerProductos = async () => {
    try {
      const datos = await getDocs(productosRef);
      const lista = datos.docs.map((item) => ({
        id: item.id,
        ...item.data()
      }));
      setProductos(lista);
    } catch (error) {
      console.error(error);
    }
  };

  useEffect(() => {
    obtenerProductos();
  }, []);

  const manejarCambio = (e) => {
    const { name, value } = e.target;

    setForm({
      ...form,
      [name]: name === "oferta" ? value === "true" : value
    });
  };

  const limpiarFormulario = () => {
    setForm({
      nombre: "",
      precio: "",
      stock: "",
      color: "",
      descuento: "",
      tipo: "Polera",
      estado: "disponible",
      imagen: "",
      descripcion: ""
    });
    setEditandoId(null);
  };

  const guardarProducto = async (e) => {
    e.preventDefault();

    if (!form.nombre || !form.precio || !form.stock || !form.tipo) {
      alert("Completa los campos principales");
      return;
    }

    const producto = {
      nombre: form.nombre,
      precio: Number(form.precio),
      stock: Number(form.stock),
      color: form.color,
      descuento: Number(form.descuento || 0),
      tipo: form.tipo,
      estado: form.estado,
      oferta: form.estado === "oferta",
      imagen: form.imagen,
      descripcion: form.descripcion
    };

    try {
      if (editandoId) {
        await updateDoc(doc(db, "Productos", editandoId), producto);
        alert("Producto actualizado");
      } else {
        await addDoc(productosRef, producto);
        alert("Producto agregado");
      }

      limpiarFormulario();
      obtenerProductos();
      setTab("productos");
    } catch (error) {
      console.error(error);
      alert("Error: revisa los permisos de Firestore");
    }
  };

  const editarProducto = (producto) => {
    setEditandoId(producto.id);
    setForm({
      nombre: producto.nombre || "",
      precio: producto.precio || "",
      stock: producto.stock || "",
      color: producto.color || "",
      descuento: producto.descuento || "",
      tipo: producto.tipo || "Polera",
      estado: producto.estado || "disponible",
      imagen: producto.imagen || "",
      descripcion: producto.descripcion || ""
    });
    setTab("agregar");
  };

  const eliminarProducto = async (id) => {
    if (!confirm("¿Eliminar producto?")) return;

    try {
      await deleteDoc(doc(db, "Productos", id));
      obtenerProductos();
    } catch (error) {
      console.error(error);
      alert("No se pudo eliminar");
    }
  };

  const obtenerSrcImagen = (imagen) => {
    if (!imagen) return "";

    if (imagen.startsWith("http")) {
      return imagen;
    }

    if (imagen.startsWith("/")) {
      return imagen;
    }

    return `/${imagen}`;
  };

  const productosFiltrados = productos.filter((p) =>
    p.nombre?.toLowerCase().includes(busqueda.toLowerCase()) ||
    p.tipo?.toLowerCase().includes(busqueda.toLowerCase())
  );

  const totalOfertas = productos.filter((p) => p.estado === "oferta").length;
  const totalDescuento = productos.filter((p) => Number(p.descuento) > 0).length;
  const totalAgotados = productos.filter((p) => p.estado === "agotado").length;
  return (
    <div className="admin">
      <header className="topbar">
        <div className="brand">
          <img src={logo} alt="Insignis" className="brand-logo-img" />
          <h1>INSIGNIS</h1>
          <span>ADMIN</span>
        </div>

        <button className="salir">SALIR</button>
      </header>

      <nav className="tabs">
        <button
          className={tab === "agregar" ? "active" : ""}
          onClick={() => setTab("agregar")}
        >
          AGREGAR
        </button>

        <button
          className={tab === "productos" ? "active" : ""}
          onClick={() => setTab("productos")}
        >
          PRODUCTOS
        </button>
      </nav>

      {tab === "agregar" && (
        <main className="agregar">
          <div className="stats">
            <div>
              <p>TOTAL PRODUCTOS</p>
              <h2>{productos.length}</h2>
            </div>

            <div>
              <p>EN OFERTA</p>
              <h2 className="green">{totalOfertas}</h2>
            </div>

            <div>
              <p>CON DESCUENTO</p>
              <h2 className="orange">{totalDescuento}</h2>
            </div>
          </div>

          <form className="formulario" onSubmit={guardarProducto}>
            <div>
              <label>NOMBRE</label>
              <input
                name="nombre"
                value={form.nombre}
                onChange={manejarCambio}
                placeholder="Ej: Hoodie Classic"
              />
            </div>

            <div>
              <label>PRECIO (Bs.)</label>
              <input
                type="number"
                name="precio"
                value={form.precio}
                onChange={manejarCambio}
                placeholder="0"
              />
            </div>

            <div>
              <label>DESCUENTO (%)</label>
              <input
                type="number"
                name="descuento"
                value={form.descuento}
                onChange={manejarCambio}
                placeholder="0"
              />
            </div>

            <div>
              <label>TIPO DE PRENDA</label>
              <select name="tipo" value={form.tipo} onChange={manejarCambio}>
                <option value="Polera">Polera</option>
                <option value="Pantalon">Pantalon</option>
                <option value="Hoodie">Hoodie</option>
                <option value="Chaqueta">Chaqueta</option>
                <option value="Gorra">Gorra</option>
              </select>
            </div>

            <div>
              <label>STOCK</label>
              <input
                type="number"
                name="stock"
                value={form.stock}
                onChange={manejarCambio}
                placeholder="22"
              />
            </div>

            <div>
              <label>COLOR</label>
              <input
                name="color"
                value={form.color}
                onChange={manejarCambio}
                placeholder="Negro, blanco, azul..."
              />
            </div>

            <div>
              <label>ESTADO</label>
                <select name="estado" value={form.estado} onChange={manejarCambio}>
                    <option value="disponible">Disponible</option>
                    <option value="agotado">Agotado</option>
                    <option value="oferta">En oferta</option>
                </select>
            </div>

            <div className="full">
              <label>IMAGEN (URL o ruta)</label>
              <input
                name="imagen"
                value={form.imagen}
                onChange={manejarCambio}
                placeholder="imagenes/producto.webp"
              />
            </div>

            <div className="preview">
              {form.imagen ? (
                <img src={obtenerSrcImagen(form.imagen)} alt="Vista previa" />
              ) : (
                <span>Vista previa</span>
              )}
            </div>

            <div className="full">
              <label>DESCRIPCIÓN</label>
              <textarea
                name="descripcion"
                value={form.descripcion}
                onChange={manejarCambio}
                placeholder="Descripción del producto..."
              />
            </div>

            <button className="guardar">
              {editandoId ? "ACTUALIZAR PRODUCTO" : "AGREGAR PRODUCTO"}
            </button>
          </form>
        </main>
      )}

      {tab === "productos" && (
        <main className="productos">
          <div className="productos-head">
            <div>
              <h2>PRODUCTOS</h2>
              <p>{productos.length} productos</p>
            </div>

            <input
              value={busqueda}
              onChange={(e) => setBusqueda(e.target.value)}
              placeholder="Buscar producto..."
            />
          </div>

          <div className="tabla">
            <table>
              <thead>
                <tr>
                  <th>IMG</th>
                  <th>NOMBRE</th>
                  <th>TIPO</th>
                  <th>PRECIO</th>
                  <th>DESCUENTO</th>
                  <th>ESTADO</th>
                  <th>ACCIONES</th>
                </tr>
              </thead>

              <tbody>
                {productosFiltrados.map((p) => (
                  <tr key={p.id}>
                    <td>
                      {p.imagen ? (
                        <img
                          className="img-producto"
                          src={obtenerSrcImagen(p.imagen)}
                          alt={p.nombre}
                        />
                      ) : (
                        <div className="sin-img">IMG</div>
                      )}
                    </td>

                    <td className="nombre">{p.nombre}</td>

                    <td>
                      <span className="tag">{p.tipo}</span>
                    </td>

                    <td>
                      {Number(p.descuento) > 0 && <small>Bs.{p.precio}</small>}
                      <b>
                        Bs.
                        {Number(p.descuento) > 0
                          ? Math.round(
                              Number(p.precio) -
                                (Number(p.precio) * Number(p.descuento)) / 100
                            )
                          : p.precio}
                      </b>
                    </td>

                    <td>
                      <span className="descuento">-{p.descuento || 0}%</span>
                    </td>

                    <td>
                        <span className={`estado ${p.estado}`}>
                        {p.estado === "oferta"
                            ? "OFERTA"
                            : p.estado === "agotado"
                            ? "AGOTADO"
                            : "DISPONIBLE"}
                        </span>
                    </td>

                    <td>
                      <button className="editar" onClick={() => editarProducto(p)}>
                        EDITAR
                      </button>

                      <button
                        className="eliminar"
                        onClick={() => eliminarProducto(p.id)}
                      >
                        ELIMINAR
                      </button>
                    </td>
                  </tr>
                ))}

                {productosFiltrados.length === 0 && (
                  <tr>
                    <td colSpan="7" className="vacio">
                      No hay productos registrados
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </main>
      )}
    </div>
  );
}