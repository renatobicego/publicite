import { useState } from "react";
import AnimatedBox from "../AnimatedBox";
import SearchTermsForm from "./SearchTermsForm";
import DataBox, { DataItem, EditButton } from "../DataBox";

const SearchTerms = () => {
  const [isFormVisible, setIsFormVisible] = useState(false);

  return (
    <AnimatedBox isVisible={isFormVisible} className="flex-1 w-full">
      {isFormVisible ? (
        <SearchTermsForm
          key={"searchTermsForm"}
          setIsFormVisible={setIsFormVisible}
        />
      ) : (
        <DataBox
          key={"dataAccountType"}
          className=" max-md:my-2.5 !items-start"
          labelText="Preferencias de Búsqueda"
          labelClassname="md:mt-2.5"
        >
          <DataItem className="flex-1 md:mt-2.5">
            Juegos de Mesa, Guitarras, Fútbol
          </DataItem>
          <EditButton text={"Editar"} onPress={() => setIsFormVisible(true)} />
        </DataBox>
      )}
    </AnimatedBox>
  );
};

export default SearchTerms;
