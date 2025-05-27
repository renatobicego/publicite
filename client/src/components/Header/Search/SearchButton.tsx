import SecondaryButton from "@/components/buttons/SecondaryButton";
import { FaSearch } from "react-icons/fa";

// this is the button that appears when the search input is not empty
const SearchButton = ({
  searchTerm,
  handleSearch,
}: {
  searchTerm: string;
  handleSearch: () => void;
}) => {
  return (
    <div
      className={`relative flex items-center ${
        searchTerm ? "min-w-fit" : "min-w-5"
      }`}
    >
      <FaSearch
        className={`text-light-text min-w-3.5 absolute transition-opacity transform duration-300 ${
          searchTerm ? "opacity-0 scale-0" : "opacity-100 scale-100"
        }`}
      />
      <SecondaryButton
        size="sm"
        startContent={<FaSearch className="min-w-3.5" />}
        onPress={handleSearch}
        className={`transition-opacity transform duration-300 ${
          searchTerm
            ? "opacity-100 scale-100 relative min-w-fit"
            : "opacity-0 scale-0 absolute w-0"
        }`}
      >
        Buscar
      </SecondaryButton>
    </div>
  );
};

export default SearchButton;
