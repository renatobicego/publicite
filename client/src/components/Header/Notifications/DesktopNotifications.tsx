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
import { useNotificationsIsOpen } from "./notificationsOptionsProvider";
import { requestNotificationPermission } from "@/utils/notifications/browserNotifications";

const DesktopNotifications = () => {
  const { isOpen, setIsOpen } = useNotificationsIsOpen();
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
          putNotificationStatus(
            notifications
              .filter((notification) => !notification.viewed)
              .map((notification) => notification._id)
          );
        }
        setIsOpen(open);
        requestNotificationPermission();
      }}
    >
      <PopoverTrigger>
        <Button
          radius="full"
          variant="light"
          isIconOnly
          aria-label="Notificaciones"
        >
          {newNotificationsReceived || newNotificationsFromServer ? (
            <Badge
              aria-label="nuevas notificaciones"
              content=""
              size="sm"
              color="primary"
            >
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
