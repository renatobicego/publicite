import { Tooltip } from "@nextui-org/react";
import SecondaryButton from "@/components/buttons/SecondaryButton";
import { FiUpload } from "react-icons/fi";
import { useRef } from "react";

const FileUploadButton = ({
  label,
  onFileChange,
}: {
  label: string;
  onFileChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleButtonClick = () => {
    if (label && fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  return (
    <Tooltip
      placement="bottom-end"
      content={
        label ? "Subir Archivo" : "Agregar primero una etiqueta para subir archivo"
      }
    >
      <div className="flex items-center gap-2 cursor-pointer mb-1">
        <SecondaryButton
          isDisabled={!label}
          variant="flat"
          className="p-0.5"
          isIconOnly
          aria-label="Subir archivo"
          onPress={handleButtonClick} // Trigger the file input on button click
        >
          <FiUpload className={`size-5 ${label ? "" : "text-gray-400"}`} />
        </SecondaryButton>
        <input
          ref={fileInputRef}
          type="file"
          className="hidden"
          accept="application/pdf"
          onChange={onFileChange}
        />
      </div>
    </Tooltip>
  );
};

export default FileUploadButton;
