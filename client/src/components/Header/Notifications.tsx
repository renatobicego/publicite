import {
  Button,
  Badge,
  PopoverTrigger,
  Popover,
  PopoverContent,
} from "@nextui-org/react";
import { FaBell } from "react-icons/fa6";
import NewContactPost from "../notifications/NewContactPost";
import { mockedPosts } from "@/utils/data/mockedData";

const Notifications = () => {
  return (
    <Popover placement="bottom-end">
      <PopoverTrigger>
        <Button radius="full" variant="light" isIconOnly>
          <Badge content="" size="sm" color="primary">
            <FaBell className="size-6" />
          </Badge>
        </Button>
      </PopoverTrigger>
      <PopoverContent>
        <div className="p-2 flex flex-col gap-2">
          <div className="font-bold">Notificaciones</div>
          <NewContactPost
            notification={{
              _id: "1",
              date: "2022-01-01",
              message: "¡Has recibido una petición de contacto!",
              post: mockedPosts[0],
            }}
          />
        </div>
      </PopoverContent>
    </Popover>
  );
};

export default Notifications;
