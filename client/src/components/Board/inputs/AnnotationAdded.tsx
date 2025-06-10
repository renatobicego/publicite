import { Button } from "@nextui-org/react";
import { FaX } from "react-icons/fa6";

const AnnotationAdded = ({
  annotation,
  deleteAnnotation,
}: {
  annotation: string;
  deleteAnnotation: (annotation: string) => void;
}) => {
  return (
    <div className="flex items-center gap-1">
      <li className="text-sm">{annotation}</li>
      <Button
        isIconOnly
        aria-label={"Eliminar anotación " + annotation}
        color="danger"
        radius="full"
        variant="light"
        size="sm"
        onPress={() => deleteAnnotation(annotation)}
      >
        <FaX />
      </Button>
    </div>
  );
};

export default AnnotationAdded;
