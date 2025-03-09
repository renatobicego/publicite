"use client";
import { deletePost, updatePostActiveStatus } from "@/app/server/postActions";
const ConfirmModal = lazy(() => import("@/components/modals/ConfirmModal"));
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
import { lazy, Suspense, useRef, useState } from "react";
import { FaChevronDown } from "react-icons/fa6";
import useUserPostLimit from "@/utils/hooks/useUserPostLimit";
import { postsBehavioursTypes } from "@/utils/data/selectData";
import { BiHide } from "react-icons/bi";
import { IoTrashOutline } from "react-icons/io5";

const OptionsDropdown = ({ post }: { post: Post }) => {
  const router = useRouter();
  const [isActive, setIsActive] = useState(post.isActive);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isChangingActiveStatus, setIsChangingActiveStatus] = useState(false);
  const { userCanPublishPost } = useUserPostLimit(post.postBehaviourType);
  const hidePostRef = useRef<() => void>(() => {});
  const deletePostRef = useRef<() => void>(() => {});

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
    router.replace(`${PROFILE}/${post.author._id}`);
  };

  const handleChangeIsActiveStatus = async () => {
    if (!isActive && !userCanPublishPost) {
      toastifyError(
        "Has superado el límite de anuncios activos de tipo " +
          postsBehavioursTypes[post.postBehaviourType]
      );
      return;
    }
    setIsChangingActiveStatus(true);
    const res = await updatePostActiveStatus(
      post._id,
      post.author._id,
      post.postBehaviourType,
      !isActive
    );
    if ("error" in res) {
      toastifyError(res.error);
      setIsChangingActiveStatus(false);
      return;
    }
    setIsChangingActiveStatus(false);
    setIsActive(!isActive);
    toastifySuccess(res.message as string);
  };
  const handleShowConfirmHidePost = () => {
    if (hidePostRef.current) {
      hidePostRef.current(); // Trigger custom open function to open the modal
    }
  };

  const handleShowConfirmDeletePost = () => {
    if (deletePostRef.current) {
      deletePostRef.current(); // Trigger custom open function to open the modal
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
            {isDeleting || isChangingActiveStatus ? (
              <Spinner size="sm" />
            ) : (
              <FaChevronDown />
            )}
          </Button>
        </DropdownTrigger>
        <DropdownMenu aria-label="borrar anuncio">
          <DropdownItem
            className="rounded-full pl-4"
            key="hide"
            startContent={
              isChangingActiveStatus ? <Spinner size="sm" /> : <BiHide />
            }
            onClick={handleShowConfirmHidePost}
          >
            {!isActive
              ? isChangingActiveStatus
                ? "Activando..."
                : "Activar Anuncio"
              : isChangingActiveStatus
              ? "Desactivando..."
              : "Desactivar Anuncio"}
          </DropdownItem>
          <DropdownItem
            className="rounded-full text-danger pl-4"
            key="delete"
            color="danger"
            startContent={
              isDeleting ? <Spinner size="sm" /> : <IoTrashOutline />
            }
            onClick={handleShowConfirmDeletePost}
          >
            {isDeleting ? "Borrando..." : "Borrar Anuncio"}
          </DropdownItem>
        </DropdownMenu>
      </Dropdown>
      <Suspense fallback={<Spinner color="warning" />}>
        <ConfirmModal
          ButtonAction={<></>}
          message={`¿Está seguro de eliminar el anuncio ${post.title}?`}
          tooltipMessage="Eliminar"
          confirmText="Eliminar"
          onConfirm={handleDelete}
          customOpen={(openModal) => (deletePostRef.current = openModal)} // Set the reference for customOpen
        />
      </Suspense>
      <Suspense fallback={<Spinner color="warning" />}>
        <ConfirmModal
          ButtonAction={<></>}
          message={`¿Está seguro de ${
            isActive ? "ocultar" : "mostrar"
          } el anuncio ${post.title}?`}
          tooltipMessage={isActive ? "Desactivar" : "Mostrar"}
          confirmText={isActive ? "Desactivar" : "Mostrar"}
          onConfirm={handleChangeIsActiveStatus}
          customOpen={(openModal) => (hidePostRef.current = openModal)} // Set the reference for customOpen
        />
      </Suspense>
    </>
  );
};

export default OptionsDropdown;
