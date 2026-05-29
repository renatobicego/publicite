"use client";
import {
    Button,
    Modal,
    ModalBody,
    ModalContent,
    ModalFooter,
    ModalHeader,
    Slider,
    Spinner,
    useDisclosure,
} from "@nextui-org/react";
import { useState, useRef, useEffect } from "react";
import { FaLocationDot, FaMapLocationDot } from "react-icons/fa6";
import { toastifyError } from "@/utils/functions/toastify";
import PrimaryButton from "@/components/buttons/PrimaryButton";
import { Wrapper, Status } from "@googlemaps/react-wrapper";
import LatLngAutocomplete from "@/components/inputs/LatLngAutocomplete";

interface LocationStepProps {
    onSubmit: (location: {
        lat: number;
        lng: number;
        description: string;
        ratio: number;
    }) => void;
}

const INITIAL_LOCATION = { lat: -34.6115643483578, lng: -58.38901999245833 };

const LocationStep = ({ onSubmit }: LocationStepProps) => {
    const { isOpen, onOpen, onOpenChange } = useDisclosure();
    const [selectedLocation, setSelectedLocation] = useState<{
        lat: number;
        lng: number;
        description: string;
    } | null>(null);
    const [address, setAddress] = useState("");
    const [ratio, setRatio] = useState(5);
    const [loadingCurrentLocation, setLoadingCurrentLocation] = useState(false);

    const handleUseCurrentLocation = () => {
        if (!navigator.geolocation) {
            toastifyError("Tu navegador no soporta geolocalización");
            return;
        }

        setLoadingCurrentLocation(true);
        navigator.geolocation.getCurrentPosition(
            (position) => {
                const { latitude, longitude } = position.coords;
                const geocoder = new google.maps.Geocoder();
                geocoder.geocode(
                    { location: { lat: latitude, lng: longitude } },
                    (results, status) => {
                        let description = `${latitude.toFixed(4)}, ${longitude.toFixed(4)}`;
                        if (status === "OK" && results) {
                            const addressComponents =
                                results[0]?.address_components.filter((c) =>
                                    c.types.includes("political")
                                );
                            if (addressComponents?.length) {
                                description = addressComponents
                                    .map((c) => c.long_name)
                                    .join(", ");
                            }
                        }
                        onSubmit({ lat: latitude, lng: longitude, description, ratio });
                        setLoadingCurrentLocation(false);
                    }
                );
            },
            () => {
                toastifyError(
                    "No se pudo obtener tu ubicación. Verificá los permisos."
                );
                setLoadingCurrentLocation(false);
            }
        );
    };

    const handleMapConfirm = (onClose: () => void) => {
        if (selectedLocation) {
            onSubmit({ ...selectedLocation, ratio });
            onClose();
        }
    };

    const handleLocationChange = (
        lat: number,
        lng: number,
        description?: string
    ) => {
        if (description) {
            setAddress(description);
            setSelectedLocation({ lat, lng, description });
        }
    };

    return (
        <div className="flex flex-col gap-2 mt-2">
            <div className="flex gap-2">
                <Button
                    size="sm"
                    variant="flat"
                    color="primary"
                    onPress={onOpen}
                    startContent={<FaMapLocationDot size={14} />}
                    className="flex-1"
                >
                    Elegir en mapa
                </Button>
                <Button
                    size="sm"
                    variant="flat"
                    color="success"
                    onPress={handleUseCurrentLocation}
                    isLoading={loadingCurrentLocation}
                    startContent={<FaLocationDot size={14} />}
                    className="flex-1"
                >
                    Ubicación actual
                </Button>
            </div>

            <Modal
                placement="center"
                isOpen={isOpen}
                onOpenChange={onOpenChange}
                size="lg"
            >
                <ModalContent>
                    {(onClose) => (
                        <>
                            <ModalHeader>Seleccionar Ubicación</ModalHeader>
                            <ModalBody>
                                {isOpen && (
                                    <Wrapper
                                        apiKey={process.env.NEXT_PUBLIC_MAPS_API_KEY as string}
                                        libraries={["places"]}
                                        render={(status: Status) => <Spinner color="warning" />}
                                    >
                                        <LocationMap handleLocationChange={handleLocationChange} />
                                    </Wrapper>
                                )}
                                <div className="mt-4">
                                    <Slider
                                        label="Radio de alcance (km)"
                                        step={1}
                                        minValue={1}
                                        maxValue={50}
                                        value={ratio}
                                        onChange={(val) => setRatio(val as number)}
                                        size="sm"
                                        className="max-w-full"
                                    />
                                </div>
                                {address && (
                                    <p className="text-sm text-gray-600 mt-2">📍 {address}</p>
                                )}
                            </ModalBody>
                            <ModalFooter>
                                <Button variant="light" onPress={onClose}>
                                    Cancelar
                                </Button>
                                <PrimaryButton
                                    onPress={() => handleMapConfirm(onClose)}
                                    isDisabled={!selectedLocation}
                                >
                                    Confirmar
                                </PrimaryButton>
                            </ModalFooter>
                        </>
                    )}
                </ModalContent>
            </Modal>
        </div>
    );
};

export default LocationStep;

/**
 * Map component with local state (no dependency on LocationProvider)
 */
function LocationMap({
    handleLocationChange,
}: {
    handleLocationChange: (lat: number, lng: number, description?: string) => void;
}) {
    const ref = useRef<HTMLDivElement>(null);
    const [map, setMap] = useState<google.maps.Map | null>(null);
    const [marker, setMarker] = useState<google.maps.marker.AdvancedMarkerElement | null>(null);

    const geocodeLatLng = (lat: number, lng: number) => {
        const geocoder = new google.maps.Geocoder();
        geocoder.geocode({ location: { lat, lng } }, (results, status) => {
            if (status === "OK" && results) {
                const addressComponents = results[0]?.address_components.filter((c) =>
                    c.types.includes("political")
                );
                const description = addressComponents
                    ?.map((c) => c.long_name)
                    .join(", ");
                handleLocationChange(lat, lng, description || `${lat}, ${lng}`);
            }
        });
    };

    useEffect(() => {
        if (ref.current && !map) {
            const initializedMap = new google.maps.Map(ref.current, {
                center: INITIAL_LOCATION,
                zoom: 12,
                mapTypeControlOptions: { mapTypeIds: ["roadmap"] },
                streetViewControl: false,
                draggableCursor: "pointer",
                draggingCursor: "pointer",
                mapId: "chatbot-map-" + Math.random().toString(36).slice(2, 9),
            });

            initializedMap.addListener("click", async (e: google.maps.MapMouseEvent) => {
                if (e.latLng) {
                    const lat = e.latLng.lat();
                    const lng = e.latLng.lng();
                    geocodeLatLng(lat, lng);

                    // Update marker
                    const { AdvancedMarkerElement } = (await google.maps.importLibrary(
                        "marker"
                    )) as any;

                    if (marker) {
                        marker.map = null;
                    }

                    const newMarker = new AdvancedMarkerElement({
                        position: { lat, lng },
                        map: initializedMap,
                    });
                    setMarker(newMarker);
                }
            });

            setMap(initializedMap);
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    const createMarker = async (lat?: number, lng?: number) => {
        if (!map || (!lat && !lng)) return;
        const { AdvancedMarkerElement } = (await google.maps.importLibrary(
            "marker"
        )) as any;

        if (marker) {
            marker.map = null;
        }

        const newMarker = new AdvancedMarkerElement({
            position: { lat, lng },
            map,
        });
        setMarker(newMarker);
        map.panTo({ lat: lat!, lng: lng! });
    };

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
}
