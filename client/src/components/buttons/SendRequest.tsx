import { IoMdPersonAdd } from "react-icons/io";
import PrimaryButton from "./PrimaryButton";
import SecondaryButton from "./SecondaryButton";

const SendRequest = ({
  isGroup,
  variant="light",
  removeMargin=true
}: {
  isGroup?: boolean;
  variant?:
    | "light"
    | "solid"
    | "bordered"
    | "flat"
    | "faded"
    | "shadow"
    | "ghost";
  removeMargin?: boolean
}) => {
  return (
    <>
      {isGroup ? (
        <>
          <SecondaryButton
            variant={variant}
            className={`max-md:hidden mt-auto ${removeMargin && "-ml-4"} hover:text-secondary`}
          >
            Enviar solicitud
          </SecondaryButton>
          <SecondaryButton
            isIconOnly
            className="md:hidden p-0.5 mt-auto hover:text-secondary"
            size="sm"
          >
            <IoMdPersonAdd />
          </SecondaryButton>
        </>
      ) : (
        <>
          <PrimaryButton
            variant={variant}
            className={`"max-md:hidden mt-auto ${removeMargin && "-ml-4"}`}
          >
            Enviar solicitud
          </PrimaryButton>
          <PrimaryButton
            isIconOnly
            className="md:hidden p-0.5 mt-auto"
            size="sm"
          >
            <IoMdPersonAdd />
          </PrimaryButton>
        </>
      )}
    </>
  );
};

export default SendRequest;
