import { Button, ButtonProps } from "@nextui-org/react";
interface BWButtonProps extends ButtonProps {
  children: React.ReactNode;
  blackOrWhite: "black" | "white";
}

const BWButton: React.FC<BWButtonProps> = ({
  children,
  blackOrWhite,
  ...props
}: BWButtonProps) => {
  const color =
    blackOrWhite === "black"
      ? "text-white bg-text-color hover:opacity-80"
      : "bg-white text-text-color hover:text-white hover:bg-text-color";
  return (
    <Button
      radius="full"
      {...props}
      className={`${color} px-4 py-[10px] data-[hover=true]:!opacity-100 font-medium ${props.className}`}
    >
      {children}
    </Button>
  );
};

export default BWButton;
