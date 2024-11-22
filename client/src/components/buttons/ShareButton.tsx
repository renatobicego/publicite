"use client";
import {
  Button,
  Modal,
  ModalBody,
  ModalContent,
  ModalFooter,
  ModalHeader,
  Snippet,
  Tooltip,
  useDisclosure,
} from "@nextui-org/react";
import { FaShareAlt } from "react-icons/fa";
import PrimaryButton from "./PrimaryButton";
import { Group } from "@/types/groupTypes";
import { Post } from "@/types/postTypes";
import { Magazine } from "@/types/magazineTypes";
import useSearchUsers from "@/utils/hooks/useSearchUsers";
import { useEffect, useState } from "react";
import { SearchUsers } from "../inputs/SearchUsers";

type ShareButtonProps =
  | { shareType: "group"; data: Group }
  | { shareType: "post"; data: Post }
  | { shareType: "magazine"; data: Magazine };

const ShareButton = ({ shareType, data }: ShareButtonProps) => {
  const { isOpen, onOpenChange } = useDisclosure();
  const { users, getUsersByQuery } = useSearchUsers();
  const [selectedUsers, setSelectedUsers] = useState<string[]>([]);
  const url = window.location.href;
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

  const handleShare = () => {
    switch (shareType) {
      case "group":
        // Handle sharing logic for a group
        console.log("Sharing group:", data);
        break;
      case "post":
        // Handle sharing logic for a post
        console.log("Sharing post:", data);
        break;
      case "magazine":
        // Handle sharing logic for a magazine
        console.log("Sharing magazine:", data);
        break;
    }
  };
  return (
    <>
      <Tooltip placement="bottom" content="Compartir">
        <Button
          isIconOnly
          variant="flat"
          color="secondary"
          radius="full"
          className="p-1"
          onPress={onOpenChange}
        >
          <FaShareAlt />
        </Button>
      </Tooltip>
      <Modal placement="center" isOpen={isOpen} onOpenChange={onOpenChange}>
        <ModalContent>
          {(onClose) => (
            <>
              <ModalHeader className="flex flex-col gap-1">
                Compartir
              </ModalHeader>
              <ModalBody>
                <Snippet
                  symbol=""
                  tooltipProps={{
                    content: "Copiar",
                  }}
                  classNames={{
                    pre: "text-ellipsis overflow-hidden",
                  }}
                  variant="bordered"
                >
                  {url}
                </Snippet>
                <SearchUsers
                  items={users}
                  label="Buscar contactos"
                  onValueChange={(value: string | null) =>
                    getUsersByQuery(value)
                  }
                  onSelectionChange={handleSelectionChange}
                />
              </ModalBody>
              <ModalFooter>
                <PrimaryButton variant="light" onPress={onClose}>
                  Cerrar
                </PrimaryButton>
                <PrimaryButton onPress={handleShare}>Compartir</PrimaryButton>
              </ModalFooter>
            </>
          )}
        </ModalContent>
      </Modal>
    </>
  );
};

export default ShareButton;
