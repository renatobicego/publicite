"use client";
import DeleteMagazineSection from "@/app/(root)/revistas/[id]/Sections/DeleteMagazineSection";
import { MagazineSection } from "@/types/magazineTypes";
import {
  useDisclosure,
  Tooltip,
  Button,
  Modal,
  ModalContent,
  ModalBody,
  ModalHeader,
} from "@nextui-org/react";
import React from "react";
import { FaPencil } from "react-icons/fa6";
import EditMagazineSection from "./EditMagazineSection";

const ManageMagazineSections = ({
  sections,
  ownerType,
  magazineId,
}: {
  sections: MagazineSection[];
  ownerType: "user" | "group";
  magazineId: string;
}) => {
  const { isOpen, onOpen, onOpenChange } = useDisclosure();

  return (
    <>
      <Tooltip placement="bottom" content="Editar secciones">
        <Button
          color="secondary"
          radius="full"
          variant="flat"
          onPress={onOpen}
          isIconOnly
        >
          <FaPencil />
        </Button>
      </Tooltip>
      <Modal isOpen={isOpen} placement="center" onOpenChange={onOpenChange}>
        <ModalContent>
          {(onClose) => (
            <>
              <ModalHeader className="flex flex-col gap-1">
                Lista de Secciones
              </ModalHeader>
              <ModalBody>
                {sections.map((section) => (
                  <div key={section._id} className="flex items-center gap-2 px-6 py-4 rounded-xl shadow-md">
                    <EditMagazineSection
                      prevSectionName={section.title}
                      ownerType={ownerType}
                      sectionId={section._id}
                    />
                    <DeleteMagazineSection
                      sectionId={section._id}
                      magazineId={magazineId}
                      ownerType={ownerType}
                    />
                    <p className="ml-4">{section.title}</p>
                  </div>
                ))}
              </ModalBody>
            </>
          )}
        </ModalContent>
      </Modal>
    </>
  );
};

export default ManageMagazineSections;
