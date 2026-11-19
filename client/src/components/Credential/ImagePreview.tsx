"use client";
import { Modal, ModalBody, ModalContent, useDisclosure } from "@nextui-org/react";

/**
 * Envuelve una imagen: al tocarla se abre en grande. Si no hay `src`, muestra
 * la imagen sin interacción.
 */
const ImagePreview = ({
  src,
  alt,
  children,
  className = "",
}: {
  src?: string | null;
  alt: string;
  children: React.ReactNode;
  className?: string;
}) => {
  const { isOpen, onOpen, onOpenChange } = useDisclosure();
  if (!src) return <>{children}</>;

  return (
    <>
      <button
        type="button"
        onClick={onOpen}
        aria-label={`Ver ${alt}`}
        className={`shrink-0 rounded-full cursor-zoom-in transition-transform hover:scale-[1.03] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 ${className}`}
      >
        {children}
      </button>
      <Modal
        isOpen={isOpen}
        onOpenChange={onOpenChange}
        size="3xl"
        placement="center"
        backdrop="blur"
        classNames={{ base: "bg-transparent shadow-none", closeButton: "bg-white/80" }}
      >
        <ModalContent>
          <ModalBody className="p-0 flex items-center justify-center">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={src}
              alt={alt}
              className="max-h-[85vh] w-auto max-w-full rounded-xl object-contain"
            />
          </ModalBody>
        </ModalContent>
      </Modal>
    </>
  );
};

export default ImagePreview;
