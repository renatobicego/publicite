"use client";
import type { GeoAreasInput } from "@/utils/data/geoReach";

import { INITIAL_LOCATION } from "@/components/modals/SelectManualLocation/ManualLocationPicker";
import { PubliciteDataTypes } from "@/utils/data/fetchDataByType";
import { toastifyError } from "@/utils/functions/toastify";
import React, {
  createContext,
  useState,
  useCallback,
  useContext,
  useRef,
  ReactNode,
} from "react";

type LocationAwarePostType = "good" | "service" | "petition";

export interface Coordinates {
  latitude: number;
  longitude: number;
  /** Zonas de quien mira: las agrega `withGeoAreas` justo antes de pedir una lista. */
  areas?: GeoAreasInput | null;
}

interface LocationContextType {
  coordinates: Coordinates | null;
  requestLocationPermission: (
    postType: PubliciteDataTypes
  ) => Promise<Coordinates | null>;
  setCoordinates: React.Dispatch<React.SetStateAction<Coordinates | null>>;
  manualLocation: boolean;
  needsUserGesture: boolean;
}

const LocationContext = createContext<LocationContextType | undefined>(
  undefined
);

export const isLocationAwarePostType = (type: PubliciteDataTypes) => {
  if (type.typeOfData === "groupPosts") {
    return true;
  }
  if ("postType" in type) {
    return [
      "good",
      "service",
      "petition",
      "goodService",
      "all",
      "libre",
      "adspace",
    ].includes(type.postType);
  }
};

type BrowserLocation =
  | { kind: "ok"; coordinates: Coordinates }
  | { kind: "denied" }
  | { kind: "prompt" }
  | { kind: "error" };

/** Lee la ubicación del navegador sin pedir permiso si todavía no lo dio (prompt). */
async function readBrowserLocation(): Promise<BrowserLocation> {
  const getPosition = (): Promise<GeolocationPosition> =>
    new Promise((resolve, reject) =>
      navigator.geolocation.getCurrentPosition(resolve, reject, {
        timeout: 10000,
        maximumAge: 0,
        enableHighAccuracy: false, // set true only if needed, it's slower
      })
    );
  const toCoordinates = (position: GeolocationPosition): BrowserLocation => ({
    kind: "ok",
    coordinates: {
      latitude: position.coords.latitude,
      longitude: position.coords.longitude,
    },
  });

  try {
    if (navigator.permissions?.query) {
      const { state } = await navigator.permissions.query({ name: "geolocation" });
      if (state === "denied") return { kind: "denied" };
      if (state === "granted") return toCoordinates(await getPosition());
      return { kind: "prompt" };
    }
    return toCoordinates(await getPosition());
  } catch {
    return { kind: "error" };
  }
}

export const LocationProvider: React.FC<{ children: ReactNode }> = ({
  children,
}) => {
  const [coordinates, setCoordinates] = useState<Coordinates | null>({
    latitude: INITIAL_LOCATION.lat,
    longitude: INITIAL_LOCATION.lng,
  });
  const [manualLocation, setManualLocation] = useState(false);
  const [needsUserGesture, setNeedsUserGesture] = useState(false);

  // Si varias listas piden la ubicación a la vez (el inicio tiene varias), se
  // comparte el mismo pedido: una sola lectura y un solo cambio de coordenadas,
  // así cada lista carga una vez en lugar de una por cada lectura.
  const pendingLocation = useRef<Promise<Coordinates | null> | null>(null);

  const requestLocationPermission = useCallback(
    async (postType?: PubliciteDataTypes) => {
      if (manualLocation) return null;
      if (postType && !isLocationAwarePostType(postType)) return null;
      if (pendingLocation.current) return pendingLocation.current;

      const request = readBrowserLocation().then((result) => {
        if (result.kind === "denied" || result.kind === "error") {
          setManualLocation(true);
          return null;
        }
        if (result.kind === "prompt") {
          setNeedsUserGesture(true);
          return null;
        }
        setCoordinates(result.coordinates);
        return result.coordinates;
      });
      pendingLocation.current = request;
      try {
        return await request;
      } finally {
        pendingLocation.current = null;
      }
    },
    [manualLocation]
  );

  return (
    <LocationContext.Provider
      value={{
        coordinates,
        requestLocationPermission,
        setCoordinates,
        manualLocation,
        needsUserGesture,
      }}
    >
      {children}
    </LocationContext.Provider>
  );
};

export const useLocation = () => {
  const context = useContext(LocationContext);
  if (context === undefined) {
    throw new Error("useLocation must be used within a LocationProvider");
  }
  return context;
};
