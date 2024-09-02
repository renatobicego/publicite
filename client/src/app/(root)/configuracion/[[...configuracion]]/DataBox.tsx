import SecondaryButton from "@/app/components/buttons/SecondaryButton";
import { Button, Card, CardBody, CardHeader } from "@nextui-org/react";
import { HTMLAttributes } from "react";

export const DataItem = ({
  children,
  Icon,
  className,
}: {
  children: React.ReactNode;
  Icon?: React.ReactNode;
  className?: HTMLAttributes<HTMLDivElement>["className"];
}) => {
  if (Icon) {
    return (
      <div className={`flex gap-2 items-center flex-1 max-md:min-w-full ${className}`}>
        {Icon}
        <p className="profile-paragraph">{children}</p>
      </div>
    );
  } else {
    return (
      <p className={`profile-paragraph flex-1 max-md:min-w-full ${className}`}>{children}</p>
    );
  }
};

export const CardDataItem = ({
  title,
  subtitle,
  boldLabel
} : {
  title: string;
  subtitle: string;
  boldLabel?: string;
}) => {
  return (
    <Card className="bg-fondo flex-1 max-md:w-full" shadow="sm">
      <CardHeader className="flex justify-between text-sm gap-2 flex-wrap">
        <h6 className="text-secondary">{title}</h6>
        <h6>{boldLabel}</h6>
      </CardHeader>
      <CardBody>
        <p className="text-xs">{subtitle}</p>
      </CardBody>
    </Card>
  )
}

export const EditButton = ({
  text,
  onPress,
  className
}: {
  text: string | React.ReactNode;
  onPress: () => void;
  className?: HTMLAttributes<HTMLButtonElement>["className"];
}) => {
  return (
    <SecondaryButton
      variant="light"
      className={`font-normal max-md:absolute max-md:right-0 max-md:-top-2.5 ${className}`}
      onPress={onPress}
    >
      {text}
    </SecondaryButton>
  );
};

const DataBox = ({
  children,
  labelText,
  className,
  labelClassname
}: {
  children: React.ReactNode;
  labelText: string;
  className?: HTMLAttributes<HTMLDivElement>["className"];
  labelClassname?: HTMLAttributes<HTMLDivElement>["className"];
}) => {
  return (
    <div
      className={`flex w-full items-center gap-2 md:gap-4 max-md:flex-wrap max-md:flex-col max-md:items-start relative ${className}`}
    >
      <DataItem className={`flex-none max-md:min-w-[50%] max-md:flex-1 md:w-1/3 order-first max-md:font-semibold ${labelClassname}`}>
        {labelText}
      </DataItem>
      {children}
    </div>
  );
};

export default DataBox;
