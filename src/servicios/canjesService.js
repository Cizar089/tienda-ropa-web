import {
  collection,
  getDocs,
  doc,
  updateDoc,
  runTransaction,
  serverTimestamp,
} from "firebase/firestore";

import { db } from "./firebase";

export const obtenerCanjesPorCorreo = async (correoCliente) => {
  const correoNormalizado = correoCliente.toLowerCase();

  const canjesRef = collection(db, "Clientes", correoNormalizado, "Canjes");

  const respuesta = await getDocs(canjesRef);

  const canjes = respuesta.docs.map((documento) => ({
    id: documento.id,
    ...documento.data(),
  }));

  return canjes.sort((a, b) => {
    const fechaA = a.fechaCanje?.seconds || 0;
    const fechaB = b.fechaCanje?.seconds || 0;

    return fechaB - fechaA;
  });
};

export const canjearPremioCliente = async (correoCliente, premio) => {
  const correoNormalizado = correoCliente.toLowerCase();

  const clienteRef = doc(db, "Clientes", correoNormalizado);

  await runTransaction(db, async (transaction) => {
    const clienteSnap = await transaction.get(clienteRef);

    if (!clienteSnap.exists()) {
      throw new Error("El cliente no existe");
    }

    const cliente = clienteSnap.data();

    const puntosDisponibles = Number(cliente.puntosDisponibles || 0);
    const puntosUsados = Number(cliente.puntosUsados || 0);
    const puntosNecesarios = Number(premio.puntosNecesarios || 0);

    if (puntosDisponibles < puntosNecesarios) {
      throw new Error("No tienes puntos suficientes");
    }

    const canjeRef = doc(
      collection(db, "Clientes", correoNormalizado, "Canjes")
    );

    const historialRef = doc(
      collection(db, "Clientes", correoNormalizado, "HistorialPuntos")
    );

    transaction.set(canjeRef, {
      premioId: premio.id,
      nombrePremio: premio.nombre,
      tipo: premio.tipo || "Premio",
      descripcion: premio.descripcion || "",
      descuento: Number(premio.descuento || 0),
      puntosUsados: puntosNecesarios,
      estado: "Disponible",
      fechaCanje: serverTimestamp(),
    });

    transaction.set(historialRef, {
      tipo: "Descuento",
      descripcion: `Canje de premio: ${premio.nombre}`,
      puntos: puntosNecesarios,
      fecha: serverTimestamp(),
    });

    transaction.update(clienteRef, {
      puntosDisponibles: puntosDisponibles - puntosNecesarios,
      puntosUsados: puntosUsados + puntosNecesarios,
    });
  });
};

export const marcarCanjeComoUsado = async (correoCliente, canjeId) => {
  const correoNormalizado = correoCliente.toLowerCase();

  const canjeRef = doc(
    db,
    "Clientes",
    correoNormalizado,
    "Canjes",
    canjeId
  );

  await updateDoc(canjeRef, {
    estado: "Usado",
    fechaUso: serverTimestamp(),
  });
};