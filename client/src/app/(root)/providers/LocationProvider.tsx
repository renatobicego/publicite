"use client";

import { INITIAL_LOCATION } from "@/components/modals/SelectManualLocation/ManualLocationPicker";
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
  requestLocationPermission: (
    postType: PubliciteDataTypes
  ) => Promise<GeolocationCoordinates | null>;
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
    ].includes(type.postType);
  }
};

export const LocationProvider: React.FC<{ children: ReactNode }> = ({
  children,
}) => {
  const [coordinates, setCoordinates] = useState<Coordinates | null>({
    latitude: INITIAL_LOCATION.lat,
    longitude: INITIAL_LOCATION.lng,
  });
  const [manualLocation, setManualLocation] = useState(false);
  const [needsUserGesture, setNeedsUserGesture] = useState(false);

  const requestLocationPermission = useCallback(
    async (postType?: PubliciteDataTypes) => {
      if (manualLocation) return null;
      if (postType && !isLocationAwarePostType(postType)) return null;

      const getPosition = (): Promise<GeolocationPosition> =>
        new Promise((resolve, reject) =>
          navigator.geolocation.getCurrentPosition(resolve, reject, {
            timeout: 10000,
            maximumAge: 0,
            enableHighAccuracy: false, // set true only if needed, it's slower
          })
        );

      try {
        if (navigator.permissions?.query) {
          const { state } = await navigator.permissions.query({
            name: "geolocation",
          });

          if (state === "denied") {
            setManualLocation(true);
            return null;
          }

          if (state === "granted") {
            const position = await getPosition();
            setCoordinates({
              latitude: position.coords.latitude,
              longitude: position.coords.longitude,
            });
            return position.coords;
          }

          setNeedsUserGesture(true);
          return null;
        }

        const position = await getPosition();
        setCoordinates({
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
        });
        return position.coords;
      } catch (error) {
        setManualLocation(true);
        return null;
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
