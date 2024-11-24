"use client";
import { exitFromGroup, removeGroup } from "@/app/server/groupActions";
import ConfirmModal from "@/components/modals/ConfirmModal";
import { GROUPS } from "@/utils/data/urls";
import { toastifyError, toastifySuccess } from "@/utils/functions/toastify";
import useUploadImage from "@/utils/hooks/useUploadImage";
import {
  Button,
  Dropdown,
  DropdownItem,
  DropdownMenu,
  DropdownTrigger,
  useDisclosure,
} from "@nextui-org/react";
import { useRouter } from "next-nprogress-bar";
import { useRef } from "react";
import { FaShareAlt } from "react-icons/fa";
import { FaChevronDown } from "react-icons/fa6";
import { IoIosExit } from "react-icons/io";
import { IoTrashOutline } from "react-icons/io5";
import ExitGroupAsCreator from "./ExitGroupAsCreator";
import { User } from "@/types/userTypes";
import ShareButton from "@/components/buttons/ShareButton";
import { Group } from "@/types/groupTypes";

const OptionsDropdown = ({
  group,
  isMember,
  isCreator,
  image,
  membersIds,
  admins,
}: {
  group: Group;
  isMember: boolean;
  isCreator: boolean;
  image?: string;
  membersIds: string[];
  admins: User[];
}) => {
  const deleteGroupRef = useRef<() => void>(() => {});
  const exitGroupRef = useRef<() => void>(() => {});
  const shareGroupRef = useRef<() => void>(() => {});
  const { isOpen, onOpenChange, onOpen } = useDisclosure();
  const router = useRouter();
  const { deleteFile } = useUploadImage();
  const isEmptyGroup = membersIds.length === 1;
  const handleDeleteGroupClick = () => {
    if (deleteGroupRef.current) {
      deleteGroupRef.current(); // Trigger custom open function to open the modal
    }
  };
  
  const exitGroupClick = () => {
    if (isCreator && membersIds.length > 0) {
      onOpen();
      return;
    }
    if (exitGroupRef.current) {
      exitGroupRef.current(); // Trigger custom open function to open the modal
    }
  };

  const handleShareOpenModal = () => {
    if (shareGroupRef.current) {
      shareGroupRef.current(); // Trigger custom open function to open the modal
    }
  };

  const deleteGroup = async () => {
    if (isCreator) {
      const res = await removeGroup(group._id);
      if ("error" in res) {
        toastifyError(res.error as string);
        return;
      }
      if (image) {
        await deleteFile(image);
      }
      toastifySuccess(res.message);
      router.push(GROUPS);
    } else {
      toastifyError("No puedes eliminar este grupo");
    }
  };

  const exitGroup = async (newCreatorId?: string) => {
    if (!isEmptyGroup) {
      return;
    }
    const res = await exitFromGroup(group._id, isCreator, newCreatorId);
    if ("error" in res) {
      toastifyError(res.error as string);
      return;
    }
    toastifySuccess(res.message);
    router.refresh();
    router.replace(GROUPS);
  };
  return (
    <>
      <Dropdown placement="bottom-end">
        <DropdownTrigger>
          <Button radius="full" isIconOnly variant="light">
            <FaChevronDown />
          </Button>
        </DropdownTrigger>
        <DropdownMenu aria-label="opciones de perfil">
          <DropdownItem
            startContent={<FaShareAlt className="ml-1 mr-0.5" />}
            color="secondary"
            key="compartir"
            className="rounded-full px-4"
            onPress={handleShareOpenModal}
          >
            Compartir
          </DropdownItem>
          <DropdownItem
            startContent={<IoIosExit className="size-5" />}
            color="danger"
            key="salir"
            onPress={exitGroupClick}
            className={`rounded-full px-4 ${
              (isMember || isCreator) && !isEmptyGroup ? "" : "hidden"
            }`}
          >
            Salir del Grupo
          </DropdownItem>
          <DropdownItem
            className={`rounded-full px-5 ${isCreator ? "" : "hidden"}`}
            key="delete-group"
            color="danger"
            startContent={<IoTrashOutline className="size-4" />}
            onClick={handleDeleteGroupClick} // Open ConfirmModal on dropdown item click
          >
            Borrar Grupo
          </DropdownItem>
        </DropdownMenu>
      </Dropdown>
      <ConfirmModal
        ButtonAction={<></>}
        message={`¿Está seguro que desea eliminar el grupo?`}
        tooltipMessage="Eliminar"
        confirmText="Eliminar"
        onConfirm={deleteGroup}
        customOpen={(openModal) => (deleteGroupRef.current = openModal)} // Set the reference for customOpen
      />
      <ConfirmModal
        ButtonAction={<></>}
        message={`¿Está seguro que desea salir del grupo?`}
        tooltipMessage="Salir"
        confirmText="Salir del Grupo"
        onConfirm={exitGroup}
        customOpen={(openModal) => (exitGroupRef.current = openModal)} // Set the reference for customOpen
      />
      <ExitGroupAsCreator
        isOpen={isOpen}
        onOpenChange={onOpenChange}
        admins={admins}
        exitGroup={exitGroup}
      />
      <ShareButton
        shareType="group"
        ButtonAction={<></>}
        data={group}
        customOpen={(openModal) => (shareGroupRef.current = openModal)}
      />
    </>
  );
};

export default OptionsDropdown;
