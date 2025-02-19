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
import { cloneElement, use, useEffect, useState } from "react";
import { SearchUsers } from "../inputs/SearchUsers";
import {
  ElementSharedData,
  GetUser,
  ShareTypesEnum,
  User,
} from "@/types/userTypes";
import { SignedIn } from "@clerk/nextjs";
import { emitElementSharedNotification } from "../notifications/sharedElements/emitNotifications";
import { useSocket } from "@/app/socketProvider";
import { useUserData } from "@/app/(root)/providers/userDataProvider";
import { toastifyError, toastifySuccess } from "@/utils/functions/toastify";

type ShareButtonProps = {
  ButtonAction?: JSX.Element;
  customOpen?: (openModal: () => void) => void;
  data: ElementSharedData;
  shareType: ShareTypesEnum;
};

const ShareButton = ({
  shareType,
  data,
  ButtonAction,
  customOpen,
}: ShareButtonProps) => {
  const { onOpen, isOpen, onOpenChange } = useDisclosure();
  const { userIdLogged, usernameLogged } = useUserData();
  const { users } = useSearchUsers(undefined, usernameLogged);
  const { socket } = useSocket();
  const [selectedUsers, setSelectedUsers] = useState<string[]>([]);
  const url = window.location.href;

  const [filteredUsers, setFilteredUsers] = useState(users);

  useEffect(() => {
    setFilteredUsers(users); // Ensure filteredUsers updates when users change
  }, [users]);

  const handleSearchChange = (query: string) => {
    if (query.trim() === "") {
      setFilteredUsers(users); // Reset to original users list
    } else {
      setFilteredUsers(
        users.filter((user) =>
          user.username.toLowerCase().includes(query.toLowerCase())
        )
      );
    }
  };
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
    selectedUsers.forEach((user) =>
      emitElementSharedNotification(
        socket,
        userIdLogged as string,
        user,
        data,
        shareType
      )
        .then(() => {
          toastifySuccess(
            "Elemento compartido correctamente a " +
              users.find((u) => u._id === user)?.username
          );
        })
        .catch(() =>
          toastifyError(
            "Error al compartir el elemento a " +
              users.find((u) => u._id === user)?.username
          )
        )
    );
  };
  return (
    <>
      {ButtonAction ? (
        cloneElement(ButtonAction, { onPress: onOpen })
      ) : (
        <Tooltip placement="bottom" content="Compartir">
          <Button
            isIconOnly
            aria-label="Compartir"
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
                        items={filteredUsers}
                        label="Buscar contactos"
                        onValueChange={handleSearchChange}
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
