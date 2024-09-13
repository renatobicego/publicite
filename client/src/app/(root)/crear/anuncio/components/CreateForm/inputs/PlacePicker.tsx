import { useState, useEffect } from "react";
import CustomMap from "./CustomMap";
import { FormikErrors } from "formik";
import { GoodPostValues, PostLocation, ServicePostValues } from "@/types/postTypes";

const PlacePicker = ({
  location,
  setFieldValue,
}: {
  location: PostLocation;
  setFieldValue: (
    field: string,
    value: any,
    shouldValidate?: boolean
  ) => Promise<void | FormikErrors<GoodPostValues | ServicePostValues>>;
}) => {
  // Function to handle location and zoom updates
  const handleChangeLocation = (lat: number, lng: number) => {
    setFieldValue("location", { lat, lng });
  };

  // Use geolocation to set the default location based on the user's device location
  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const { latitude, longitude } = position.coords;
          const userLocation = { lat: latitude, lng: longitude };

          setFieldValue("location", userLocation);
        },
        (error) => {
          console.error("Error getting location:", error);
        }
      );
    } else {
      console.warn("Geolocation is not supported by this browser.");
    }
  }, []);

  if (!location) return null; // Don't render the Picker if location is not set

  return (
    <CustomMap
      lat={location.lat}
      lng={location.lng}
      handleLocationChange={handleChangeLocation}
    />
  );
};

export default PlacePicker;
