import { Button, ButtonProps } from "@nextui-org/react";

// Extend ButtonProps and include children prop
interface PrimaryButtonProps extends ButtonProps {
  children: React.ReactNode;
}

const PrimaryButton: React.FC<PrimaryButtonProps> = ({
  children,
  ...props
}) => {
  return (
    <Button
      radius="full"
      color="primary"
      {...props}
      className={`px-4 py-[10px] hover:bg-text-color/75 hover:!opacity-100
         max-md:text-small text-sm font-medium ${props.className}`}
    >
      {children}
    </Button>
  );
};

export default PrimaryButton;
