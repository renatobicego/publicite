import { SearchUsers } from "@/components/inputs/SearchUsers";
import { User } from "@/types/userTypes";
import {
  Button,
  Modal,
  ModalBody,
  ModalContent,
  ModalFooter,
  ModalHeader,
} from "@nextui-org/react";
import { Key, useState } from "react";

const ExitGroupAsCreator = ({
  isOpen,
  onOpenChange,
  admins,
  exitGroup,
}: {
  isOpen: boolean;
  onOpenChange: (isOpen: boolean) => void;
  admins: User[];
  exitGroup: (newCreatorId?: string) => Promise<void>;
}) => {
  const [selectedUser, setSelectedUser] = useState<Key | null>(null);
  const handleSelectionChange = (key: Key | null) => {
    setSelectedUser(key);
  };
  return (
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
              Para salir del grupo, asigne un nuevo dueño de grupo
            </ModalHeader>
            <ModalBody>
              <SearchUsers
                items={admins}
                showOnlyUsername
                onValueChange={() => {}}
                onSelectionChange={handleSelectionChange}
                description={
                  admins.length === 0
                    ? "No hay administradores. Asigne a un administrador primero antes de salir del grupo"
                    : undefined
                }
              />
            </ModalBody>
            <ModalFooter>
              <Button color="danger" variant="light" onPress={onClose}>
                Cerrar
              </Button>
              <Button
                color="primary"
                onPress={async () => {
                  if (!selectedUser) return;
                  await exitGroup(selectedUser.toString());
                  onClose();
                }}
                isDisabled={!selectedUser}
              >
                Salir de Grupo
              </Button>
            </ModalFooter>
          </>
        )}
      </ModalContent>
    </Modal>
  );
};

export default ExitGroupAsCreator;
