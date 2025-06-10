import { memo, useEffect } from "react";
import { Libraries } from "@react-google-maps/api";
import { Status, Wrapper } from "@googlemaps/react-wrapper";
import { Spinner } from "@nextui-org/react";
import { useLocation } from "@/app/(root)/providers/LocationProvider";
import CustomMap from "./CustomMap";
import LatLngAutocomplete from "@/components/inputs/LatLngAutocomplete";
const libraries: Libraries = ["places"];
const INITIAL_LOCATION = { lat: -34.6115643483578, lng: -58.38901999245833 };
const PlacePickerWrapper = ({
  setAddress,
}: {
  setAddress: React.Dispatch<React.SetStateAction<string>>;
}) => {
  const render = (status: Status) => <Spinner color="warning" />;

  return (
    <Wrapper
      apiKey={process.env.NEXT_PUBLIC_MAPS_API_KEY as string}
      libraries={libraries}
      render={render}
    >
      <PlacePicker setAddress={setAddress} />
    </Wrapper>
  );
};

export default memo(PlacePickerWrapper);

const PlacePicker = ({
  setAddress,
}: {
  setAddress: React.Dispatch<React.SetStateAction<string>>;
}) => {
  // Function to handle location and zoom updates
  const { coordinates, setCoordinates } = useLocation();
  const handleChangeLocation = (
    lat: number,
    lng: number,
    description?: string
  ) => {
    setCoordinates({ latitude: lat, longitude: lng });
    if (description) setAddress(description);
  };

  // Function to geocode lat/lng into an address
  const geocodeLatLng = (lat: number, lng: number) => {
    const geocoder = new google.maps.Geocoder();
    const latlng = { lat, lng };

    geocoder.geocode({ location: latlng }, (results, status) => {
      if (status === "OK" && results) {
        const address = results[0]?.address_components.filter((component) =>
          component.types.includes("political")
        );
        handleChangeLocation(
          lat,
          lng,
          address.map((component) => component.long_name).join(", ")
        );
      } else {
        console.error("Geocode was not successful: " + status);
      }
    });
  };

  return (
    <CustomMap
      lat={coordinates?.latitude || INITIAL_LOCATION.lat}
      lng={coordinates?.longitude || INITIAL_LOCATION.lng}
      geocodeLatLng={geocodeLatLng}
      handleLocationChange={handleChangeLocation}
    />
  );
};
