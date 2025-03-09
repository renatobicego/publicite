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
import useSearchUsers from "@/utils/hooks/useSearchUsers";
import { cloneElement, useEffect, useState } from "react";
import { SearchUsers } from "../inputs/SearchUsers";
import { ElementSharedData, ShareTypesEnum } from "@/types/userTypes";
import { SignedIn, SignedOut } from "@clerk/nextjs";
import { emitElementSharedNotification } from "../notifications/sharedElements/emitNotifications";
import { useSocket } from "@/app/socketProvider";
import { useUserData } from "@/app/(root)/providers/userDataProvider";
import { toastifyError, toastifySuccess } from "@/utils/functions/toastify";
import { shareLink } from "@/utils/functions/utils";

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
  const { userIdLogged } = useUserData();
  const { users } = useSearchUsers(undefined, userIdLogged);
  const { socket } = useSocket();
  const [isLoading, setIsLoading] = useState(false);
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

  const handleShare = async () => {
    if (!userIdLogged) {
      shareLink(url, "Compartir");
      return;
    }
    setIsLoading(true);
    await Promise.all(
      selectedUsers.map(async (user) => {
        try {
          await emitElementSharedNotification(
            socket,
            userIdLogged as string,
            user,
            data,
            shareType
          );
          toastifySuccess(
            `Elemento compartido correctamente a ${
              users.find((u) => u._id === user)?.username
            }`
          );
        } catch {
          toastifyError(
            `Error al compartir el elemento a ${
              users.find((u) => u._id === user)?.username
            }`
          );
        }
      })
    );

    // All notifications sent successfully
    setSelectedUsers([]);
    toastifySuccess("Todos los elementos fueron compartidos correctamente.");
    setIsLoading(false);
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

      <Modal
        placement="center"
        size="md"
        classNames={{
          base: "max-w-screen",
        }}
        isOpen={isOpen}
        onOpenChange={onOpenChange}
      >
        <ModalContent>
          {(onClose) => (
            <>
              <ModalHeader className="flex flex-col gap-1">
                Compartir
              </ModalHeader>
              <ModalBody>
                {isOpen && (
                  <>
                    <SignedOut>
                      <Snippet
                        symbol=""
                        title="Compartir URL"
                        aria-label="Compartir URL"
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
                    </SignedOut>
                    <SignedIn>
                      <SearchUsers
                        items={filteredUsers}
                        label="Buscar contactos"
                        onValueChange={handleSearchChange}
                        onSelectionChange={handleSelectionChange}
                      />
                      <PrimaryButton
                        size="sm"
                        variant="flat"
                        onPress={() => shareLink(url, "Compartir")}
                      >
                        Compartir URL
                      </PrimaryButton>
                    </SignedIn>
                  </>
                )}
              </ModalBody>
              <ModalFooter>
                <PrimaryButton variant="light" onPress={onClose}>
                  Cerrar
                </PrimaryButton>
                <PrimaryButton
                  isDisabled={isLoading}
                  isLoading={isLoading}
                  onPress={handleShare}
                >
                  Compartir
                </PrimaryButton>
              </ModalFooter>
            </>
          )}
        </ModalContent>
      </Modal>
    </>
  );
};

export default ShareButton;
