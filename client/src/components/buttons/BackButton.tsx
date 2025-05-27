"use client";
import { Button, ButtonProps } from "@nextui-org/react";
import { useRouter } from "next-nprogress-bar";
import { FaChevronLeft } from "react-icons/fa6";

const BackButton: React.FC<ButtonProps> = ({ className }: ButtonProps) => {
  const router = useRouter();
  return (
    <Button
      radius="full"
      className={`-ml-2.5 ${className} max-md:text-xs`}
      size="sm"
      variant="light"
      onPress={() => router.back()}
      startContent={<FaChevronLeft />}
    >
      Volver
    </Button>
  );
};

export default BackButton;
