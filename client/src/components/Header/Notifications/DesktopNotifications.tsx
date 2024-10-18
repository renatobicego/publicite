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

const DesktopNotifications = () => {
  const [isOpen, setIsOpen] = useState(false);
  return (
    <Popover
      className=" max-lg:hidden"
      shouldBlockScroll
      placement="bottom-end"
      triggerType="menu"
      containerPadding={10}
      backdrop="transparent"
      classNames={{
        base: "max-h-[60vh] overflow-y-auto shadow-lg rounded-xl",
        content: "mt-2",
      }}
      isOpen={isOpen}
      onOpenChange={(open) => setIsOpen(open)}
    >
      <PopoverTrigger>
        <Button radius="full" variant="light" isIconOnly>
          <Badge content="" size="sm" color="primary">
            <FaBell className="size-6" />
          </Badge>
        </Button>
      </PopoverTrigger>
      <PopoverContent>
        {isOpen ? <NotificationsContent /> : <></>}
      </PopoverContent>
    </Popover>
  );
};

export default DesktopNotifications;
