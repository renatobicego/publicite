import { Button, ButtonProps } from "@nextui-org/react";

// Extend ButtonProps and include children prop
interface PrimaryButtonProps extends ButtonProps {
  children: React.ReactNode;
}

const PrimaryButton: React.FC<PrimaryButtonProps> = ({
  children,
  ...props
}) => {
  console.log(props.isLoading);
  return (
    <Button
      radius="full"
      color="primary"
      {...props}
      className={`px-4 py-[10px] hover:bg-text-color/75 hover:!opacity-100 hover:text-white
         max-md:text-xs text-sm font-medium ${props.className}`}
    >
      {children}
    </Button>
  );
};

export default PrimaryButton;
