import { collection, getDocs, query, where } from "firebase/firestore";
import { db } from "./firebase";

export const obtenerAnunciosActivos = async () => {
  const anunciosRef = collection(db, "Anuncios");

  const consulta = query(anunciosRef, where("activo", "==", true));

  const respuesta = await getDocs(consulta);

  return respuesta.docs.map((documento) => ({
    id: documento.id,
    ...documento.data(),
  }));
};