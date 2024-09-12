import { useState, useEffect } from "react";
import { Picker } from "../../../../../../../../../../../react-gmap-picker/src/index";
import CustomMap from "./CustomMap";
// import { Picker } from 'react-gmap-picker';
const INITIAL_LOCATION = { lat: -34.6115643483578, lng: -58.38901999245833 }; // Fallback location

const PlacePicker = () => {
  const [location, setLocation] = useState(INITIAL_LOCATION);

  // Function to handle location and zoom updates
  const handleChangeLocation = (lat: number, lng: number) => {
    setLocation({ lat, lng });
  };
  const handleResetLocation = () => {
    setLocation(INITIAL_LOCATION);
  };

  // Use geolocation to set the default location based on the user's device location
  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const { latitude, longitude } = position.coords;
          const userLocation = { lat: latitude, lng: longitude };

          setLocation(userLocation);
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
