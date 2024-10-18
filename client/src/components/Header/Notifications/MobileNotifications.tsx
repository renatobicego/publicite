import { useDisclosure, Button, Badge, Modal, ModalContent, ModalHeader, ModalBody } from "@nextui-org/react";
import { FaBell } from "react-icons/fa6";
import NotificationsContent from "./NotificationContent";

const MobileNotifications = () => {
  const { isOpen, onOpen, onOpenChange } = useDisclosure();

  return (
    <>
      <Button
        onPress={onOpen}
        radius="full"
        variant="light"
        isIconOnly
        className="lg:hidden"
      >
        <Badge content="" size="sm" color="primary">
          <FaBell className="size-6" />
        </Badge>
      </Button>
      <Modal
        classNames={{ body: "max-h-[80vh] overflow-y-auto px-0", header: "px-0" }}
        placement="center"
        className="max-md:px-4"
        isOpen={isOpen}
        onOpenChange={onOpenChange}
      >
        <ModalContent>
          <ModalHeader>
            <h5>Notificaciones</h5>
          </ModalHeader>
          <ModalBody>{isOpen && <NotificationsContent />}</ModalBody>
        </ModalContent>
      </Modal>
    </>
  );
};

export default MobileNotifications;