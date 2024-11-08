import ConfirmModal from "@/components/modals/ConfirmModal";
import React, { MutableRefObject, useRef } from "react";

const ConfirmDelete = ({
  deletePost,
  deletePostRef,
}: {
  deletePost: () => Promise<void>;
  deletePostRef: MutableRefObject<() => void>;
}) => {
  return (
    <ConfirmModal
      ButtonAction={<></>}
      message={`¿Está seguro de eliminar el anuncio de la revista/sección?`}
      tooltipMessage="Eliminar"
      confirmText="Eliminar"
      onConfirm={deletePost}
      customOpen={(openModal) => (deletePostRef.current = openModal)}
    />
  );
};

export default ConfirmDelete;
