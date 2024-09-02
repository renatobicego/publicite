import {
  Card,
  CardBody,
  CardHeader,
} from "@nextui-org/react";
import { motion } from "framer-motion";
import { HTMLAttributes } from "react";

const FormCard = ({
  title,
  children,
  cardBodyClassname,
  initialHeight = 40
}: {
  title: string;
  children: React.ReactNode;
  cardBodyClassname?: HTMLAttributes<HTMLDivElement>["className"];
  initialHeight?: number;
}) => {
  return (
    <motion.div
      initial={{ opacity: 0, height: initialHeight, scale: 0.95 }}
      animate={{ opacity: 1, height: "auto", scale: 1 }}
      exit={{ opacity: 0, height: initialHeight, scale: 0.95 }}
      className="w-full"
    >
      <Card className="w-full gap-4" classNames={{
        header: "pb-0",
        body: "pt-0"
      }}>
        <CardHeader className="text-sm font-bold">{title}</CardHeader>
        <CardBody className={cardBodyClassname}>{children}</CardBody>
      </Card>
    </motion.div>
  );
};

export default FormCard;
