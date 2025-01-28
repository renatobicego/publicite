import { useState } from "react";
import AnimatedBox from "../AnimatedBox";
import SearchTermsForm from "./SearchTermsForm";
import DataBox, { DataItem, EditButton } from "../DataBox";
import { UserPreferences } from "@/types/userTypes";
import { PostCategory } from "@/types/postTypes";

const SearchTerms = ({
  userPreferences,
}: {
  userPreferences: UserPreferences;
}) => {
  const [isFormVisible, setIsFormVisible] = useState(false);
  const { searchPreference } = userPreferences;
  const length = searchPreference ? searchPreference.length : 0;
  const lastItem =
    searchPreference && (searchPreference[length - 1] as PostCategory);
  return (
    <AnimatedBox
      isVisible={isFormVisible}
      className="flex-1 w-full"
      keyValue="search-terms-box"
    >
      {isFormVisible ? (
        <SearchTermsForm
          key={"searchTermsForm"}
          prevValues={userPreferences.searchPreference as PostCategory[]}
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
            {length > 0 ? (
              <>
                {(searchPreference.slice(0, length - 1) as PostCategory[]).map(
                  (searchP) => (
                    <span key={searchP._id}>{searchP.label}, </span>
                  )
                )}
                <span key={lastItem._id}>{lastItem.label}</span>
              </>
            ) : (
              <span>No ha seleccionado preferencias de búsqueda</span>
            )}
          </DataItem>
          <EditButton text={"Editar"} onPress={() => setIsFormVisible(true)} />
        </DataBox>
      )}
    </AnimatedBox>
  );
};

export default SearchTerms;
