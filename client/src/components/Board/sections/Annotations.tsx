import { CardBody } from "@nextui-org/react";

const Annotations = ({ annotations }: { annotations: string[] }) => {
  return (
    <CardBody className="p-0">
      <ul className="list-inside list-disc text-sm">
        {annotations.map((item) => (
          <li key={item}>{item}</li>
        ))}
      </ul>
    </CardBody>
  );
};

export default Annotations;