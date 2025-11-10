import PrimaryButton from "@/components/buttons/PrimaryButton";
import { UserRelations } from "@/types/userTypes";
import {
  useDisclosure,
  Modal,
  ModalContent,
  ModalHeader,
  ModalBody,
  Skeleton,
} from "@nextui-org/react";
import { lazy, Suspense } from "react";
import { FaUserCheck } from "react-icons/fa";
const ManageActiveUserRelations = lazy(
  () => import("./ManageActiveUserRelations")
);

const ManageActiveUserRelationsModal = ({
  relations,
  activeRelationsIds,
  userId,
}: {
  relations: UserRelations[];
  activeRelationsIds: ObjectId[];
  userId: ObjectId;
}) => {
  const { isOpen, onOpen, onOpenChange } = useDisclosure();

  return (
    <>
      <PrimaryButton
        startContent={<FaUserCheck />}
        variant="flat"
        onPress={onOpen}
        className="self-start"
      >
        Administrar Activas
      </PrimaryButton>
      <Modal
        radius="lg"
        className="p-2"
        placement="center"
        scrollBehavior="inside"
        isOpen={isOpen}
        isDismissable={false}
        onOpenChange={onOpenChange}
      >
        <ModalContent>
          {(onClose) => (
            <>
              <ModalHeader className="flex flex-col gap-1">
                Seleccionar Relaciones Activas
              </ModalHeader>
              <ModalBody className="pt-0 ">
                {isOpen && (
                  <Suspense
                    fallback={
                      <>
                        <Skeleton className="rounded-lg w-full h-20" />
                        <Skeleton className="rounded-lg w-full h-16" />
                        <Skeleton className="rounded-lg w-full h-32" />
                        <Skeleton className="rounded-lg w-full h-16" />
                      </>
                    }
                  >
                    <ManageActiveUserRelations
                      relations={relations}
                      activeRelationsIds={activeRelationsIds}
                      userId={userId}
                      closeModal={onClose}
                    />
                  </Suspense>
                )}
              </ModalBody>
            </>
          )}
        </ModalContent>
      </Modal>
    </>
  );
};

export default ManageActiveUserRelationsModal;
