"use client";

import { useEffect } from "react";
import { useDispatch } from "react-redux";
import { fetchMagazines } from "./slices/magazineSlice";
import { fetchConfigData } from "./slices/configSlice";
import { fetchSubscriptions } from "./slices/subscriptionsSlice";

/*
Carga los datos del usuario logueado (revistas, configuración y suscripciones)
una vez por sesión y en paralelo.

Antes el efecto dependía de las revistas y de la configuración, así que cada vez
que llegaba una volvía a pedir lo que faltaba (que ya estaba en camino): la
configuración se pedía 2 veces por carga, 4 con el modo estricto de React.
Ahora cada thunk tiene un `condition` que lo saltea si ya se está pidiendo o ya
llegó, y los reintentos los hace cada thunk.
*/
const DataInitializer = ({
  userId,
  username,
}: {
  userId?: string;
  username?: string | null;
}) => {
  const dispatch = useDispatch();

  useEffect(() => {
    if (!userId || !username) return;
    dispatch(fetchMagazines(userId) as any);
    dispatch(fetchConfigData({ username, userId }) as any);
    dispatch(fetchSubscriptions(userId) as any);
  }, [dispatch, userId, username]);

  return null; // This component doesn't render anything visible
};

export default DataInitializer;
