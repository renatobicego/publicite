"use client";
import { useLocation } from "@/app/(root)/providers/LocationProvider";
import {
  Button,
  Modal,
  ModalBody,
  ModalContent,
  ModalFooter,
  ModalHeader,
  useDisclosure,
} from "@nextui-org/react";
import { FaMapMarkerAlt } from "react-icons/fa";
import ManualLocationPicker from "./ManualLocationPicker";
import { useState } from "react";
import PrimaryButton from "@/components/buttons/PrimaryButton";

const SelectManualLocationModal = ({
  showAlways,
}: {
  showAlways?: boolean;
}) => {
  const { manualLocation } = useLocation();
  const { isOpen, onOpen, onOpenChange } = useDisclosure();
  const [address, setAddress] = useState("");

  return (
    <>
      {(manualLocation || showAlways) && (
        <Button
          onClick={onOpen}
          color="primary"
          radius="full"
          variant="light"
          className="-ml-2.5 self-start max-w-full w-fit text-left"
          startContent={<FaMapMarkerAlt className="size-4" />}
        >
          <span className="w-full text-pretty">
            {address ? address : "Seleccionar ubicación"}
          </span>
        </Button>
      )}
      <Modal placement="center" isOpen={isOpen} onOpenChange={onOpenChange}>
        <ModalContent>
          {(onClose) => (
            <>
              <ModalHeader className="flex flex-col gap-1">
                Seleccionar Ubicación Manual
              </ModalHeader>
              <ModalBody>
                {isOpen && <ManualLocationPicker setAddress={setAddress} />}
              </ModalBody>
              <ModalFooter>
                <PrimaryButton color="primary" onPress={onClose}>
                  Aceptar
                </PrimaryButton>
              </ModalFooter>
            </>
          )}
        </ModalContent>
      </Modal>
    </>
  );
};

export default SelectManualLocationModal;
