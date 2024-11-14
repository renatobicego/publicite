import UsernameAvatar from "@/components/buttons/UsernameAvatar";
import { User } from "@/types/userTypes";
import {
  useDisclosure,
  Tooltip,
  Modal,
  ModalContent,
  ModalHeader,
  ModalFooter,
  Button,
  ModalBody,
  CheckboxGroup,
  Checkbox,
  Avatar,
} from "@nextui-org/react";
import { cloneElement, useEffect } from "react";

const DeleteCollaborators = ({
  ButtonAction,
  customOpen,
  collaborators,
  ownerType,
}: {
  customOpen?: (openModal: () => void) => void;
  ButtonAction: JSX.Element;
  collaborators: User[];
  ownerType: "user" | "group";
}) => {
  const { isOpen, onOpen, onOpenChange } = useDisclosure();
  console.log(collaborators);

  useEffect(() => {
    // If customOpen is passed, set the openModal function to it
    if (customOpen) {
      customOpen(onOpen);
    }
  }, [customOpen, onOpen]);

  const handleDelete = async () => {};
  return (
    <>
      <Tooltip placement="bottom" content={"Eliminar colaboradores"}>
        {cloneElement(ButtonAction, { onPress: onOpen })}
      </Tooltip>
      <Modal
        radius="lg"
        className="p-2"
        classNames={{
          wrapper: "z-[100000000]",
          backdrop: "z-[100000000]",
        }}
        backdrop="blur"
        placement="center"
        isOpen={isOpen}
        onOpenChange={onOpenChange}
      >
        <ModalContent>
          {(onClose) => (
            <>
              <ModalHeader className="flex flex-col gap-1">
                Eliminar Colaboradores
              </ModalHeader>
              <ModalBody>
                <CheckboxGroup
                  label="Select cities"
                  defaultValue={["buenos-aires", "london"]}
                >
                  {collaborators.map((collaborator) => (
                    <Checkbox
                      classNames={{
                        base: "flex items-center gap-2",
                        label: "flex gap-2 items-center",
                      }}
                      key={collaborator._id}
                    >
                      <Avatar
                        isBordered
                        src={collaborator.profilePhotoUrl}
                        size="sm"
                      />
                      <p className="text-sm">{collaborator.username}</p>
                    </Checkbox>
                  ))}
                </CheckboxGroup>
              </ModalBody>
              <ModalFooter>
                <Button
                  color="danger"
                  variant="light"
                  radius="full"
                  onPress={onClose}
                >
                  Cancelar
                </Button>
                <Button
                  color="danger"
                  radius="full"
                  onPress={() => {
                    onClose();
                    handleDelete();
                  }}
                >
                  Eliminar
                </Button>
              </ModalFooter>
            </>
          )}
        </ModalContent>
      </Modal>
    </>
  );
};

export default DeleteCollaborators;
