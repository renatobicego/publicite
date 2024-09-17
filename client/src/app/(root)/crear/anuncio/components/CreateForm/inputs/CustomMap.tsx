import LatLngAutocomplete from "@/app/components/inputs/LatLngAutocomplete";
import { PostLocationForm } from "@/types/postTypes";
import { MarkerClusterer } from "@googlemaps/markerclusterer";
import { FormikErrors } from "formik";
import { useState, useEffect, useRef } from "react";

const CustomMap = ({
  lat,
  lng,
  handleLocationChange,
  geocodeLatLng,
  error
}: {
  lat: number;
  lng: number;
  geocodeLatLng: (lat: number, lng: number, userSetted?: boolean) => void
  handleLocationChange: (lat: number, lng: number, address?: string, userSetted?: boolean) => void;
  error: FormikErrors<PostLocationForm> | undefined
}) => {
  const [map, setMap] = useState<google.maps.Map | null>(null);
  const [markerCluster, setMarkerCluster] = useState<MarkerClusterer | null>(null);
  const [marker, setMarker] = useState<{ lat: number; lng: number } | null>({ lat, lng });
  const ref = useRef<HTMLDivElement>(null);

  // Initialize the map
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
        draggingCursor: "pointer",
        mapId: "google-maps-" + Math.random().toString(36).slice(2, 9),
      });
      setMap(initializedMap);
    }
  }, [map, lat, lng]);

  // Marker cluster setup and map click event
  useEffect(() => {
    if (map && !markerCluster) {
      const cluster = new MarkerClusterer({ map, markers: [] });
      setMarkerCluster(cluster);

      map.addListener("click", (e: google.maps.MapMouseEvent) => {
        if (e.latLng) {
          const lat = e.latLng.lat();
          const lng = e.latLng.lng();
          setMarker({ lat, lng });
          geocodeLatLng(lat, lng, true); // Get the address based on coordinates
        }
      });
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [map, markerCluster]);



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

export default CustomMap;