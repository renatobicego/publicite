"use client";

import { PubliciteDataTypes } from "@/utils/data/fetchDataByType";
import { toastifyError } from "@/utils/functions/toastify";
import React, {
  createContext,
  useState,
  useCallback,
  useContext,
  ReactNode,
} from "react";

type LocationAwarePostType = "good" | "service" | "petition";

export interface Coordinates {
  latitude: number;
  longitude: number;
}

interface LocationContextType {
  coordinates: Coordinates | null;
  requestLocationPermission: (postType: PubliciteDataTypes) => Promise<void>;
  setCoordinates: React.Dispatch<React.SetStateAction<Coordinates | null>>;
  manualLocation: boolean;
}

const LocationContext = createContext<LocationContextType | undefined>(
  undefined
);

export const isLocationAwarePostType = (
  type: PubliciteDataTypes
) => {
  if ("postType" in type) { 
    return ["good", "service", "petition"].includes(type.postType);
  }
};

export const LocationProvider: React.FC<{ children: ReactNode }> = ({
  children,
}) => {
  const [coordinates, setCoordinates] = useState<Coordinates | null>(null);
  const [manualLocation, setManualLocation] = useState(false);

  const requestLocationPermission = useCallback(
    async (postType?: PubliciteDataTypes) => {
      if(manualLocation) return
      if (postType && !isLocationAwarePostType(postType)) return;

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
        setManualLocation(true);
        throw error;
      }
    },
    [manualLocation]
  );

  return (
    <LocationContext.Provider
      value={{ coordinates, requestLocationPermission, setCoordinates, manualLocation }}
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
