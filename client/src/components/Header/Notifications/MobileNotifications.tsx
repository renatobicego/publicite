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

const MobileNotifications = () => {
  const { isOpen, onOpen, onOpenChange } = useDisclosure();
  const {newNotifications, setNewNotifications} = useSocket();
  const { notifications, fetchNotifications, isLoading, hasMore } =
    useNotifications(isOpen);
  return (
    <>
      <Button
        onPress={onOpen}
        radius="full"
        variant="light"
        isIconOnly
        className="lg:hidden"
      >
        {newNotifications ? (
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
        isOpen={isOpen}
        onOpenChange={(isOpen) => {
          if (isOpen) setNewNotifications(false);
          onOpenChange();
        }}
      >
        <ModalContent>
          <ModalHeader>
            <h5>Notificaciones</h5>
          </ModalHeader>
          <ModalBody id="notifications-popover">
            {isOpen && <NotificationsContent notifications={notifications} isLoading={isLoading}/>}
          </ModalBody>
        </ModalContent>
      </Modal>
    </>
  );
};

export default MobileNotifications;
