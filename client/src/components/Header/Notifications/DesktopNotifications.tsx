import {
  Popover,
  PopoverTrigger,
  Button,
  Badge,
  PopoverContent,
} from "@nextui-org/react";
import { FaBell } from "react-icons/fa6";
import NotificationsContent from "./NotificationContent";
import { useSocket } from "@/app/socketProvider";
import { putNotificationStatus } from "@/services/userServices";
import { useNotificationsContext } from "@/app/(root)/providers/notificationsProvider";

const DesktopNotifications = ({
  isOpen,
  setIsOpen,
}: {
  isOpen: boolean;
  setIsOpen: React.Dispatch<React.SetStateAction<boolean>>;
}) => {
  const { newNotifications: newNotificationsReceived, setNewNotifications } =
    useSocket();

  const {
    notifications,
    isLoading,
    newNotificationsFromServer,
    setNewNotificationsFromServer,
  } = useNotificationsContext();
  return (
    <Popover
      className=" max-lg:hidden"
      shouldBlockScroll
      placement="bottom-end"
      triggerType="menu"
      containerPadding={10}
      dialogProps={{
        id: "notifications-popover",
      }}
      backdrop="transparent"
      classNames={{
        base: "max-h-[60vh] overflow-y-auto shadow-lg rounded-xl",
        content: "mt-2",
      }}
      isOpen={isOpen}
      onOpenChange={async (open) => {
        if (!open) {
          setNewNotifications(false);
          setNewNotificationsFromServer(false);
        }
        if (newNotificationsFromServer && !open) {
          await putNotificationStatus(
            notifications.map((notification) => notification._id)
          );
        }
        setIsOpen(open);
      }}
    >
      <PopoverTrigger>
        <Button radius="full" variant="light" isIconOnly>
          {newNotificationsReceived || newNotificationsFromServer ? (
            <Badge content="" size="sm" color="primary">
              <FaBell className="size-6" />
            </Badge>
          ) : (
            <FaBell className="size-6" />
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent>
        <h6 className="self-start m-2">Notificaciones</h6>

        {isOpen ? (
          <NotificationsContent
            notifications={notifications}
            isLoading={isLoading}
          />
        ) : (
          <></>
        )}
      </PopoverContent>
    </Popover>
  );
};

export default DesktopNotifications;
