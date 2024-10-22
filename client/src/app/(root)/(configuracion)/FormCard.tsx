import { Card, CardBody, CardHeader } from "@nextui-org/react";
import { motion } from "framer-motion";
import { HTMLAttributes } from "react";

const FormCard = ({
  title,
  children,
  cardBodyClassname,
  initialHeight = 40,
}: {
  title: string;
  children: React.ReactNode;
  cardBodyClassname?: HTMLAttributes<HTMLDivElement>["className"];
  initialHeight?: number;
}) => {
  return (
    <Card
      className="w-full gap-4"
      classNames={{
        header: "pb-0",
        body: "pt-0",
      }}
    >
      <CardHeader className="text-sm font-bold">{title}</CardHeader>
      <CardBody className={cardBodyClassname}>{children}</CardBody>
    </Card>
  );
};

export default FormCard;
