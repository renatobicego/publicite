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

const MobileNotifications = ({
  isOpen,
  setIsOpen,
}: {
  isOpen: boolean;
  setIsOpen: React.Dispatch<React.SetStateAction<boolean>>;
}) => {
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
          body: "max-h-[80vh] overflow-y-auto px-0",
          header: "px-0",
        }}
        placement="center"
        className="max-md:px-4"
        isOpen={modalIsOpen}
        onOpenChange={(open) => {
          if (open) {
            setNewNotifications(false)
            setNewNotificationsFromServer(false)
          };
          if (newNotificationsFromServer && !open) {
            putNotificationStatus(
              notifications.map((notification) => notification._id)
            );
          }
        }}
        closeButton={
          <Button
            size="sm"
            variant="light"
            isIconOnly
            aria-label="cerrar modal de notificaciones"
            onPress={() => setIsOpen(false)}
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
