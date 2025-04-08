"use client";
import {
  CalendarDate,
  DateInput,
  Modal,
  ModalBody,
  ModalContent,
  ModalFooter,
  ModalHeader,
  useDisclosure,
} from "@nextui-org/react";
import PrimaryButton from "../buttons/PrimaryButton";
import { updateEndDate } from "@/app/server/postActions";
import { toastifyError, toastifySuccess } from "@/utils/functions/toastify";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { I18nProvider } from "@react-aria/i18n";
import { getLocalTimeZone, today } from "@internationalized/date";

const RenewPost = ({ postTitle, id }: { postTitle: string; id: string }) => {
  const { onOpen, isOpen, onOpenChange, onClose } = useDisclosure();
  const [endDate, setEndDate] = useState<CalendarDate | null>(null);
  const router = useRouter();
  const handleUpdateEndDate = async () => {
    if (!endDate) return;
    const res = await updateEndDate(
      id,
      endDate?.toDate(getLocalTimeZone()).toISOString()
    );
    if ("error" in res) {
      toastifyError(res.error);
      return;
    }
    onClose();
    toastifySuccess(res.message);
    router.refresh();
  };
  return (
    <>
      <PrimaryButton variant="flat" size="sm" onPress={onOpen}>
        Renovar
      </PrimaryButton>
      <Modal isOpen={isOpen} onOpenChange={onOpenChange} placement="center">
        <ModalContent>
          {(onClose) => (
            <>
              <ModalHeader>Renovar Anuncio - {postTitle}</ModalHeader>
              <ModalBody>
                <I18nProvider locale="es">
                  <DateInput
                    value={endDate}
                    onChange={setEndDate}
                    aria-label="input fecha para renovar"
                    label="Fecha para renovar"
                    minValue={today(getLocalTimeZone())}
                    maxValue={today(getLocalTimeZone()).add({ years: 1 })}
                    description="Selecciona la fecha hasta la que deseas renovar el anuncio"
                    classNames={{
                      inputWrapper:
                        "shadow-none hover:shadow-sm border-[0.5px] group-data-[focus=true]:border-light-text",
                      input: "text-[0.8125rem]",
                      label: "font-medium text-[0.8125rem]",
                    }}
                    radius="full"
                    variant="bordered"
                    labelPlacement="outside"
                  />
                </I18nProvider>
              </ModalBody>
              <ModalFooter>
                <PrimaryButton variant="light" onPress={onClose}>
                  Cancelar
                </PrimaryButton>
                <PrimaryButton
                  isDisabled={!endDate}
                  onPress={handleUpdateEndDate}
                >
                  Renovar
                </PrimaryButton>
              </ModalFooter>
            </>
          )}
        </ModalContent>
      </Modal>
    </>
  );
};

export default RenewPost;
