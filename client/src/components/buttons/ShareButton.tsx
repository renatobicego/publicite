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
import { cloneElement, useEffect, useState } from "react";
import { SearchUsers } from "../inputs/SearchUsers";
import { User } from "@/types/userTypes";

type ShareButtonBaseProps = {
  ButtonAction?: JSX.Element;
  customOpen?: (openModal: () => void) => void;
};

type ShareButtonProps =
  | ({ shareType: "group"; data: Group } & ShareButtonBaseProps)
  | ({ shareType: "post"; data: Post } & ShareButtonBaseProps)
  | ({ shareType: "user"; data: User } & ShareButtonBaseProps)
  | ({ shareType: "magazine"; data: Magazine } & ShareButtonBaseProps);

const ShareButton = ({
  shareType,
  data,
  ButtonAction = DefaultShareButton,
  customOpen,
}: ShareButtonProps) => {
  const { onOpen, isOpen, onOpenChange } = useDisclosure();
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

  useEffect(() => {
    // If customOpen is passed, set the openModal function to it
    if (customOpen) {
      customOpen(onOpen);
    }
  }, [customOpen, onOpen]);

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
      {cloneElement(ButtonAction, { onPress: onOpen })}

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

const DefaultShareButton = (
  <Tooltip placement="bottom" content="Compartir">
    <Button
      isIconOnly
      variant="flat"
      color="secondary"
      radius="full"
      className="p-1"
    >
      <FaShareAlt />
    </Button>
  </Tooltip>
);
