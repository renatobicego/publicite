import React, { Dispatch, SetStateAction } from "react";
import SelectPostType from "./SelectPostType";
import SelectSolapa from "./SelectSolapa";
import SecondaryButton from "@/components/buttons/SecondaryButton";
import {
  Modal,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  Selection,
} from "@nextui-org/react";

// this is the modal that opens when the user clicks on the dropdown button
const ModalSelectSolapas = ({
  isOpen,
  onOpenChange,
  selectedValueIsPost,
  selectedPostType,
  setSelectedPostType,
  setSelectedKeys,
  selectedKeys,
}: {
  isOpen: boolean;
  onOpenChange: () => void;
  selectedValueIsPost: boolean;
  selectedPostType: Selection;
  setSelectedPostType: Dispatch<SetStateAction<Selection>>;
  setSelectedKeys: Dispatch<SetStateAction<Selection>>;
  selectedKeys: Selection;
}) => {
  return (
    <Modal placement="center" isOpen={isOpen} onOpenChange={onOpenChange}>
      <ModalContent>
        {(onClose) => (
          <>
            <ModalHeader className="flex flex-col gap-1">
              Seleccionar Solapas
            </ModalHeader>
            <ModalBody className="pb-4">
              <SelectSolapa // this is the dropdown that allows the user to select the solapas
                selectedKeys={selectedKeys}
                setSelectedKeys={setSelectedKeys}
              />
              {selectedValueIsPost && (
                <SelectPostType // this is the dropdown that allows the user to select the post type
                  selectedPostType={selectedPostType}
                  setSelectedPostType={setSelectedPostType}
                />
              )}
            </ModalBody>
            <ModalFooter>
              <SecondaryButton onPress={onClose}>Aceptar</SecondaryButton>
            </ModalFooter>
          </>
        )}
      </ModalContent>
    </Modal>
  );
};

export default ModalSelectSolapas;
