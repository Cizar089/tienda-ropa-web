import {
  collection,
  getDocs,
  addDoc,
  serverTimestamp,
} from "firebase/firestore";

import { db } from "./firebase";

export const obtenerHistorialPuntosPorCorreo = async (correoCliente) => {
  const correoNormalizado = correoCliente.toLowerCase();

  const historialRef = collection(
    db,
    "Clientes",
    correoNormalizado,
    "HistorialPuntos"
  );

  const respuesta = await getDocs(historialRef);

  const historial = respuesta.docs.map((documento) => ({
    id: documento.id,
    ...documento.data(),
  }));

  return historial.sort((a, b) => {
    const fechaA = a.fecha?.seconds || 0;
    const fechaB = b.fecha?.seconds || 0;

    return fechaB - fechaA;
  });
};

export const registrarMovimientoPuntos = async (
  correoCliente,
  movimiento
) => {
  const correoNormalizado = correoCliente.toLowerCase();

  const historialRef = collection(
    db,
    "Clientes",
    correoNormalizado,
    "HistorialPuntos"
  );

  await addDoc(historialRef, {
    ...movimiento,
    fecha: serverTimestamp(),
  });
};