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
import ConfirmModal from "../../modals/ConfirmModal";
import { addAdmin, removeAdmin, removeMember } from "@/app/server/groupActions";
import { toastifyError, toastifySuccess } from "@/utils/functions/toastify";
import { useRouter } from "next-nprogress-bar";
import { IoTrashOutline } from "react-icons/io5";
import { Group } from "@/types/groupTypes";
import { useSocket } from "@/app/socketProvider";
import { emitGroupNotification } from "../../notifications/groups/emitNotifications";
import { useUserData } from "@/app/(root)/providers/userDataProvider";

const HandleGroupMember = ({
  user,
  nameToShow,
  group,
  isAdmin,
}: {
  user: User;
  nameToShow: string;
  group: Group;
  isAdmin?: boolean;
}) => {
  const router = useRouter();
  const { userIdLogged, usernameLogged } = useUserData();
  const { updateSocketToken } = useSocket();
  const isCreator = group?.creator._id === userIdLogged;

  const makeAdmin = async () => {
    const res = await addAdmin(group?._id, user._id);
    if ("error" in res) {
      toastifyError(res.error as string);
      return;
    }
    const socket = await updateSocketToken();
    emitGroupNotification(
      socket,
      group,
      { username: usernameLogged as string, _id: userIdLogged as string },
      user._id,
      "notification_group_user_new_admin",
      null
    );
    toastifySuccess(res.message);
    router.refresh();
  };

  const deleteMember = async () => {
    const res = await removeMember(group._id as string, [user._id]);
    if ("error" in res) {
      toastifyError(res.error as string);
      return;
    }
    const socket = await updateSocketToken();

    emitGroupNotification(
      socket,
      group,
      { username: usernameLogged as string, _id: userIdLogged as string },
      user._id,
      "notification_group_user_removed_from_group",
      null
    );
    toastifySuccess(res.message);
    router.refresh();
  };

  const deleteAdmin = async () => {
    const res = await removeAdmin(group._id as string, [user._id]);
    if ("error" in res) {
      toastifyError(res.error as string);
      return;
    }
    const socket = await updateSocketToken();

    emitGroupNotification(
      socket,
      group,
      { username: usernameLogged as string, _id: userIdLogged as string },
      user._id,
      "notification_group_user_removed_admin",
      null
    );
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
            <DropdownMenu aria-label="acciones de miembro de grupo">
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

      {isCreator && isAdmin && (
        <>
          <Dropdown placement="bottom">
            <DropdownTrigger>
              <Button
                size="sm"
                isIconOnly
                color="danger"
                variant="flat"
                radius="full"
              >
                <FaPencil />
              </Button>
            </DropdownTrigger>
            <DropdownMenu aria-label="acciones de administrador de grupo">
              <DropdownItem
                className="rounded-full"
                key="delete-admin"
                color="danger"
                onClick={handleAssignAdminClick} // Open ConfirmModal on dropdown item click
              >
                Eliminar de Administradores
              </DropdownItem>
            </DropdownMenu>
          </Dropdown>
          <ConfirmModal
            ButtonAction={<></>}
            message={`¿Desea eliminar a ${nameToShow} como administrador del grupo?`}
            tooltipMessage="Eliminar"
            confirmText="Eliminar"
            onConfirm={deleteAdmin}
            customOpen={(openModal) => (assignAdminRef.current = openModal)} // Set the reference for customOpen
          />
        </>
      )}
    </div>
  );
};

export default HandleGroupMember;
