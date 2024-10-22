import React, { useRef } from "react";
import { User } from "@/types/userTypes";
import {
  Button,
  Dropdown,
  DropdownItem,
  DropdownMenu,
  DropdownTrigger,
} from "@nextui-org/react";
import { FaPencil } from "react-icons/fa6";
import ConfirmModal from "../modals/ConfirmModal";
import { addAdmin, removeMember } from "@/app/server/groupActions";
import { toastifyError, toastifySuccess } from "@/utils/functions/toastify";
import { useRouter } from "next-nprogress-bar";
import { IoTrashOutline } from "react-icons/io5";
import { Group } from "@/types/groupTypes";
import { useUser } from "@clerk/nextjs";
import { useSocket } from "@/app/socketProvider";
import { emitNewAdminNotification } from "../notifications/groups/emitNotifications";

const HandleGroupMember = ({
  user,
  nameToShow,
  group,
  isAdmin,
}: {
  user: User;
  nameToShow: string;
  group?: Group;
  isAdmin?: boolean;
}) => {
  const router = useRouter();
  const { socket } = useSocket();
  const { user: userLogged } = useUser();

  const makeAdmin = async () => {
    if (group?._id) {
      const res = await addAdmin(group?._id, [user._id]);
      if ("error" in res) {
        toastifyError(res.error as string);
        return;
      }
      emitNewAdminNotification(
        socket,
        group,
        userLogged?.username as string,
        user._id
      );
      toastifySuccess(res.message);
      router.refresh();
    }
  };

  const deleteMember = async () => {
    const res = await removeMember(group?._id as string, [user._id]);
    if ("error" in res) {
      toastifyError(res.error as string);
      return;
    }
    toastifySuccess(res.message);
    router.refresh();
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
                <IoTrashOutline />
              </Button>
            }
            message={`¿Desea eliminar a ${nameToShow} del grupo?`}
            tooltipMessage="Eliminar"
            confirmText="Eliminar"
            onConfirm={deleteMember}
          />
        </>
      )}
    </div>
  );
};

export default HandleGroupMember;
