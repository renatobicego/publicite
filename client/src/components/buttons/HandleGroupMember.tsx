import React, { useRef } from "react";
import { User } from "@/types/userTypes";
import {
  Button,
  Dropdown,
  DropdownItem,
  DropdownMenu,
  DropdownTrigger,
} from "@nextui-org/react";
import { FaPencil, FaTrash } from "react-icons/fa6";
import ConfirmModal from "../modals/ConfirmModal";
import { addAdmin } from "@/app/server/groupActions";
import { toastifyError, toastifySuccess } from "@/utils/functions/toastify";
import { useRouter } from "next-nprogress-bar";

const HandleGroupMember = ({
  user,
  nameToShow,
  groupId,
  isAdmin,
}: {
  user: User;
  nameToShow: string;
  groupId?: string;
  isAdmin?: boolean;
}) => {
  const router = useRouter();
  const makeAdmin = async () => {
    if (groupId) {
      const res = await addAdmin(groupId, [user._id]);
      if ("error" in res) {
        toastifyError(res.error as string);
        return;
      }
      toastifySuccess(res.message);
      router.refresh();
    }
  };

  const assignAdminRef = useRef<() => void>(() => {});

  const handleAssignAdminClick = () => {
    if (assignAdminRef.current) {
      assignAdminRef.current(); // Trigger custom open function to open the modal
    }
  };

  return (
    <div className="flex gap-2 items-center">
      {!isAdmin && (
        <>
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
              <DropdownItem
                className="rounded-full"
                key="assign-admin"
                color="secondary"
                onClick={handleAssignAdminClick} // Open ConfirmModal on dropdown item click
              >
                Asignar como administrador
              </DropdownItem>
            </DropdownMenu>
          </Dropdown>
          <ConfirmModal
            ButtonAction={<></>}
            message={`¿Desea asignar a ${nameToShow} como administrador del grupo?`}
            tooltipMessage="Asignar"
            confirmText="Asignar"
            onConfirm={makeAdmin}
            customOpen={(openModal) => (assignAdminRef.current = openModal)} // Set the reference for customOpen
          />
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
            onConfirm={() => {}}
          />
        </>
      )}
    </div>
  );
};

export default HandleGroupMember;
