"use client";
import { IoMdPersonAdd } from "react-icons/io";
import PrimaryButton from "../PrimaryButton";
import {
  Button,
  Modal,
  ModalBody,
  ModalContent,
  ModalFooter,
  ModalHeader,
  Select,
  SelectItem,
  useDisclosure,
} from "@nextui-org/react";
import { relationTypes } from "@/utils/data/selectData";
import { ChangeEvent, useState } from "react";
import { useSocket } from "@/app/socketProvider";
import { emitUserRelationNotification } from "@/components/notifications/users/emitNotifications";

const SendUserRequest = ({
  variant,
  removeMargin,
  idToSendRequest,
}: {
  variant?:
    | "light"
    | "solid"
    | "bordered"
    | "flat"
    | "faded"
    | "shadow"
    | "ghost";
  removeMargin?: boolean;
  idToSendRequest: string;
}) => {
  const { isOpen, onOpen, onOpenChange } = useDisclosure();
  const [value, setValue] = useState("");
  const { updateSocketToken } = useSocket();

  const handleSelectionChange = (e: ChangeEvent<HTMLSelectElement>) => {
    setValue(e.target.value);
  };

  const handleSubmit = async () => {
    if (!value) return;
    const socket = await updateSocketToken();
    emitUserRelationNotification(
      socket,
      "notification_user_new_friend_request",
      idToSendRequest,
      value as UserRelation,
      null
    );
  };
  return (
    <>
      <PrimaryButton
        variant={variant}
        onPress={onOpen}
        className={`"max-md:hidden mt-auto ${removeMargin && "md:-ml-4"}`}
      >
        Enviar solicitud
      </PrimaryButton>
      <PrimaryButton
        onPress={onOpen}
        isIconOnly
        className="md:hidden p-0.5 mt-auto"
        size="sm"
      >
        <IoMdPersonAdd />
      </PrimaryButton>
      <Modal isOpen={isOpen} onOpenChange={onOpenChange}>
        <ModalContent>
          {(onClose) => (
            <>
              <ModalHeader className="flex flex-col gap-1">
                Enviar Solicitud
              </ModalHeader>
              <ModalBody>
                <Select
                  scrollShadowProps={{
                    hideScrollBar: false,
                  }}
                  classNames={{
                    trigger:
                      "shadow-none hover:shadow-sm border-[0.5px] group-data-[focus=true]:border-light-text py-1",
                    value: `text-[0.8125rem]`,
                    label: `font-medium text-[0.8125rem]`,
                  }}
                  radius="full"
                  selectedKeys={[value]}
                  label="Tipo de Relación"
                  placeholder="Seleccione un tipo de relación"
                  variant="bordered"
                  labelPlacement="outside"
                  onChange={handleSelectionChange}
                >
                  {relationTypes.map((item, index) => (
                    <SelectItem
                      key={item.value}
                      value={item.value}
                      variant="light"
                      classNames={{
                        title: "text-[0.8125rem]",
                      }}
                      aria-label={item.label}
                      textValue={item.label}
                    >
                      {item.label}
                    </SelectItem>
                  ))}
                </Select>
              </ModalBody>
              <ModalFooter>
                <Button
                  radius="full"
                  color="danger"
                  variant="light"
                  onPress={onClose}
                >
                  Cerrar
                </Button>
                <PrimaryButton
                  onPress={() => {
                    handleSubmit();
                    onClose();
                  }}
                  isDisabled={value.length === 0}
                >
                  Enviar
                </PrimaryButton>
              </ModalFooter>
            </>
          )}
        </ModalContent>
      </Modal>
    </>
  );
};

export default SendUserRequest;
