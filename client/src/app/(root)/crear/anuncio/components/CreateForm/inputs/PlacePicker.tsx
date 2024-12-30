import { memo, useEffect, useState } from "react";
import CustomMap from "./CustomMap";
import { FormikErrors } from "formik";
import {
  GoodPostValues,
  PostLocationForm,
  ServicePostValues,
} from "@/types/postTypes";
import { toastifyError } from "@/utils/functions/toastify";
import { Libraries } from "@react-google-maps/api";
import { Status, Wrapper } from "@googlemaps/react-wrapper";
import { Slider, Spinner } from "@nextui-org/react";
const libraries: Libraries = ["places"];
const INITIAL_LOCATION = { lat: -34.6115643483578, lng: -58.38901999245833 };

interface PlacePickerProps {
  location: PostLocationForm;
  setFieldValue: (
    field: string,
    value: any,
    shouldValidate?: boolean
  ) => Promise<void | FormikErrors<GoodPostValues | ServicePostValues>>;
  error: FormikErrors<PostLocationForm> | undefined;
}

const PlacePickerWrapper = ({
  location,
  setFieldValue,
  error,
}: PlacePickerProps) => {
  const render = (status: Status) => <Spinner color="warning" />;

  return (
    <Wrapper
      apiKey={process.env.NEXT_PUBLIC_MAPS_API_KEY as string}
      libraries={libraries}
      render={render}
    >
      <PlacePicker
        location={location}
        setFieldValue={setFieldValue}
        error={error}
      />
    </Wrapper>
  );
};

export default memo(PlacePickerWrapper);

const PlacePicker = ({ location, setFieldValue, error }: PlacePickerProps) => {
  const [ratio, setRatio] = useState(location.ratio || 5);

  const handleRatioChange = (newRatio: number | number[]) => {
    setRatio(newRatio as number);
    setFieldValue("geoLocation.ratio", ratio);
  };
  // Function to handle location and zoom updates
  const handleChangeLocation = (
    lat: number,
    lng: number,
    description?: string,
    userSetted?: boolean
  ) => {
    setFieldValue("geoLocation", {
      lat,
      lng,
      description,
      userSetted: userSetted || false,
      ratio,
    });
    return { lat, lng };
  };

  // Use geolocation to set the default location based on the user's device location
  const handleActivateGeolocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const { latitude, longitude } = position.coords;
          geocodeLatLng(latitude, longitude);
        },
        (error) => {
          // toastifyError("Error al obtener la ubicación: " + error.message);
          geocodeLatLng(INITIAL_LOCATION.lat, INITIAL_LOCATION.lng);
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
        handleChangeLocation(lat, lng, address, userSetted || false);
      } else {
        console.error("Geocode was not successful: " + status);
      }
    });
  };

  useEffect(() => {
    handleActivateGeolocation();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  if (!location.lat || !location.lng) return <Spinner color="warning" />;

  return (
    <>
      <CustomMap
        lat={location.lat}
        lng={location.lng}
        handleLocationChange={handleChangeLocation}
        geocodeLatLng={geocodeLatLng}
        ratio={ratio}
      />
      <Slider
        label="Radio de alcance"
        marks={[
          {
            value: 5,
            label: "5km",
          },
          {
            value: 20,
            label: "20km",
          },
          {
            value: 40,
            label: "40km",
          },
        ]}
        minValue={1}
        maxValue={50}
        value={ratio}
        formatOptions={{ style: "unit", unit: "kilometer" }}
        onChange={handleRatioChange}
      />
      {error && (
        <p className="text-danger text-small">
          Por favor, busque y/o seleccione una ubicación en el mapa
        </p>
      )}
    </>
  );
};
