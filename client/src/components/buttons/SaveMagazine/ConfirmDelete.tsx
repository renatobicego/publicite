const ConfirmModal = lazy(() => import("@/components/modals/ConfirmModal"));
import { Spinner } from "@nextui-org/react";
import React, { lazy, MutableRefObject, Suspense, useRef } from "react";

const ConfirmDelete = ({
  deletePost,
  deletePostRef,
}: {
  deletePost: () => Promise<void>;
  deletePostRef: MutableRefObject<() => void>;
}) => {
  return (
    <Suspense fallback={<Spinner color="warning" />}>
      <ConfirmModal
        ButtonAction={<></>}
        message={`¿Está seguro de eliminar el anuncio de la revista/sección?`}
        tooltipMessage="Eliminar"
        confirmText="Eliminar"
        onConfirm={deletePost}
        customOpen={(openModal) => (deletePostRef.current = openModal)}
      />
    </Suspense>
  );
};

export default ConfirmDelete;
