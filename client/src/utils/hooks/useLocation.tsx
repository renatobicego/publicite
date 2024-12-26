import { useState, useCallback } from "react";
import { toastifyError } from "../functions/toastify";

type LocationAwarePostType = "good" | "service" | "petition";
export interface Coordinates {
  latitude: number;
  longitude: number;
}
export const isLocationAwarePostType = (
  type: PostType
): type is LocationAwarePostType => {
  return ["good", "service", "petition"].includes(type);
};
export const useLocation = (postType: PostType) => {
  const [coordinates, setCoordinates] = useState<Coordinates | null>(null);
  const requestLocationPermission = useCallback(async () => {
    if (!isLocationAwarePostType(postType)) return;

    try {
      if (navigator.permissions && navigator.permissions.query) {
        const { state } = await navigator.permissions.query({
          name: "geolocation",
        });

        if (state === "denied") {
          throw new Error("Permiso de localización denegado");
        }

        if (state === "prompt") {
          const promptResult = await new Promise<GeolocationPosition>(
            (resolve, reject) => {
              navigator.geolocation.getCurrentPosition(resolve, reject);
            }
          );

          setCoordinates({
            latitude: promptResult.coords.latitude,
            longitude: promptResult.coords.longitude,
          });
          return;
        }
      }

      const position = await new Promise<GeolocationPosition>(
        (resolve, reject) => {
          navigator.geolocation.getCurrentPosition(resolve, reject);
        }
      );

      setCoordinates({
        latitude: position.coords.latitude,
        longitude: position.coords.longitude,
      });
    } catch (error) {
      toastifyError(
        "La localización de tu dispositivo no pudo ser obtenida. Por favor, activa la localización en tu dispositivo o acepta los permisos de geocalización y vuelve a intentarlo."
      );
      throw error;
    }
  }, [postType]);

  return { coordinates, requestLocationPermission };
};
