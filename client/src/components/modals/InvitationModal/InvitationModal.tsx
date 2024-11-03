"use client";
import { SearchUsers } from "@/components/inputs/SelectUsers";
import useSearchUsers from "@/utils/hooks/useSearchUsers";
import {
  Button,
  Modal,
  ModalBody,
  ModalContent,
  ModalFooter,
  ModalHeader,
  useDisclosure,
} from "@nextui-org/react";
import {
  cloneElement,
  ReactElement,
  ReactNode,
  useEffect,
  useState,
} from "react";

interface InvitationModalProps {
  title: string;
  handleSubmit: (selectedUsers: string[]) => void;
  submitLabel?: string; // Optional, defaults to 'Invitar'
  triggerElement: ReactElement;
  filterUsers?: string[];
}

const InvitationModal = ({
  title,
  handleSubmit,
  submitLabel = "Invitar",
  triggerElement,
  filterUsers,
}: InvitationModalProps) => {
  const { isOpen, onOpen, onOpenChange } = useDisclosure();
  const { users, getUsersByQuery } = useSearchUsers();
  const [selectedUsers, setSelectedUsers] = useState<string[]>([]);
  const handleSelectionChange = (key: any) => {
    if (selectedUsers.includes(key)) {
      setSelectedUsers(selectedUsers.filter((item: any) => item !== key));
    } else {
      setSelectedUsers([...selectedUsers, key]);
    }
  };

  useEffect(() => {
    if (isOpen) {
      setSelectedUsers([]);
    }
  }, [isOpen]);

  // Clone the trigger element and pass the onPress handler
  const trigger = cloneElement(triggerElement, {
    onPress: onOpen,
  });
  return (
    <>
      {trigger}
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
              <ModalHeader className="flex flex-col gap-1">{title}</ModalHeader>
              <ModalBody>
                <SearchUsers
                  items={
                    filterUsers
                      ? users.filter((user) => !filterUsers.includes(user._id))
                      : users
                  }
                  onValueChange={(value: string | null) =>
                    getUsersByQuery(value)
                  }
                  onSelectionChange={handleSelectionChange}
                />
              </ModalBody>
              <ModalFooter>
                <Button color="danger" variant="light" onPress={onClose}>
                  Cerrar
                </Button>
                <Button
                  color="primary"
                  onPress={() => {
                    handleSubmit(selectedUsers);
                    onClose();
                  }}
                  isDisabled={selectedUsers.length === 0}
                >
                  {submitLabel}
                </Button>
              </ModalFooter>
            </>
          )}
        </ModalContent>
      </Modal>
    </>
  );
};

export default InvitationModal;
