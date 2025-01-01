"use client";
import { deletePost } from "@/app/server/postActions";
import ConfirmModal from "@/components/modals/ConfirmModal";
import { Post } from "@/types/postTypes";
import { PROFILE } from "@/utils/data/urls";
import { toastifyError, toastifySuccess } from "@/utils/functions/toastify";
import {
  Button,
  Dropdown,
  DropdownItem,
  DropdownMenu,
  DropdownTrigger,
  Spinner,
} from "@nextui-org/react";
import { useRouter } from "next-nprogress-bar";
import { useRef, useState } from "react";
import { FaChevronDown } from "react-icons/fa6";
import { IoTrashOutline } from "react-icons/io5";

const OptionsDropdown = ({ post }: { post: Post }) => {
  const router = useRouter();
  const [isDeleting, setIsDeleting] = useState(false);
  const handleDelete = async () => {
    setIsDeleting(true);
    const res = await deletePost(post);
    if (res.error) {
      toastifyError(res.error);
      setIsDeleting(false);
      return;
    }
    setIsDeleting(false);
    toastifySuccess(res.message as string);
    router.replace(`${PROFILE}/${post.author.username}`);
  };
  const assignAdminRef = useRef<() => void>(() => {});

  const handleDeletePostClick = () => {
    if (assignAdminRef.current) {
      assignAdminRef.current(); // Trigger custom open function to open the modal
    }
  };
  return (
    <>
      <Dropdown placement="bottom-end">
        <DropdownTrigger>
          <Button
            variant="light"
            isIconOnly
            aria-label="Menú opciones de anuncio"
            radius="full"
            color="default"
            size="sm"
          >
            {isDeleting ? <Spinner size="sm" /> : <FaChevronDown />}
          </Button>
        </DropdownTrigger>
        <DropdownMenu aria-label="borrar anuncio">
          <DropdownItem
            className="rounded-full text-danger pl-4"
            key="delete"
            color="danger"
            startContent={
              isDeleting ? <Spinner size="sm" /> : <IoTrashOutline />
            }
            onClick={handleDeletePostClick}
          >
            {isDeleting ? "Borrando..." : "Borrar Anuncio"}
          </DropdownItem>
        </DropdownMenu>
      </Dropdown>
      <ConfirmModal
        ButtonAction={<></>}
        message={`¿Está seguro de eliminar el anuncio ${post.title}?`}
        tooltipMessage="Eliminar"
        confirmText="Eliminar"
        onConfirm={handleDelete}
        customOpen={(openModal) => (assignAdminRef.current = openModal)} // Set the reference for customOpen
      />
    </>
  );
};

export default OptionsDropdown;
