import { MarkerClusterer } from "@googlemaps/markerclusterer";
import { Status, Wrapper } from "@googlemaps/react-wrapper";
import { Button, Spinner } from "@nextui-org/react";
import { Libraries } from "@react-google-maps/api";
import { useState, useEffect, useRef } from "react";
import { FaLocationArrow } from "react-icons/fa6";

const libraries: Libraries = ["places"];

const LocationMapWrapper = ({ lat, lng }: { lat: number; lng: number }) => {
  const render = (status: Status) => <Spinner color="warning" />;

  return (
    <Wrapper
      apiKey={process.env.NEXT_PUBLIC_MAPS_API_KEY as string}
      libraries={libraries}
      render={render}
    >
      <LocationMap lat={lat} lng={lng} />
    </Wrapper>
  );
};

export default LocationMapWrapper;

const LocationMap = ({ lat, lng }: { lat: number; lng: number }) => {
  const [map, setMap] = useState<google.maps.Map | null>(null);
  const [markerCluster, setMarkerCluster] = useState<MarkerClusterer | null>(
    null
  );
  const [marker, setMarker] = useState<{ lat: number; lng: number } | null>({
    lat,
    lng,
  });
  const [locationCircle, setLocationCircle] = useState<google.maps.Circle | null>(null); // Circle for "My Location"
  const ref = useRef<HTMLDivElement>(null);

  // Function to adjust the circle radius based on zoom level
  const calculateRadius = (zoom: number) => {
    // Example calculation: the radius increases as the zoom level decreases
    const baseRadius = 60; // Starting radius at maximum zoom level
    return baseRadius * Math.pow(2.05, 14 - zoom); // Adjust radius as zoom level changes
  };

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

  // Marker cluster setup
  useEffect(() => {
    if (map && !markerCluster) {
      const cluster = new MarkerClusterer({ map, markers: [] });
      setMarkerCluster(cluster);
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

  // Function to handle My Location button click and add blue circle marker
  const handleMyLocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const { latitude, longitude } = position.coords;
          map?.setCenter({ lat: latitude, lng: longitude });

          // Remove existing circle if any
          if (locationCircle) {
            locationCircle.setMap(null);
          }

          // Create a blue circle to indicate user's location
          const newCircle = new google.maps.Circle({
            strokeColor: "#ffffff",
            strokeOpacity: 1,
            strokeWeight: 3,
            fillColor: "#3A84DF",
            fillOpacity: 0.8,
            map: map,
            center: { lat: latitude, lng: longitude },
            radius: calculateRadius(map?.getZoom() || 14), // Set initial radius based on zoom
          });

          setLocationCircle(newCircle);

          // Update the circle's radius when zoom changes
          map?.addListener("zoom_changed", () => {
            const zoom = map.getZoom();
            if (newCircle) {
              newCircle.setRadius(calculateRadius(zoom || 14)); // Dynamically adjust the radius
            }
          });
        },
        (error) => {
          console.error("Error getting location:", error);
        }
      );
    } else {
      console.error("Geolocation is not supported by this browser.");
    }
  };

  return (
    <div style={{ position: "relative", width: "100%", height: "100%" }}>
      {/* My Location Button */}
      <Button
        onPress={handleMyLocation}
        className="absolute top-[10px] right-14 z-10 bg-white"
        isIconOnly 
        aria-label="Mi ubicación"
      >
        <FaLocationArrow className="size-5 text-blue-500" />
      </Button>

      <div
        ref={ref}
        style={{
          height: "100%",
          width: "100%",
          minHeight: "300px",
          borderRadius: "20px",
        }}
      />
    </div>
  );
};
