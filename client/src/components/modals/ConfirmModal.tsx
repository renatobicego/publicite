"use client"
import {
  Button,
  Modal,
  ModalContent,
  ModalFooter,
  ModalHeader,
  Tooltip,
  useDisclosure,
} from "@nextui-org/react";
import React, { useEffect } from "react";

const ConfirmModal = ({
  ButtonAction,
  message,
  tooltipMessage,
  confirmText,
  onConfirm,
  customOpen,
}: {
  ButtonAction: JSX.Element;
  message: string;
  tooltipMessage: string;
  confirmText: string;
  onConfirm: () => void;
  customOpen?: (openModal: () => void) => void; // Custom open function
}) => {
  const { isOpen, onOpen, onOpenChange } = useDisclosure();

  useEffect(() => {
    // If customOpen is passed, set the openModal function to it
    if (customOpen) {
      customOpen(onOpen);
    }
  }, [customOpen, onOpen]);
  return (
    <>
      <Tooltip placement="bottom" content={tooltipMessage}>
        {React.cloneElement(ButtonAction, { onPress: onOpen })}
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
                {message}
              </ModalHeader>
              <ModalFooter>
                <Button
                  color="secondary"
                  variant="solid"
                  radius="full"
                  onPress={onClose}
                >
                  Cancelar
                </Button>
                <Button
                  color="danger"
                  radius="full"
                  variant="solid"
                  onPress={() => {
                    onClose();
                    onConfirm();
                  }}
                >
                  {confirmText}
                </Button>
              </ModalFooter>
            </>
          )}
        </ModalContent>
      </Modal>
    </>
  );
};

export default ConfirmModal;
