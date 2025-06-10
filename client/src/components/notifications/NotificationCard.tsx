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
  HTMLNextUIProps,
  LinkProps,
} from "@nextui-org/react";
import { FaEllipsis } from "react-icons/fa6";

const NotificationCard = ({
  isNew,
  children,
  id,
}: {
  isNew: boolean;
  id: string;
  children: React.ReactNode;
}) => {
  return (
    <Card
      shadow={isNew ? "sm" : "none"}
      isHoverable
      id={id}
      className={`flex flex-row relative max-w-96 ${isNew ? "bg-fondo" : ""}`}
    >
      {children}
    </Card>
  );
};

const NotificationImage = ({ children }: { children: React.ReactNode }) => {
  return (
    <CardHeader className="max-w-20 max-h-20 lg:max-w-24 2xl:max-w-28 lg:max-h-24 2xl:max-h-28 p-2 justify-center">
      {children}
    </CardHeader>
  );
};

const NotificationBody = (props: HTMLNextUIProps<"div", never> & LinkProps) => {
  return (
    <CardBody {...props} className={`flex-1 text-sm px-1 ${props.className}`}>
      {props.children}
    </CardBody>
  );
};

export interface NotificationOptionProps extends DropdownItemProps {
  label: string;
  color?: "default" | "danger";
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
            aria-label="Opciones"
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
