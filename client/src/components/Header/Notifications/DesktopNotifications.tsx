import {
  Popover,
  PopoverTrigger,
  Button,
  Badge,
  PopoverContent,
} from "@nextui-org/react";
import { useState } from "react";
import { FaBell } from "react-icons/fa6";
import NotificationsContent from "./NotificationContent";
import useNotifications from "@/utils/hooks/useNotifications";
import { useSocket } from "@/app/socketProvider";

const DesktopNotifications = () => {
  const [isOpen, setIsOpen] = useState(false);
  const { newNotifications, setNewNotifications } = useSocket();

  const { notifications, isLoading } =
    useNotifications(isOpen);

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
      onOpenChange={(open) => {
        if (open) setNewNotifications(false);
        setIsOpen(open);
      }}
    >
      <PopoverTrigger>
        <Button radius="full" variant="light" isIconOnly>
          {newNotifications ? (
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
