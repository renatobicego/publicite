import { Chip } from "@nextui-org/react";

const ServiceChip = ({ children }: { children: React.ReactNode }) => {
  return (
    <Chip
      className="text-petition border-petition text-xs"
      size="sm"
      variant="bordered"
    >
      {children}
    </Chip>
  );
};

export default ServiceChip;
