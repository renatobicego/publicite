import { Status, Wrapper } from "@googlemaps/react-wrapper";
import { useEffect, useRef, useState } from "react";
const CustomMap = ({
  lat,
  lng,
  handleLocationChange,
}: {
  lat: number;
  lng: number;
  handleLocationChange: (lat: number, lng: number) => void;
}) => {
  const render = (status: Status) => <h1>{status}</h1>;

  return (
    <div className="App">
      <Wrapper
        apiKey={process.env.NEXT_PUBLIC_MAPS_API_KEY as string}
        render={render}
      >
        <MapComponent
          lat={lat}
          lng={lng}
          handleLocationChange={handleLocationChange}
        />
      </Wrapper>
    </div>
  );
};

export default CustomMap;

import { MarkerClusterer } from "@googlemaps/markerclusterer";

export function MapComponent({
  lat,
  lng,
  handleLocationChange,
}: {
  lat: number;
  lng: number;
  handleLocationChange: (lat: number, lng: number) => void;
}) {
  const [map, setMap] = useState<google.maps.Map>();
  const ref = useRef<HTMLDivElement>();
  // New Code Markers: 1
  const [markerCluster, setMarkerClusters] = useState<MarkerClusterer>();
  const [marker, setMarker] = useState<
    { lat: number; lng: number } | undefined
  >({
    lat,
    lng,
  });
  // New Code Markers 1
  useEffect(() => {
    if (ref.current && !map) {
      setMap(
        new window.google.maps.Map(ref.current, {
          center: { lat, lng },
          zoom: 10,
        })
      );
    }
    // New Code markets: 2
    if (map && !markerCluster) {
      map.addListener("click", (e: google.maps.MapMouseEvent) => {
        if (e.latLng) {
          const { lat, lng } = e.latLng;
          setMarker({ lat: lat(), lng: lng() });
          map.setCenter({ lat: lat(), lng: lng() });
          handleLocationChange(lat(), lng());
        }
      });
      setMarkerClusters(new MarkerClusterer({ map, markers: [] }));
    }
    // New Code markers: 2
  }, [handleLocationChange, lat, lng, map, markerCluster]);

  // New Code markers 3
  useEffect(() => {
    if (marker && markerCluster) {
      markerCluster.clearMarkers();
      markerCluster.addMarker(
        new window.google.maps.Marker({
          position: { lat: marker.lat, lng: marker.lng },
        })
      );
    }
  }, [marker, markerCluster]);
  // New Code markers 3
  return (
    <>
      <div
        ref={ref as any}
        style={{ height: "100%", width: "100%", minHeight: "300px" }}
      ></div>
    </>
  );
}
