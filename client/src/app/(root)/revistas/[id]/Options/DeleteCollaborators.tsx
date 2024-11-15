import { useUserData } from "@/app/(root)/providers/userDataProvider";
import { useSocket } from "@/app/socketProvider";
import { emitMagazineNotification } from "@/components/notifications/magazines/emitNotifications";
import { Magazine } from "@/types/magazineTypes";
import { User } from "@/types/userTypes";
import { toastifyError, toastifySuccess } from "@/utils/functions/toastify";
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
import { cloneElement, useEffect, useState } from "react";

const DeleteCollaborators = ({
  ButtonAction,
  customOpen,
  collaborators,
  ownerType,
  magazine,
}: {
  customOpen?: (openModal: () => void) => void;
  ButtonAction: JSX.Element;
  collaborators: User[];
  ownerType: "user" | "group";
  magazine: Magazine;
}) => {
  const { isOpen, onOpen, onOpenChange } = useDisclosure();
  const [selected, setSelected] = useState<string[]>([]);
  const { updateSocketToken } = useSocket();
  const { userIdLogged, usernameLogged } = useUserData();

  useEffect(() => {
    // If customOpen is passed, set the openModal function to it
    if (customOpen) {
      customOpen(onOpen);
    }
  }, [customOpen, onOpen]);

  const handleDelete = async () => {
    const newSocket = await updateSocketToken();
    selected.forEach((collaboratorId) => {
      emitMagazineNotification(
        newSocket,
        {
          _id: magazine._id,
          name: magazine.name,
          ownerType: ownerType,
        },
        {
          username: usernameLogged as string,
          _id: userIdLogged as string,
        },
        collaboratorId,
        "notification_magazine_user_has_been_removed"
      );
    });
  };
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
                  label="Seleccionar"
                  value={selected}
                  onValueChange={setSelected}
                >
                  {collaborators.map((collaborator) => (
                    <Checkbox
                      classNames={{
                        base: "flex items-center gap-2",
                        label: "flex gap-2 items-center",
                      }}
                      value={collaborator._id}
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
