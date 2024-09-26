import { Button, Modal, ModalContent, ModalFooter, ModalHeader, Tooltip, useDisclosure } from "@nextui-org/react";
import React from "react";

const ConfirmModal = ({
  ButtonAction,
  message,
  tooltipMessage,
  confirmText,
}: {
  ButtonAction: JSX.Element;
  message: string;
  tooltipMessage: string;
  confirmText: string;
}) => {
  const { isOpen, onOpen, onOpenChange } = useDisclosure();

  return (
    <>
      <Tooltip placement="bottom" content={tooltipMessage}>
        {React.cloneElement(ButtonAction, { onPress: onOpen })}
      </Tooltip>
      <Modal radius="lg" className="p-2"  isOpen={isOpen} onOpenChange={onOpenChange}>
        <ModalContent>
          {(onClose) => (
            <>
              <ModalHeader className="flex flex-col gap-1">
                {message}
              </ModalHeader>
              <ModalFooter>
                <Button
                  color="secondary"
                  variant="light"
                  radius="full"
                  onPress={onClose}
                >
                  Cancelar
                </Button>
                <Button color="danger" radius="full" onPress={onClose}>
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
