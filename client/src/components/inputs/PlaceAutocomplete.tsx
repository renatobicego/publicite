import { Autocomplete, AutocompleteItem } from "@nextui-org/react";
import { FieldInputProps } from "formik";
import { Key, useEffect, useState } from "react";
import { FaLocationDot } from "react-icons/fa6";
import { Libraries, useLoadScript } from "@react-google-maps/api";
import usePlacesService from "react-google-autocomplete/lib/usePlacesAutocompleteService";

const libraries: Libraries = ["places"];
// Combine FieldInputProps with any additional props required by Autocomplete
interface PlaceAutocompleteProps extends FieldInputProps<string> {
  onSelectionChange: ((key: Key | null) => void) | undefined;
}

const PlaceAutocomplete = (props: PlaceAutocompleteProps) => {
  const { isLoaded } = useLoadScript({
    googleMapsApiKey: process.env.NEXT_PUBLIC_MAPS_API_KEY as string,
    libraries,
  });

  const { placePredictions, getPlacePredictions, isPlacePredictionsLoading } =
    usePlacesService({
      apiKey: process.env.NEXT_PUBLIC_MAPS_API_KEY,
      options: {
        types: ["geocode"],
        input: props.value,
      },
    });

  useEffect(() => {
    if (props.value && isLoaded) {
      getPlacePredictions({ input: props.value });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isLoaded]);

  if (!isLoaded) return <div>Cargando...</div>;

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
          inputWrapper:
            "shadow-none hover:shadow-sm border-[0.5px] group-data-[focus=true]:border-light-text",
          input: "text-[0.8125rem]",
          label: "font-medium text-[0.8125rem]",
        },
      }}
      listboxProps={{
        emptyContent: "No se encontraron resultados",
      }}
      className="px-4 py-[10px]"
      description="Ingrese una ubicación y seleccione de la lista."
      onValueChange={(value) => getPlacePredictions({ input: value })}
      isLoading={isPlacePredictionsLoading}
      selectedKey={props.value}
      {...props}
    >
      {placePredictions.map((place) => (
        <AutocompleteItem
          classNames={{
            title: "text-[0.8125rem]",
          }}
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
