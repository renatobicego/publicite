import {
  useDisclosure,
  Button,
  Badge,
  Modal,
  ModalContent,
  ModalHeader,
  ModalBody,
} from "@nextui-org/react";
import { FaBell, FaX } from "react-icons/fa6";
import NotificationsContent from "./NotificationContent";
import { useSocket } from "@/app/socketProvider";
import { useNotificationsContext } from "@/app/(root)/providers/notificationsProvider";
import { putNotificationStatus } from "@/services/userServices";
import { useNotificationsIsOpen } from "./notificationsOptionsProvider";

const MobileNotifications = () => {
  const { isOpen, setIsOpen } = useNotificationsIsOpen();
  const { isOpen: modalIsOpen } = useDisclosure({ isOpen });
  const { newNotifications: newNotificationsReceived, setNewNotifications } =
    useSocket();

  const {
    notifications,
    isLoading,
    newNotificationsFromServer,
    setNewNotificationsFromServer,
  } = useNotificationsContext();

  return (
    <>
      <Button
        onPress={() => setIsOpen(true)}
        radius="full"
        variant="light"
        isIconOnly
        aria-label="botón para abrir centro de notificaciones"
        className="lg:hidden min-w-0"
      >
        {newNotificationsFromServer || newNotificationsReceived ? (
          <Badge content="" size="sm" color="primary">
            <FaBell className="size-6" />
          </Badge>
        ) : (
          <FaBell className="size-6" />
        )}
      </Button>
      <Modal
        classNames={{
          body: "max-h-[80vh] overflow-y-auto px-2 items-center",
          header: "px-4",
        }}
        placement="center"
        className="max-md:px-4"
        isOpen={modalIsOpen}
        onOpenChange={(open) => {
          setIsOpen(!open);
        }}
        closeButton={
          <Button
            size="sm"
            variant="light"
            isIconOnly
            aria-label="cerrar modal de notificaciones"
            onPress={async () => {
              setNewNotifications(false);
              setNewNotificationsFromServer(false);
              setIsOpen(false);
              await putNotificationStatus(
                notifications
                  .filter((notification) => !notification.viewed)
                  .map((notification) => notification._id)
              );
            }}
          >
            <FaX />
          </Button>
        }
      >
        <ModalContent>
          {(onClose) => (
            <>
              <ModalHeader>
                <h5>Notificaciones</h5>
              </ModalHeader>
              <ModalBody id="notifications-popover">
                <NotificationsContent
                  notifications={notifications}
                  isLoading={isLoading}
                />
              </ModalBody>
            </>
          )}
        </ModalContent>
      </Modal>
    </>
  );
};

export default MobileNotifications;
