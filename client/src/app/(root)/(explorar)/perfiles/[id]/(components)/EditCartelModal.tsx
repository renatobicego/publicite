"use client";
import { Modal, ModalBody, ModalContent } from "@nextui-org/react";
import Profile from "@/app/(root)/(configuracion)/Profile/Profile";
import Business from "@/app/(root)/(configuracion)/Business/Business";
import { UserType } from "@/types/userTypes";

/**
 * Edición del cartel desde el propio cartel. Muestra las mismas pantallas que
 * Configuración › Cartel / Empresa (la ventana de cuenta de Clerk).
 */
const EditCartelModal = ({
  isOpen,
  onOpenChange,
  username,
  userType,
}: {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  username: string;
  userType: UserType;
}) => (
  <Modal
    isOpen={isOpen}
    onOpenChange={onOpenChange}
    size="3xl"
    scrollBehavior="inside"
    placement="center"
  >
    <ModalContent>
      <ModalBody className="py-6">
        {isOpen &&
          (userType === "Business" ? (
            <Business username={username} />
          ) : (
            <Profile username={username} />
          ))}
      </ModalBody>
    </ModalContent>
  </Modal>
);

export default EditCartelModal;
