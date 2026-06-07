import {
  doc,
  getDoc,
  setDoc,
  updateDoc,
  serverTimestamp,
} from "firebase/firestore";

import { db } from "./firebase";

export const crearClienteSiNoExiste = async (cliente) => {
  const correoNormalizado = cliente.correo.toLowerCase();

  const clienteRef = doc(db, "Clientes", correoNormalizado);
  const clienteSnap = await getDoc(clienteRef);

  if (!clienteSnap.exists()) {
    await setDoc(clienteRef, {
      nombre: cliente.nombre,
      correo: correoNormalizado,
      foto: cliente.foto || "",
      puntosDisponibles: 0,
      puntosAcumulados: 0,
      puntosUsados: 0,
      fechaRegistro: serverTimestamp(),
    });
  }

  return correoNormalizado;
};

export const obtenerClientePorCorreo = async (correo) => {
  const correoNormalizado = correo.toLowerCase();

  const clienteRef = doc(db, "Clientes", correoNormalizado);
  const clienteSnap = await getDoc(clienteRef);

  if (!clienteSnap.exists()) {
    return null;
  }

  return {
    id: clienteSnap.id,
    ...clienteSnap.data(),
  };
};

export const actualizarPuntosCliente = async (
  correo,
  puntosDisponibles,
  puntosAcumulados,
  puntosUsados
) => {
  const correoNormalizado = correo.toLowerCase();

  const clienteRef = doc(db, "Clientes", correoNormalizado);

  await updateDoc(clienteRef, {
    puntosDisponibles,
    puntosAcumulados,
    puntosUsados,
  });
};