import { CustomInputWithoutFormik } from "@/components/inputs/CustomInputs";
import SelectPostType from "@/components/inputs/SelectPostType";
import usePostCategories from "@/utils/hooks/usePostCategories";
import {
  Button,
  Modal,
  ModalBody,
  ModalContent,
  ModalFooter,
  ModalHeader,
  Select,
  Selection,
  SelectItem,
  useDisclosure,
} from "@nextui-org/react";
import {
  Dispatch,
  SetStateAction,
  useContext,
  useEffect,
  useState,
} from "react";
import { FaFilter, FaX } from "react-icons/fa6";

const FilterPosts = ({
  filter,
  setFilter,
}: {
  setFilter: Dispatch<
    SetStateAction<{
      category: string[];
      priceRange: (number | undefined)[];
      postType: PostType | null;
    }>
  >;
  filter: {
    category: string[];
    priceRange: (number | undefined)[];
    postType: PostType | null;
  };
}) => {
  const { isOpen, onOpen, onOpenChange } = useDisclosure();
  const [category, setCategory] = useState<Selection>(new Set([]));
  const [priceRange, setPriceRange] = useState<(number | undefined)[]>([
    undefined,
    undefined,
  ]);
  const [postType, setPostType] = useState<PostType | null>(null);

  const filterPosts = () => {
    setFilter({
      category: Array.from(category) as string[],
      priceRange,
      postType,
    });
  };

  return (
    <>
      <Button
        onPress={onOpen}
        isIconOnly
        aria-label="Filtrar anuncios"
        color="secondary"
        variant="bordered"
        radius="full"
        className="max-md:size-8 max-md:min-w-8"
      >
        <FaFilter />
      </Button>
      {(filter.category.length > 0 ||
        filter.priceRange[0] ||
        filter.priceRange[1]) && (
        <Button
          size="sm"
          color="secondary"
          variant="ghost"
          className="min-w-fit"
          radius="full"
          onPress={() => {
            setFilter({
              category: [],
              priceRange: [undefined, undefined],
              postType: null,
            });
            setCategory(new Set([]));
            setPriceRange([undefined, undefined]);
          }}
          startContent={<FaX className="text-secondary min-w-3" />}
        >
          Borrar Filtros
        </Button>
      )}
      <Modal
        radius="lg"
        className="p-2"
        placement="center"
        isOpen={isOpen}
        onOpenChange={onOpenChange}
      >
        <ModalContent>
          {(onClose) => (
            <>
              <ModalHeader className="flex flex-col gap-1">
                Filtrar Anuncios
              </ModalHeader>
              <ModalBody>
                <SelectPostType setPostType={setPostType} postType={postType} />
                <SelectCategory category={category} setCategory={setCategory} />
                <PriceRange
                  priceRange={priceRange}
                  setPriceRange={setPriceRange}
                />
              </ModalBody>
              <ModalFooter>
                <Button color="danger" variant="light" onPress={onClose}>
                  Cancelar
                </Button>
                <Button
                  color="primary"
                  onPress={() => {
                    filterPosts();
                    onClose();
                  }}
                >
                  Filtrar
                </Button>
              </ModalFooter>
            </>
          )}
        </ModalContent>
      </Modal>
    </>
  );
};

export default FilterPosts;

const SelectCategory = ({
  category,
  setCategory,
}: {
  category: Selection;
  setCategory: Dispatch<SetStateAction<Selection>>;
}) => {
  const { categories } = usePostCategories();
  return (
    <Select
      scrollShadowProps={{
        hideScrollBar: false,
      }}
      classNames={{
        trigger:
          "shadow-none hover:shadow-sm border-[0.5px] group-data-[focus=true]:border-light-text py-1",
        value: "text-[0.8125rem]",
        label: "font-medium text-[0.8125rem]",
      }}
      radius="full"
      label="Categoría"
      placeholder="Filtre por categoría"
      aria-label="categoría"
      selectionMode="multiple"
      selectedKeys={category}
      onSelectionChange={setCategory}
      variant="bordered"
      labelPlacement="outside"
    >
      {categories.map((item, index) => (
        <SelectItem
          key={item._id}
          value={item._id}
          variant="light"
          classNames={{
            title: "text-[0.8125rem]",
          }}
          aria-label={item.label}
          textValue={item.label}
        >
          {item.label}
        </SelectItem>
      ))}
    </Select>
  );
};

const PriceRange = ({
  priceRange,
  setPriceRange,
}: {
  priceRange: (number | undefined)[];
  setPriceRange: Dispatch<SetStateAction<(number | undefined)[]>>;
}) => {
  const [error, setError] = useState<string | null>(null);
  const [localPriceRange, setLocalPriceRange] = useState<
    (string | undefined)[]
  >([priceRange[0]?.toString(), priceRange[1]?.toString()]);

  // Update local state when priceRange prop changes
  useEffect(() => {
    setLocalPriceRange([priceRange[0]?.toString(), priceRange[1]?.toString()]);
  }, [priceRange]);

  const handleMinPriceBlur = () => {
    const minPrice = Number(localPriceRange[0]);
    const maxPrice = priceRange[1];

    if (localPriceRange[0] === "" || isNaN(minPrice)) {
      setPriceRange([undefined, maxPrice]);
      setError(null);
      return;
    }

    if (maxPrice === undefined || minPrice <= maxPrice) {
      setPriceRange([minPrice, maxPrice]);
      setError(null);
    } else {
      setError("El valor mínimo no puede ser mayor al valor máximo");
    }
  };

  const handleMaxPriceBlur = () => {
    const maxPrice = Number(localPriceRange[1]);
    const minPrice = priceRange[0];

    if (localPriceRange[1] === "" || isNaN(maxPrice)) {
      setPriceRange([minPrice, undefined]);
      setError(null);
      return;
    }

    if (minPrice === undefined || maxPrice >= minPrice) {
      setPriceRange([minPrice, maxPrice]);
      setError(null);
    } else {
      setError("El valor máximo no puede ser menor al valor mínimo");
    }
  };

  return (
    <>
      <div className="flex gap-2 items-center">
        <CustomInputWithoutFormik
          label="Precio Mínimo"
          name="minPrice"
          type="number"
          placeholder="Ingrese el precio"
          value={localPriceRange[0] || ""}
          onValueChange={(value) =>
            setLocalPriceRange([value, localPriceRange[1]])
          }
          onBlur={handleMinPriceBlur}
        />
        <CustomInputWithoutFormik
          label="Precio Máximo"
          name="maxPrice"
          type="number"
          placeholder="Ingrese el precio"
          value={localPriceRange[1] || ""}
          onValueChange={(value) =>
            setLocalPriceRange([localPriceRange[0], value])
          }
          onBlur={handleMaxPriceBlur}
        />
      </div>
      {error && (
        <span className="text-danger text-[0.8125rem] mt-1">{error}</span>
      )}
    </>
  );
};
