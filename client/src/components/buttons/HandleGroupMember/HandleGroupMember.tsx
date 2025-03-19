import React, { useRef, useState } from "react";
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
import { handleGroupNotificationError } from "@/components/notifications/groups/actions";

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
  const { userIdLogged, usernameLogged } = useUserData();
  const { socket } = useSocket();
  const isCreator = group?.creator._id === userIdLogged; // is user logged creator of group
  const [isAdminLocal, setIsAdminLocal] = useState(isAdmin); // is user been shown admin
  const [deletedDone, setDeletedDone] = useState(false);

  const makeAdmin = async () => {
    const res = await addAdmin(group?._id, user._id);
    if ("error" in res) {
      toastifyError(res.error as string);
      return;
    }

    emitGroupNotification(
      socket,
      group,
      { username: usernameLogged as string, _id: userIdLogged as string },
      user._id,
      "notification_group_user_new_admin",
      null
    )
      .then(() => {
        toastifySuccess(res.message);
        setIsAdminLocal(true);
      })
      .catch(handleGroupNotificationError);
  };

  const deleteMember = async () => {
    const res = await removeMember(group._id as string, [user._id]);
    if ("error" in res) {
      toastifyError(res.error as string);
      return;
    }

    emitGroupNotification(
      socket,
      group,
      { username: usernameLogged as string, _id: userIdLogged as string },
      user._id,
      "notification_group_user_removed_from_group",
      null
    )
      .then(() => {
        toastifySuccess(res.message);
        setDeletedDone(true);
      })
      .catch(handleGroupNotificationError);
  };

  const deleteAdmin = async () => {
    const res = await removeAdmin(group._id as string, [user._id]);
    if ("error" in res) {
      toastifyError(res.error as string);
      return;
    }

    emitGroupNotification(
      socket,
      group,
      { username: usernameLogged as string, _id: userIdLogged as string },
      user._id,
      "notification_group_user_removed_admin",
      null
    )
      .then(() => {
        toastifySuccess(res.message);
        setIsAdminLocal(false);
      })
      .catch(handleGroupNotificationError);
  };

  const assignAdminRef = useRef<() => void>(() => {});

  const handleAssignAdminClick = () => {
    if (assignAdminRef.current) {
      assignAdminRef.current(); // Trigger custom open function to open the modal
    }
  };

  return (
    <div className="flex gap-2 items-center">
      {!isAdminLocal && (
        <>
          <Dropdown placement="bottom">
            <DropdownTrigger>
              <Button
                size="sm"
                isIconOnly
                aria-label="acciones de miembro de grupo"
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
                aria-label="Eliminar miembro de grupo"
                color="danger"
                variant="flat"
                isDisabled={deletedDone}
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

      {isCreator && isAdminLocal && (
        <>
          <Dropdown placement="bottom">
            <DropdownTrigger>
              <Button
                size="sm"
                isIconOnly
                aria-label="acciones de administrador de grupo"
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
