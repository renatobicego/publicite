import {
  useDisclosure,
  Button,
  Badge,
  Modal,
  ModalContent,
  ModalHeader,
  ModalBody,
} from "@nextui-org/react";
import { FaBell } from "react-icons/fa6";
import NotificationsContent from "./NotificationContent";
import useNotifications from "@/utils/hooks/useNotifications";
import { useSocket } from "@/app/socketProvider";
import { useNotificationsContext } from "@/app/(root)/providers/notificationsProvider";

const MobileNotifications = ({
  isOpen,
  setIsOpen,
}: {
  isOpen: boolean;
  setIsOpen: React.Dispatch<React.SetStateAction<boolean>>;
}) => {
  const { isOpen: modalIsOpen, onOpen, onOpenChange } = useDisclosure({ isOpen });
  const { newNotifications: newNotificationsReceived, setNewNotifications } =
    useSocket();

  const { notifications, isLoading } = useNotificationsContext();

  const newNotifications = notifications.some(
    (notification) => !notification.notification.viewed
  );
  return (
    <>
      <Button
        onPress={onOpen}
        radius="full"
        variant="light"
        isIconOnly
        className="lg:hidden min-w-0"
      >
        {newNotifications || newNotificationsReceived ? (
          <Badge content="" size="sm" color="primary">
            <FaBell className="size-6" />
          </Badge>
        ) : (
          <FaBell className="size-6" />
        )}
      </Button>
      <Modal
        classNames={{
          body: "max-h-[80vh] overflow-y-auto px-0",
          header: "px-0",
        }}
        placement="center"
        className="max-md:px-4"
        isOpen={modalIsOpen}
        onOpenChange={(isOpen) => {
          if (isOpen) {
            setNewNotifications(false)
            setIsOpen(false);
          };
          onOpenChange();
        }}
      >
        <ModalContent>
          <ModalHeader>
            <h5>Notificaciones</h5>
          </ModalHeader>
          <ModalBody id="notifications-popover">
            {isOpen && (
              <NotificationsContent
                notifications={notifications}
                isLoading={isLoading}
              />
            )}
          </ModalBody>
        </ModalContent>
      </Modal>
    </>
  );
};

export default MobileNotifications;
