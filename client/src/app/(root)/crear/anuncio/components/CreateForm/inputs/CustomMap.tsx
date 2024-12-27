import LatLngAutocomplete from "@/components/inputs/LatLngAutocomplete";
import { MarkerClusterer } from "@googlemaps/markerclusterer";
import { useState, useEffect, useRef } from "react";

const CustomMap = ({
  lat,
  lng,
  handleLocationChange,
  geocodeLatLng,
  ratio,
}: {
  lat: number;
  lng: number;
  geocodeLatLng: (lat: number, lng: number, userSetted?: boolean) => void;
  handleLocationChange: (
    lat: number,
    lng: number,
    address?: string,
    userSetted?: boolean
  ) => { lat: number; lng: number };
  ratio: number;
}) => {
  const [map, setMap] = useState<google.maps.Map | null>(null);
  const [markerCluster, setMarkerCluster] = useState<MarkerClusterer | null>(
    null
  );
  const [marker, setMarker] = useState<{ lat: number; lng: number } | null>({
    lat,
    lng,
  });
  const [circle, setCircle] = useState<google.maps.Circle | null>(null);
  const ref = useRef<HTMLDivElement>(null);

  // Initialize the map
  useEffect(() => {
    if (ref.current && !map) {
      const initializedMap = new google.maps.Map(ref.current, {
        center: { lat, lng },
        zoom: 12,
        mapTypeControlOptions: {
          mapTypeIds: ["roadmap"],
        },
        streetViewControl: false,
        draggableCursor: "pointer",
        draggingCursor: "pointer",
        mapId: "google-maps-" + Math.random().toString(36).slice(2, 9),
      });
      const initializedCircle = new google.maps.Circle({
        map: initializedMap,
        center: { lat, lng },
        radius: ratio * 1000, // Convert kilometers to meters
        fillColor: "#FF0000",
        fillOpacity: 0.2,
        strokeColor: "#FF0000",
        strokeOpacity: 0.7,
        strokeWeight: 1,
      });

      setMap(initializedMap);
      setCircle(initializedCircle);
    }
  }, [map, lat, lng, ratio]);

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
          circle?.setCenter(e.latLng);
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

  // Update the circle's radius and center when the ratio changes
  useEffect(() => {
    if (circle && marker) {
      circle.setRadius(ratio * 1000); // Convert kilometers to meters
      circle.setCenter({ lat: marker.lat, lng: marker.lng });
    }
  }, [circle, marker, ratio]);

  return (
    <>
      <LatLngAutocomplete
        handleLocationChange={(lat, lng, address, userSetted) => {
          const { lat: latReturned, lng: lngReturned } = handleLocationChange(
            lat,
            lng,
            address,
            userSetted
          );
          circle?.setCenter({ lat: latReturned, lng: lngReturned });
        }}
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
