import { User } from "@/types/userTypes";
import {
  Button,
  Dropdown,
  DropdownItem,
  DropdownMenu,
  DropdownTrigger,
  Modal,
  ModalContent,
  ModalFooter,
  ModalHeader,
  Tooltip,
  useDisclosure,
} from "@nextui-org/react";
import { FaPencil, FaTrash } from "react-icons/fa6";
import ConfirmModal from "../modals/ConfirmModal";

const HandleGroupMember = ({
  user,
  nameToShow,
}: {
  user: User;
  nameToShow: string;
}) => {
  return (
    <div className="flex gap-2 items-center">
      <Dropdown placement="bottom">
        <DropdownTrigger>
          <Button
            size="sm"
            isIconOnly
            color="secondary"
            variant="flat"
            radius="full"
          >
            <FaPencil />
          </Button>
        </DropdownTrigger>
        <DropdownMenu aria-label="Static Actions">
          <DropdownItem key="new">Asignar como administrador</DropdownItem>
        </DropdownMenu>
      </Dropdown>
      <ConfirmModal
        ButtonAction={
          <Button
            size="sm"
            isIconOnly
            color="danger"
            variant="flat"
            radius="full"
          >
            <FaTrash />
          </Button>
        }
        message={`¿Desea eliminar a ${nameToShow} del grupo?`}
        tooltipMessage="Eliminar"
        confirmText="Eliminar"
      />
    </div>
  );
};

export default HandleGroupMember;
