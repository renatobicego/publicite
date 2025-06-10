import { Card, CardHeader, CardBody } from "@nextui-org/react";

const EmptyBoard = ({
  isProfile,
  name,
  widthFull,
}: {
  isProfile: boolean;
  name?: string;
  widthFull: boolean;
}) => {
  return (
    <Card
      className={`p-4 flex flex-col gap-2 ${
        isProfile &&
        !widthFull &&
        "min-w-[30%] lg:p-6 md:max-w-[34%] xl:max-w-[50%]"
      }`}
    >
      <CardHeader className="p-0">
        <h6>Pizarra de {name}</h6>
      </CardHeader>
      <CardBody className="p-0">
        <p className="text-xs">El usuario no ha creado su pizarra</p>
      </CardBody>
    </Card>
  );
};

export default EmptyBoard;
