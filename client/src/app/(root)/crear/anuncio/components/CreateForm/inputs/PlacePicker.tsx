import { memo, useEffect, useRef, useState } from "react";
import CustomMap from "./CustomMap";
import { PostLocationForm } from "@/types/postTypes";
import { toastifyError } from "@/utils/functions/toastify";
import { Libraries } from "@react-google-maps/api";
import { Status, Wrapper } from "@googlemaps/react-wrapper";
import { Spinner } from "@nextui-org/react";
import GeoReachSelector from "./GeoReachSelector";
import {
  GeoAreasInput,
  GeoReachScope,
  GeoZoneLevel,
  zoneNamesOf,
} from "@/utils/data/geoReach";
import { reverseGeocodeAreas } from "@/utils/functions/geoAreas";
const libraries: Libraries = ["places"];
const INITIAL_LOCATION = { lat: -34.6115643483578, lng: -58.38901999245833 };

// También lo usan los blogs libres de Producciones (fuera de Formik): sólo
// necesita algo con la forma de `setFieldValue`.
interface PlacePickerProps {
  location: PostLocationForm;
  setFieldValue: (field: string, value: any, shouldValidate?: boolean) => unknown;
  error: unknown;
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
  const scope: GeoReachScope = location.scope ?? "radius";
  // El mapa registra el clic una sola vez: se lee el valor actual desde acá.
  const latest = useRef({ location, ratio });
  useEffect(() => {
    latest.current = { location, ratio };
  });
  // Zonas del punto (barrio, ciudad, provincia…), para elegir dónde se ve.
  const [zones, setZones] = useState<{ key: string; areas: GeoAreasInput | null } | null>(null);
  const pointKey =
    location.lat && location.lng ? `${location.lat},${location.lng}` : null;
  const isLoadingZones = !!pointKey && zones?.key !== pointKey;

  useEffect(() => {
    if (!pointKey || !location.lat || !location.lng) return;
    let active = true;
    reverseGeocodeAreas(location.lat, location.lng).then((areas) => {
      if (!active) return;
      setZones({ key: pointKey, areas });
      setFieldValue("geoLocation.areas", areas);
    });
    return () => {
      active = false;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pointKey]);

  const handleRatioChange = (newRatio: number) => {
    setRatio(newRatio);
    setFieldValue("geoLocation.ratio", newRatio);
  };

  const handleReachChange = (
    newScope: GeoReachScope,
    zoneLevel: GeoZoneLevel | null
  ) => {
    setFieldValue("geoLocation.scope", newScope);
    setFieldValue("geoLocation.zoneLevel", zoneLevel);
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
      ratio: latest.current.ratio,
      // El alcance elegido se mantiene; las zonas se vuelven a leer del punto nuevo.
      scope: latest.current.location.scope ?? "radius",
      zoneLevel: latest.current.location.zoneLevel ?? null,
      areas: null,
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
        () => {
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
    // Si ya viene una ubicación guardada (edición), no se pisa con la del dispositivo.
    if (location.lat && location.lng) return;
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
        showRadius={scope === "radius"}
      />
      <GeoReachSelector
        scope={scope}
        zoneLevel={location.zoneLevel}
        zoneNames={zones?.key === pointKey ? zoneNamesOf(zones.areas) : {}}
        isLoadingZones={isLoadingZones}
        ratio={ratio}
        onChange={handleReachChange}
        onRatioChange={handleRatioChange}
      />
      {!!error && (
        <p className="text-danger text-small">
          Por favor, busque y/o seleccione una ubicación en el mapa
        </p>
      )}
    </>
  );
};
