import { Autocomplete, AutocompleteItem } from "@nextui-org/react";
import { useState, useEffect } from "react";
import usePlacesService from "react-google-autocomplete/lib/usePlacesAutocompleteService";
import { FaLocationDot } from "react-icons/fa6";

const LatLngAutocomplete = ({
  handleLocationChange,
  map,
}: {
  handleLocationChange: (lat: number, lng: number) => void;
  map: google.maps.Map | null;
}) => {
  const [value, setValue] = useState<string | null>(null);

  const { placePredictions, getPlacePredictions, isPlacePredictionsLoading } =
    usePlacesService({
      apiKey: process.env.NEXT_PUBLIC_MAPS_API_KEY,
      options: {
        types: ["geocode"],
        input: value ?? "",
      },
    });


  const handleSelectPlace = (place: google.maps.places.AutocompletePrediction) => {
    if (map && place.place_id) {
      const service = new google.maps.places.PlacesService(map);
      service.getDetails({ placeId: place.place_id }, (result, status) => {
        if (status === google.maps.places.PlacesServiceStatus.OK && result) {
          const location = result.geometry?.location;
          if (location) {
            const lat = location.lat();
            const lng = location.lng();
            handleLocationChange(lat, lng);
            map.setCenter({ lat, lng });
          }
        }
      });
    }
  };

  return (
    <Autocomplete
      label="Ubicación / Ciudad"
      placeholder="Ingresa una ubicación"
      onValueChange={(value) => getPlacePredictions({ input: value })}
      isLoading={isPlacePredictionsLoading}
    >
      {placePredictions.map((place) => (
        <AutocompleteItem
          key={place.place_id}
          value={place.description}
          textValue={place.description}
          onClick={() => handleSelectPlace(place)}
        >
          <FaLocationDot /> {place.description}
        </AutocompleteItem>
      ))}
    </Autocomplete>
  );
};

export default LatLngAutocomplete;
