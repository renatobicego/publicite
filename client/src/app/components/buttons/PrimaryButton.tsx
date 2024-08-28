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
    <Button radius="full" color="primary" className="px-4 py-[10px] hover:bg-text-color hover:opacity-100 text-sm" {...props}>
      {children}
    </Button>
  );
};

export default PrimaryButton;
