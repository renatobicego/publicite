import { Autocomplete, AutocompleteItem } from "@nextui-org/react";
import { useState, useEffect, Key } from "react";
import usePlacesService from "react-google-autocomplete/lib/usePlacesAutocompleteService";
import { FaLocationDot } from "react-icons/fa6";

const LatLngAutocomplete = ({
  handleLocationChange,
  map,
  createMarker,
}: {
  handleLocationChange: (
    lat: number,
    lng: number,
    description?: string,
    userSetted?: boolean
  ) => void;
  map: google.maps.Map | null;
  createMarker: (lat?: number, lng?: number) => Promise<void>;
}) => {
  const { placePredictions, getPlacePredictions, isPlacePredictionsLoading } =
    usePlacesService({
      apiKey: process.env.NEXT_PUBLIC_MAPS_API_KEY,
      options: {
        types: ["geocode"],
        input: "",
      },
    });

  const handleSelectPlace = (placeId: string) => {
    if (map && placeId) {
      const service = new google.maps.places.PlacesService(map);
      service.getDetails({ placeId: placeId }, (result, status) => {
        if (status === google.maps.places.PlacesServiceStatus.OK && result) {
          const location = result.geometry?.location;
          if (location) {
            const lat = location.lat();
            const lng = location.lng();
            handleLocationChange(lat, lng, result.formatted_address, true);
            map.setCenter({ lat, lng });
            createMarker(lat, lng);
          }
        }
      });
    }
  };

  return (
    <Autocomplete
      label="Ubicación / Ciudad"
      placeholder="Ingresa una ubicación, calle o ciudad"
      autoComplete="hidden"
      radius="full"
      labelPlacement="outside"
      listboxProps={{
        emptyContent: "No se encontraron resultados",
      }}
      variant="bordered"
      inputProps={{
        classNames: {
          inputWrapper:
            "shadow-none hover:shadow-sm border-[0.5px] group-data-[focus=true]:border-light-text",
          input: "text-base",
          label: "font-medium text-[0.8125rem]",
        },
      }}
      description="Ingrese una ubicación y seleccione de la lista."
      onValueChange={(value) => getPlacePredictions({ input: value })}
      onSelectionChange={(key) => handleSelectPlace(key as string)}
      isLoading={isPlacePredictionsLoading}
    >
      {placePredictions.map((place) => (
        <AutocompleteItem
          classNames={{
            title: "text-[0.8125rem]",
          }}
          startContent={<FaLocationDot />}
          key={place.place_id}
          value={place.description}
          textValue={place.description}
        >
          {place.description}
        </AutocompleteItem>
      ))}
    </Autocomplete>
  );
};

export default LatLngAutocomplete;
