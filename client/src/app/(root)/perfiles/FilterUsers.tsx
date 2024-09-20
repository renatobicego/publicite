import PlaceAutocomplete from "@/app/components/inputs/PlaceAutocomplete";
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

const FilterUsers = ({
  setFilter,
}: {
  setFilter: Dispatch<
    SetStateAction<{
      location: string;
    }>
  >;
}) => {
  const { isOpen, onOpen, onOpenChange } = useDisclosure();
  const [location, setLocation] = useState("");

  const filterPosts = () => {
    setFilter({ location });
  };
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
      <Modal placement="center" isOpen={isOpen} onOpenChange={onOpenChange}>
        <ModalContent>
          {(onClose) => (
            <>
              <ModalHeader className="flex flex-col gap-1">
                Filtrar Anuncios
              </ModalHeader>
              <ModalBody>
                <PlaceAutocomplete
                  name="location"
                  onBlur={() => {}}
                  onChange={(e: {
                    target: { value: SetStateAction<string> };
                  }) => console.log}
                  onSelectionChange={(value) => setLocation(value as string)}
                  value={location}
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

export default FilterUsers;
