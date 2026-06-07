import { useState } from "react";
import { collection, getDocs } from "firebase/firestore";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import { db } from "../../servicios/firebase";
import "./AdminReportes.css";

export default function AdminReportes() {
  const [cargando, setCargando] = useState(false);

  const obtenerDatos = async (coleccion) => {
    const datos = await getDocs(collection(db, coleccion));
    return datos.docs.map((d) => ({
      id: d.id,
      ...d.data()
    }));
  };

  const crearPDF = (titulo, columnas, filas, nombreArchivo) => {
    const doc = new jsPDF();

    doc.setFontSize(18);
    doc.text("INSIGNIS STORE", 14, 18);

    doc.setFontSize(13);
    doc.text(titulo, 14, 28);

    doc.setFontSize(10);
    doc.text(`Fecha: ${new Date().toLocaleDateString()}`, 14, 36);

    autoTable(doc, {
      startY: 45,
      head: [columnas],
      body: filas,
      styles: {
        fontSize: 8
      },
      headStyles: {
        fillColor: [10, 20, 40]
      }
    });

    doc.save(nombreArchivo);
  };

  const reportePedidos = async () => {
    setCargando(true);

    const pedidos = await obtenerDatos("Pedidos");

    crearPDF(
      "Reporte de pedidos",
      ["Cliente", "Correo", "Teléfono", "Departamento", "Estado", "Total"],
      pedidos.map((p) => [
        p.nombreCliente || "Sin nombre",
        p.correoCliente || "Sin correo",
        p.telefonoCliente || "Sin teléfono",
        p.departamento || "Sin dato",
        p.estado || "Solicitado",
        `Bs. ${p.total || 0}`
      ]),
      "reporte_pedidos.pdf"
    );

    setCargando(false);
  };

  const reporteProductos = async () => {
    setCargando(true);

    const productos = await obtenerDatos("Productos");

    crearPDF(
      "Reporte de productos",
      ["Nombre", "Tipo", "Color", "Stock", "Precio", "Descuento", "Estado"],
      productos.map((p) => [
        p.nombre || "",
        p.tipo || "",
        p.color || "",
        p.stock || 0,
        `Bs. ${p.precio || 0}`,
        `${p.descuento || 0}%`,
        p.estado || ""
      ]),
      "reporte_productos.pdf"
    );

    setCargando(false);
  };

  const reporteBajoStock = async () => {
    setCargando(true);

    const productos = await obtenerDatos("Productos");
    const bajoStock = productos.filter((p) => Number(p.stock || 0) <= 5);

    crearPDF(
      "Reporte de productos con bajo stock",
      ["Nombre", "Tipo", "Color", "Stock", "Precio", "Estado"],
      bajoStock.map((p) => [
        p.nombre || "",
        p.tipo || "",
        p.color || "",
        p.stock || 0,
        `Bs. ${p.precio || 0}`,
        p.estado || ""
      ]),
      "reporte_bajo_stock.pdf"
    );

    setCargando(false);
  };

  const reporteClientes = async () => {
    setCargando(true);

    const clientes = await obtenerDatos("Clientes");

    crearPDF(
      "Reporte de clientes y puntos",
      ["Nombre", "Correo", "Acumulados", "Disponibles", "Usados"],
      clientes.map((c) => [
        c.nombre || "",
        c.correo || c.id || "",
        c.puntosAcumulados || 0,
        c.puntosDisponibles || 0,
        c.puntosUsados || 0
      ]),
      "reporte_clientes.pdf"
    );

    setCargando(false);
  };

  const reportePremios = async () => {
    setCargando(true);

    const premios = await obtenerDatos("Premios");

    crearPDF(
      "Reporte de premios disponibles",
      ["Nombre", "Tipo", "Puntos", "Activo", "Descripción"],
      premios.map((p) => [
        p.nombre || "",
        p.tipo || "",
        p.puntosNecesarios || 0,
        p.activo ? "Activo" : "Inactivo",
        p.descripcion || ""
      ]),
      "reporte_premios.pdf"
    );

    setCargando(false);
  };

  const reporteVentas = async () => {
    setCargando(true);

    const ventas = await obtenerDatos("Ventas");

    crearPDF(
      "Reporte de ventas",
      ["Cliente", "Correo", "Total", "Estado", "Fecha"],
      ventas.map((v) => [
        v.nombre || v.nombreCliente || "",
        v.correo || v.correoCliente || "",
        `Bs. ${v.total || 0}`,
        v.estado || "completada",
        v.fecha || ""
      ]),
      "reporte_ventas.pdf"
    );

    setCargando(false);
  };

  return (
    <div className="admin-reportes">
      <header className="reportes-header">
        <p>INSIGNIS STORE / CONTROL ADMINISTRATIVO</p>
        <h1>REPORTES PDF</h1>
      </header>

      <section className="reportes-grid">
        <button onClick={reportePedidos}>Reporte de pedidos</button>
        <button onClick={reporteProductos}>Reporte de productos</button>
        <button onClick={reporteBajoStock}>Productos bajo stock</button>
        <button onClick={reporteClientes}>Reporte de clientes</button>
        <button onClick={reportePremios}>Reporte de premios</button>
        <button onClick={reporteVentas}>Reporte de ventas</button>
      </section>

      {cargando && <p className="cargando">Generando PDF...</p>}
    </div>
  );
}