import { useState, useEffect } from "react";
import CustomMap from "./CustomMap";
import { FormikErrors } from "formik";
import {
  GoodPostValues,
  PostLocation,
  ServicePostValues,
} from "@/types/postTypes";
import { toastifyError } from "@/app/utils/toastify";
import { Libraries } from "@react-google-maps/api";
import { Status, Wrapper } from "@googlemaps/react-wrapper";
import { Spinner } from "@nextui-org/react";
const libraries: Libraries = ["places"];

const PlacePickerWrapper = ({
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
  const render = (status: Status) => <Spinner color="warning" />;

  return (
    <Wrapper
      apiKey={process.env.NEXT_PUBLIC_MAPS_API_KEY as string}
      libraries={libraries}
      render={render}
    >
      <PlacePicker location={location} setFieldValue={setFieldValue} />
    </Wrapper>
  );
};

export default PlacePickerWrapper;

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
  const [geolocationAccepted, setGeolocationAccepted] = useState(false);

  // Function to handle location and zoom updates
  const handleChangeLocation = (
    lat: number,
    lng: number,
    description?: string,
    userSetted?: boolean
  ) => {
    if (userSetted)
      setFieldValue("location", {
        lat,
        lng,
        description,
        userSetted: true,
      });
    else setFieldValue("location", { lat, lng, description, userSetted: false });
  };

  // Use geolocation to set the default location based on the user's device location
  const handleActivateGeolocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const { latitude, longitude } = position.coords;
          geocodeLatLng(latitude, longitude);
          setGeolocationAccepted(true); // User accepted geolocation
        },
        (error) => {
          toastifyError("Error al obtener la ubicación: " + error.message);
        }
      );
    } else {
      toastifyError("Tu navegador no soporta la geolocalización");
    }
  };

  // Function to geocode lat/lng into an address
  const geocodeLatLng = (lat: number, lng: number, userSetted?: boolean) => {
    const geocoder = new google.maps.Geocoder();
    const latlng = { lat, lng };

    geocoder.geocode({ location: latlng }, (results, status) => {
      if (status === "OK" && results) {
        const address = results[0]?.formatted_address;
        if (userSetted)
          setFieldValue("location", {
            lat,
            lng,
            description: address,
            userSetted: true,
          });
        else setFieldValue("location", { lat, lng, description: address, userSetted: false});
      } else {
        console.error("Geocode was not successful: " + status);
      }
    });
  };

  useEffect(() => {
    handleActivateGeolocation();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  if (!geolocationAccepted) {
    return (
      <div className="text-center">
        <p>Necesitamos tu ubicación para continuar</p>
        <button
          type="button"
          className="btn btn-primary"
          onClick={handleActivateGeolocation}
        >
          Activar geolocalización
        </button>
      </div>
    );
  }

  if (!location.lat || !location.lng) return null; // Don't render the map if the location is not set

  return (
    <CustomMap
      lat={location.lat}
      lng={location.lng}
      handleLocationChange={handleChangeLocation}
      geocodeLatLng={geocodeLatLng}
    />
  );
};
