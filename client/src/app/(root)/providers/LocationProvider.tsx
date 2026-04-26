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
    return ["good", "service", "petition", "goodService", "all"].includes(
      type.postType
    );
  }
};

export const LocationProvider: React.FC<{ children: ReactNode }> = ({
  children,
}) => {
  const [coordinates, setCoordinates] = useState<Coordinates | null>(null);
  const [manualLocation, setManualLocation] = useState(false);
  const [needsUserGesture, setNeedsUserGesture] = useState(false);

  const requestLocationPermission = useCallback(
    async (postType?: PubliciteDataTypes) => {
      console.log("1. Called with postType:", postType);
      console.log("2. manualLocation:", manualLocation);

      if (manualLocation) return;
      if (postType && !isLocationAwarePostType(postType)) return;

      console.log("3. Passed guards");

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

          console.log("4. Permission state:", state);

          if (state === "denied") {
            setManualLocation(true);
            return;
          }

          if (state === "granted") {
            const position = await getPosition();
            console.log("5. Got position:", position.coords);
            setCoordinates({
              latitude: position.coords.latitude,
              longitude: position.coords.longitude,
            });
            return;
          }

          setNeedsUserGesture(true);
          return;
        }

        console.log("4b. permissions API not available, trying directly");
        const position = await getPosition();
        console.log("5b. Got position:", position.coords);
        setCoordinates({
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
        });
      } catch (error) {
        console.error("6. Error:", error); // error.code: 1=denied, 2=unavailable, 3=timeout
        setManualLocation(true);
      }
    },
    [manualLocation]
  );

  console.log(needsUserGesture, "needsUserGesture");
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
