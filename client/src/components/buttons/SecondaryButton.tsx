import { Button, ButtonProps } from "@nextui-org/react";

// Extend ButtonProps and include children prop
interface SecondaryButtonProps extends ButtonProps {
  children: React.ReactNode;
}

const SecondaryButton: React.FC<SecondaryButtonProps> = ({
  children,
  ...props
}) => {
  return (
    <Button
      radius="full"
      color="secondary"
      {...props}
      className={`px-4 py-[10px] hover:bg-text-color hover:text-white
         hover:opacity-100 max-md:text-xs text-sm ${props.className}`}
    >
      {children}
    </Button>
  );
};

export default SecondaryButton;
