import { Autocomplete, AutocompleteItem, Input } from "@nextui-org/react";
import { FieldInputProps } from "formik";
import usePlacesService from "react-google-autocomplete/lib/usePlacesAutocompleteService";
import { FaLocationDot } from "react-icons/fa6";

const PlaceAutocomplete = (props: FieldInputProps<any>) => {
  const { placePredictions, getPlacePredictions, isPlacePredictionsLoading } =
    usePlacesService({
      apiKey: process.env.NEXT_PUBLIC_MAPS_API_KEY,
      options: {
        types: ["geocode"],
      },
    });

  return (
    <Autocomplete
      label="Ubicación / Ciudad"
      placeholder="Ingresa una ubicación"
      labelPlacement="outside"
      autoComplete="hidden"
      radius="full"
      variant="bordered"
      inputProps={{
        classNames: {
          inputWrapper: "shadow-none hover:shadow-sm border-[0.5px]",
          label: "font-medium text-[0.8125rem]",
        },
      }}
      className="px-4 py-[10px]"
      onValueChange={(value) => getPlacePredictions({ input: value })}
      isLoading={isPlacePredictionsLoading}
      {...props}
    >
      {placePredictions.map((place) => (
        <AutocompleteItem
          startContent={<FaLocationDot />}
          key={place.description}
          value={place.description}
          textValue={place.description}
        >
          {place.description}
        </AutocompleteItem>
      ))}
    </Autocomplete>
  );
};

export default PlaceAutocomplete;
