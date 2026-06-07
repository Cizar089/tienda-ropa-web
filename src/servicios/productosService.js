import { collection, getDocs, doc, getDoc } from "firebase/firestore";
import { db } from "./firebase";

export const obtenerProductos = async () => {
  const productosRef = collection(db, "Productos");
  const respuesta = await getDocs(productosRef);

  return respuesta.docs.map((documento) => ({
    id: documento.id,
    ...documento.data(),
  }));
};

export const obtenerProductoPorId = async (id) => {
  const productoRef = doc(db, "Productos", id);
  const respuesta = await getDoc(productoRef);

  if (!respuesta.exists()) {
    return null;
  }

  return {
    id: respuesta.id,
    ...respuesta.data(),
  };
};