import { collection, getDocs, query, where } from "firebase/firestore";
import { db } from "./firebase";

export const obtenerPremiosActivos = async () => {
  const premiosRef = collection(db, "Premios");

  const consulta = query(premiosRef, where("activo", "==", true));

  const respuesta = await getDocs(consulta);

  return respuesta.docs.map((documento) => ({
    id: documento.id,
    ...documento.data(),
  }));
};