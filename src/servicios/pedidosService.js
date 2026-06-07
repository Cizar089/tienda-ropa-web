import {
  collection,
  addDoc,
  serverTimestamp,
  doc,
  updateDoc,
  getDocs,
  getDoc,
  query,
  where,
} from "firebase/firestore";

import { db } from "./firebase";

export const registrarPedido = async (pedido) => {
  const pedidoCompleto = {
    ...pedido,
    estado: "Solicitado",
    fechaCreacion: serverTimestamp(),
  };

  const referencia = await addDoc(collection(db, "Pedidos"), pedidoCompleto);

  return referencia.id;
};

export const obtenerPedidos = async () => {
  const pedidosRef = collection(db, "Pedidos");
  const respuesta = await getDocs(pedidosRef);

  return respuesta.docs.map((documento) => ({
    id: documento.id,
    ...documento.data(),
  }));
};

export const obtenerPedidosPorCorreo = async (correoCliente) => {
  const pedidosRef = collection(db, "Pedidos");

  const consulta = query(
    pedidosRef,
    where("correoCliente", "==", correoCliente)
  );

  const respuesta = await getDocs(consulta);

  const pedidos = respuesta.docs.map((documento) => ({
    id: documento.id,
    ...documento.data(),
  }));

  return pedidos.sort((a, b) => {
    const fechaA = a.fechaCreacion?.seconds || 0;
    const fechaB = b.fechaCreacion?.seconds || 0;

    return fechaB - fechaA;
  });
};

export const obtenerPedidoPorId = async (id) => {
  const pedidoRef = doc(db, "Pedidos", id);
  const respuesta = await getDoc(pedidoRef);

  if (!respuesta.exists()) {
    return null;
  }

  return {
    id: respuesta.id,
    ...respuesta.data(),
  };
};

export const actualizarEstadoPedido = async (id, nuevoEstado) => {
  const pedidoRef = doc(db, "Pedidos", id);

  await updateDoc(pedidoRef, {
    estado: nuevoEstado,
    fechaActualizacion: serverTimestamp(),
  });
};