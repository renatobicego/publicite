"use client";

import { FaPencil, FaPlus } from "react-icons/fa6";
import SecondaryButton from "../../buttons/SecondaryButton";
import {
  Button,
  Modal,
  ModalBody,
  ModalContent,
  ModalFooter,
  ModalHeader,
  Tooltip,
  useDisclosure,
} from "@nextui-org/react";
import { useState } from "react";
import { CustomInputWithoutFormik } from "../../inputs/CustomInputs";
import { putMagazineSection } from "@/app/server/magazineActions";
import { toastifyError, toastifySuccess } from "@/utils/functions/toastify";
import { useRouter } from "next-nprogress-bar";

const EditMagazineSection = ({
  sectionId,
  ownerType,
  prevSectionName,
}: {
  sectionId: string;
  ownerType: "user" | "group";
  prevSectionName: string;
}) => {
  const router = useRouter();
  const { isOpen, onOpen, onOpenChange } = useDisclosure();
  const [inputValue, setInputValue] = useState(prevSectionName);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const handleEdit = async () => {
    if (!inputValue) return;
    setIsSubmitting(true);
    const res = await putMagazineSection(inputValue, sectionId, ownerType);
    if ("error" in res) {
      setIsSubmitting(true);
      toastifyError(res.error as string);
      return;
    }
    toastifySuccess(res.message);
    router.refresh();
    setInputValue("");
    setIsSubmitting(false);
  };
  return (
    <>
      <Tooltip placement="bottom" content="Editar sección">
        <Button
          color="secondary"
          radius="full"
          variant="flat"
          onPress={onOpen}
          isIconOnly
          aria-label={"Editar Sección de Revista " + prevSectionName}
        >
          <FaPencil />
        </Button>
      </Tooltip>
      <Modal isOpen={isOpen} placement="center" onOpenChange={onOpenChange}>
        <ModalContent>
          {(onClose) => (
            <>
              <ModalHeader className="flex flex-col gap-1">
                Editar Nombre de Sección
              </ModalHeader>
              <ModalBody>
                <CustomInputWithoutFormik
                  label="Sección de Revista"
                  placeholder="Escriba el nombre de la sección"
                  value={inputValue}
                  onValueChange={setInputValue}
                />
              </ModalBody>
              <ModalFooter>
                <Button
                  color="secondary"
                  radius="full"
                  variant="light"
                  onPress={onClose}
                >
                  Cerrar
                </Button>
                <SecondaryButton
                  isLoading={isSubmitting}
                  isDisabled={!inputValue || isSubmitting}
                  onPress={async () => {
                    await handleEdit();
                    onClose();
                  }}
                >
                  Editar
                </SecondaryButton>
              </ModalFooter>
            </>
          )}
        </ModalContent>
      </Modal>
    </>
  );
};

export default EditMagazineSection;
