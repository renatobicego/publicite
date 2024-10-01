import {
  Button,
  Card,
  CardBody,
  CardFooter,
  CardHeader,
  Dropdown,
  DropdownItem,
  DropdownItemProps,
  DropdownMenu,
  DropdownTrigger,
} from "@nextui-org/react";
import { FaEllipsis } from "react-icons/fa6";

const NotificationCard = ({ children }: { children: React.ReactNode }) => {
  return (
    <Card
      shadow="none"
      isHoverable
      className="flex flex-row relative max-w-96 "
    >
      {children}
    </Card>
  );
};

const NotificationImage = ({ children }: { children: React.ReactNode }) => {
  return <CardHeader className="max-w-28 max-h-28 p-2">{children}</CardHeader>;
};

const NotificationBody = ({ children }: { children: React.ReactNode }) => {
  return <CardBody className="flex-1 text-sm px-1">{children}</CardBody>;
};

export interface NotificationOptionProps extends DropdownItemProps {
  label: string;
}
const NotificationOptions = ({
  items,
  date,
}: {
  items: NotificationOptionProps[]; // Accept array of elements
  date: string;
}) => {
  return (
    <CardFooter className="flex flex-col justify-between items-end w-fit h-auto gap-2">
      <p className="text-light-text text-xs">{date}</p>
      <Dropdown>
        <DropdownTrigger className="mt-auto">
          <Button
            isIconOnly
            color="default"
            size="sm"
            radius="full"
            variant="light"
          >
            <FaEllipsis />
          </Button>
        </DropdownTrigger>
        <DropdownMenu>
          {items.map((child, index) => (
            <DropdownItem
              variant="light"
              key={index}
              {...child}
              className={`rounded-full ${child.className}}`}
            >
              {child.label}
            </DropdownItem> // Ensure each child is wrapped correctly
          ))}
        </DropdownMenu>
      </Dropdown>
    </CardFooter>
  );
};

export {
  NotificationCard,
  NotificationImage,
  NotificationBody,
  NotificationOptions,
};