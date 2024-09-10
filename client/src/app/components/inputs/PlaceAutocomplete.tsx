import { Autocomplete, AutocompleteItem } from "@nextui-org/react";
import { FieldInputProps } from "formik";
import { useEffect } from "react";
import usePlacesService from "react-google-autocomplete/lib/usePlacesAutocompleteService";
import { FaLocationDot } from "react-icons/fa6";

const PlaceAutocomplete = (props: FieldInputProps<any>) => {
  const { placePredictions, getPlacePredictions, isPlacePredictionsLoading } =
    usePlacesService({
      apiKey: process.env.NEXT_PUBLIC_MAPS_API_KEY,
      options: {
        types: ["geocode"],
        input: props.value,
      },
    });

  useEffect(() => {
    if(props.value){
      getPlacePredictions({ input: props.value })
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

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
          input: "text-[0.8125rem]",
          label: "font-medium text-[0.8125rem]",
        },
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
