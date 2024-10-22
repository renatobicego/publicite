import {
  Popover,
  PopoverTrigger,
  Button,
  Badge,
  PopoverContent,
} from "@nextui-org/react";
import { Dispatch, SetStateAction, useState } from "react";
import { FaBell } from "react-icons/fa6";
import NotificationsContent from "./NotificationContent";

const DesktopNotifications = ({
  newNotifications,
  setNewNotifications,
}: {
  newNotifications: boolean;
  setNewNotifications: Dispatch<SetStateAction<boolean>>;
}) => {
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
      onOpenChange={(open) => {
        if(open) setNewNotifications(false)
        setIsOpen(open)
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
        {isOpen ? <NotificationsContent /> : <></>}
      </PopoverContent>
    </Popover>
  );
};

export default DesktopNotifications;
