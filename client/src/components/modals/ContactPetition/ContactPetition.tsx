import PostCard from "@/components/cards/PostCard/PostCard";
import {
  CustomInputWithoutFormik,
  CustomTextareaWithoutFormik,
} from "@/components/inputs/CustomInputs";
import { Post, PostContactNotification } from "@/types/postTypes";
import {
  Modal,
  ModalBody,
  ModalContent,
  ModalHeader,
} from "@nextui-org/react";

const ContactPetition = ({
  isOpen,
  onOpenChange,
  notification,
  post,
}: {
  isOpen: boolean;
  onOpenChange: () => void;
  notification: PostContactNotification;
  post: Post;
}) => {
  const { contactPetition } = notification;
  console.log("render")
  return (
    <Modal
      size="3xl"
      placement="center"
      classNames={{
        wrapper: "z-[100000000] ",
        backdrop: "z-[100000000]",
      
      }}
      isOpen={isOpen}
      onOpenChange={onOpenChange}
    >
      <ModalContent>
        {(onClose) => (
          <>
            <ModalHeader className="flex flex-col gap-1">
              Petición de Contacto
            </ModalHeader>
            <ModalBody className="flex gap-4 md:flex-row pb-8 max-h-[80vh] overflow-y-auto">
              <PostCard className="w-4/5 h-fit flex-shrink-0 md:w-2/5" postData={post} />
              <div className="flex flex-col gap-2 flex-1">
                <CustomInputWithoutFormik
                  value={contactPetition.fullName}
                  label="Nombre Completo"
                  isReadOnly
                />
                <CustomInputWithoutFormik
                  value={contactPetition.email}
                  label="Email"
                  isReadOnly
                />
                {contactPetition.phone && (
                  <CustomInputWithoutFormik
                    value={contactPetition.phone}
                    label="Teléfono"
                    isReadOnly
                  />
                )}
                <CustomTextareaWithoutFormik
                  value={contactPetition.message}
                  label="Mensaje"
                  isReadOnly
                />
              </div>
            </ModalBody>
          </>
        )}
      </ModalContent>
    </Modal>
  );
};

export default ContactPetition;
