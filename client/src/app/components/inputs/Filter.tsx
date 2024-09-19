import { categories } from "@/app/utils/data/mockedData";
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
  Slider,
  useDisclosure,
} from "@nextui-org/react";
import { Dispatch, SetStateAction, useState } from "react";
import { FaFilter } from "react-icons/fa6";

const Filter = ({
  filter,
  setFilter,
}: {
  filter: {
    category: string[];
    priceRange: number[];
  };
  setFilter: Dispatch<
    SetStateAction<{
      category: string[];
      priceRange: number[];
    }>
  >;
}) => {
  const { isOpen, onOpen, onOpenChange } = useDisclosure();
  const [category, setCategory] = useState<Selection>(new Set([""]));
  const [priceRange, setPriceRange] = useState([0, 200000000]);

  const filterPosts = () => {
    console.log(Array.from(category));
    setFilter({ category: Array.from(category) as string[], priceRange });
  };
  console.log(filter);
  return (
    <>
      <Button
        onPress={onOpen}
        isIconOnly
        color="secondary"
        variant="bordered"
        radius="full"
      >
        <FaFilter />
      </Button>
      <Modal isOpen={isOpen} onOpenChange={onOpenChange}>
        <ModalContent>
          {(onClose) => (
            <>
              <ModalHeader className="flex flex-col gap-1">
                Filtrar Anuncios
              </ModalHeader>
              <ModalBody>
                <SelectCategory category={category} setCategory={setCategory} />
                <PriceRange
                  priceRange={priceRange}
                  setPriceRange={setPriceRange}
                />
              </ModalBody>
              <ModalFooter>
                <Button color="danger" variant="light" onPress={onClose}>
                  Cerrar
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

export default Filter;

const SelectCategory = ({
  category,
  setCategory,
}: {
  category: Selection;
  setCategory: Dispatch<SetStateAction<Selection>>;
}) => {
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
  priceRange: number[];
  setPriceRange: Dispatch<SetStateAction<number[]>>;
}) => {
  return (
    <Slider
      label="Rango de precios"
      step={1000}
      minValue={0}
      maxValue={200000000}
      value={priceRange}
      onChange={(value) => setPriceRange(value as number[])}
      formatOptions={{ style: "currency", currency: "ARS" }}
      className="max-w-md"
    />
  );
};
