"use client";

import { FaPlus } from "react-icons/fa6";
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
import { createMagazineSection } from "@/app/server/magazineActions";
import { toastifyError, toastifySuccess } from "@/utils/functions/toastify";
import { useRouter } from "next-nprogress-bar";
import { useMagazinesData } from "@/app/(root)/providers/userDataProvider";

const CreateMagazineSection = ({
  magazineId,
  groupId,
}: {
  magazineId: string;
  groupId?: string;
}) => {
  const router = useRouter();
  const { isOpen, onOpen, onOpenChange } = useDisclosure();
  const [inputValue, setInputValue] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { addSection } = useMagazinesData();
  const handleCreate = async () => {
    if (!inputValue) return;
    setIsSubmitting(true);
    const res = await createMagazineSection(inputValue, magazineId, groupId);
    if ("error" in res) {
      setIsSubmitting(true);
      toastifyError(res.error as string);
      return;
    }
    addSection(magazineId, {
      _id: res.id,
      isFatherSection: false,
      posts: [],
      title: inputValue,
    });
    toastifySuccess(res.message);
    router.refresh();
    setInputValue("");
    setIsSubmitting(false);
  };
  return (
    <>
      <Tooltip placement="bottom" content="Crear sección">
        <Button
          color="secondary"
          radius="full"
          variant="flat"
          onPress={onOpen}
          isIconOnly
          aria-label="Crear Sección de Revista"
        >
          <FaPlus />
        </Button>
      </Tooltip>
      <Modal isOpen={isOpen} placement="center" onOpenChange={onOpenChange}>
        <ModalContent>
          {(onClose) => (
            <>
              <ModalHeader className="flex flex-col gap-1">
                Crear Sección de Revista
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
                    await handleCreate();
                    onClose();
                  }}
                >
                  Crear
                </SecondaryButton>
              </ModalFooter>
            </>
          )}
        </ModalContent>
      </Modal>
    </>
  );
};

export default CreateMagazineSection;
