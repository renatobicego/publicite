import LatLngAutocomplete from "@/app/components/inputs/LatLngAutocomplete";
import { MarkerClusterer } from "@googlemaps/markerclusterer";
import { useState, useEffect, useRef } from "react";
import { Libraries } from "@react-google-maps/api"; // Use @react-google-maps/api to load the script
import { Status, Wrapper } from "@googlemaps/react-wrapper";
import { Spinner } from "@nextui-org/react";
const libraries: Libraries = ["places"]; // Ensure you load the 'places' library

const CustomMapWrapper = ({
  lat,
  lng,
  handleLocationChange,
}: {
  lat: number;
  lng: number;
  handleLocationChange: (lat: number, lng: number) => void;
}) => {
  const render = (status: Status) => <Spinner color="warning" />;

  return (
    <Wrapper
      apiKey={process.env.NEXT_PUBLIC_MAPS_API_KEY as string}
      libraries={libraries}
      render={render}
    >
      <CustomMap
        lat={lat}
        lng={lng}
        handleLocationChange={handleLocationChange}
      />
    </Wrapper>
  );
};

export default CustomMapWrapper;

const CustomMap = ({
  lat,
  lng,
  handleLocationChange,
}: {
  lat: number;
  lng: number;
  handleLocationChange: (lat: number, lng: number) => void;
}) => {
  const [map, setMap] = useState<google.maps.Map | null>(null);
  const [markerCluster, setMarkerCluster] = useState<MarkerClusterer | null>(
    null
  );
  const [marker, setMarker] = useState<{ lat: number; lng: number } | null>({
    lat,
    lng,
  });
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (ref.current && !map) {
      const initializedMap = new google.maps.Map(ref.current, {
        center: { lat, lng },
        zoom: 14,
        mapTypeControlOptions: {
          mapTypeIds: ["roadmap"],
        },
        streetViewControl: false,
        draggableCursor: "pointer",
        mapId: "google-maps-" + Math.random().toString(36).slice(2, 9),
      });
      setMap(initializedMap);
    }
  }, [map, lat, lng]);

  useEffect(() => {
    if (map && !markerCluster) {
      const cluster = new MarkerClusterer({ map, markers: [] });
      setMarkerCluster(cluster);

      map.addListener("click", (e: google.maps.MapMouseEvent) => {
        if (e.latLng) {
          const lat = e.latLng.lat();
          const lng = e.latLng.lng();
          setMarker({ lat, lng });
          handleLocationChange(lat, lng);
        }
      });
    }
  }, [map, markerCluster, handleLocationChange]);

  const createMarker = async (lat?: number, lng?: number) => {
    if (marker && markerCluster) {
      markerCluster.clearMarkers();
      const { AdvancedMarkerElement } = (await google.maps.importLibrary(
        "marker"
      )) as any;
      const newMarker = new AdvancedMarkerElement({
        position: { lat: lat || marker.lat, lng: lng || marker.lng },
      });
      markerCluster.addMarker(newMarker);
    }
  };
  useEffect(() => {
    createMarker();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [marker, markerCluster]);

  return (
    <>
      <LatLngAutocomplete
        handleLocationChange={handleLocationChange}
        map={map}
        createMarker={createMarker}
      />
      <div
        ref={ref}
        style={{
          height: "100%",
          width: "100%",
          minHeight: "300px",
          borderRadius: "20px",
        }}
      />
    </>
  );
};
