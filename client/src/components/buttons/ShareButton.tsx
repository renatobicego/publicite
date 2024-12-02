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
import { GetUser, User } from "@/types/userTypes";
import { SignedIn } from "@clerk/nextjs";

type ShareButtonBaseProps = {
  ButtonAction?: JSX.Element;
  customOpen?: (openModal: () => void) => void;
};

type ShareButtonProps =
  | ({ shareType: "group"; data: Group } & ShareButtonBaseProps)
  | ({ shareType: "post"; data: Post } & ShareButtonBaseProps)
  | ({ shareType: "user"; data: User | GetUser } & ShareButtonBaseProps)
  | ({ shareType: "magazine"; data: Magazine } & ShareButtonBaseProps);

const ShareButton = ({
  shareType,
  data,
  ButtonAction,
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
      {ButtonAction ? (
        cloneElement(ButtonAction, { onPress: onOpen })
      ) : (
        <Tooltip placement="bottom" content="Compartir">
          <Button
            isIconOnly
            variant="flat"
            color="secondary"
            radius="full"
            className="p-1"
            onPress={onOpen}
          >
            <FaShareAlt />
          </Button>
        </Tooltip>
      )}

      <Modal placement="center" isOpen={isOpen} onOpenChange={onOpenChange}>
        <ModalContent>
          {(onClose) => (
            <>
              <ModalHeader className="flex flex-col gap-1">
                Compartir
              </ModalHeader>
              <ModalBody>
                {isOpen && (
                  <>
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
                    <SignedIn>
                      <SearchUsers
                        items={users}
                        label="Buscar contactos"
                        onValueChange={(value: string | null) =>
                          getUsersByQuery(value)
                        }
                        onSelectionChange={handleSelectionChange}
                      />
                    </SignedIn>
                  </>
                )}
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
