import {
  Dropdown,
  DropdownTrigger,
  Button,
  DropdownMenu,
  DropdownItem,
  Badge,
} from "@nextui-org/react";
import { FaBell, FaChevronDown } from "react-icons/fa6";

const Notifications = () => {
  return (
    <Dropdown>
      <DropdownTrigger>
        <Button radius="full" variant="light" isIconOnly>
          <Badge content="" size="sm" color="primary">
            <FaBell className="size-6" />
          </Badge>
        </Button>
      </DropdownTrigger>
      <DropdownMenu aria-label="Static Actions">
        <DropdownItem key="new">New file</DropdownItem>
        <DropdownItem key="copy">Copy link</DropdownItem>
        <DropdownItem key="edit">Edit file</DropdownItem>
        <DropdownItem key="delete" className="text-danger" color="danger">
          Delete file
        </DropdownItem>
      </DropdownMenu>
    </Dropdown>
  );
};

export default Notifications;
