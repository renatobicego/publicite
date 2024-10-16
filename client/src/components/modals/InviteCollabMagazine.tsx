"use client";
import {
  Button,
  Modal,
  ModalBody,
  ModalContent,
  ModalFooter,
  ModalHeader,
  useDisclosure,
} from "@nextui-org/react";
import SecondaryButton from "../buttons/SecondaryButton";
import { Magazine } from "@/types/postTypes";
import { SearchUsers } from "../inputs/SelectUsers";
import useSearchUsers from "@/utils/hooks/useSearchUsers";
import { useEffect, useState } from "react";

const InviteCollabMagazine = ({ magazine }: { magazine: Magazine }) => {
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
  }, [isOpen])
  console.log(selectedUsers)
  return (
    <>
      <SecondaryButton onPress={onOpen} variant="flat" className="order-last">
        Invitar Colaboradores
      </SecondaryButton>
      <Modal
        radius="lg"
        className="p-2"
        isOpen={isOpen}
        onOpenChange={onOpenChange}
      >
        <ModalContent>
          {(onClose) => (
            <>
              <ModalHeader className="flex flex-col gap-1">
                Invitar Colaboradores a {magazine.name}
              </ModalHeader>
              <ModalBody>
                <SearchUsers
                  items={users}
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
                <Button color="primary" onPress={onClose}>
                  Invitar
                </Button>
              </ModalFooter>
            </>
          )}
        </ModalContent>
      </Modal>
    </>
  );
};

export default InviteCollabMagazine;
