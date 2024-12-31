import PlaceAutocomplete from "@/components/inputs/PlaceAutocomplete";
import { categories } from "@/utils/data/mockedData";
import {
  Button,
  Modal,
  ModalBody,
  ModalContent,
  ModalFooter,
  ModalHeader,
  useDisclosure,
} from "@nextui-org/react";
import { Dispatch, SetStateAction, useState } from "react";
import { FaFilter, FaX } from "react-icons/fa6";

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
        aria-label="Filtrar usuarios"
        color="secondary"
        variant="bordered"
        radius="full"
        className="max-md:size-8 max-md:min-w-8"
      >
        <FaFilter />
      </Button>
      {location && (
        <Button
          size="sm"
          color="secondary"
          variant="ghost"
          className="min-w-fit"
          radius="full"
          onPress={() => {
            setLocation("");
            setFilter({ location: "" });
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
                Filtrar Usuarios
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
                <Button
                  color="danger"
                  variant="light"
                  onPress={() => {
                    onClose();
                    setLocation("");
                  }}
                >
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

export default FilterUsers;
