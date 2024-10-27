import { IoMdPersonAdd } from "react-icons/io";
import PrimaryButton from "../PrimaryButton";
import SendRequestGroup from "./SendRequestGroup";

const SendRequest = ({
  isGroup,
  variant = "light",
  removeMargin = true,
  idToSendRequest,
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
  removeMargin?: boolean;
  idToSendRequest: string;
}) => {
  return (
    <>
      {isGroup ? (
        <SendRequestGroup
          removeMargin={removeMargin}
          variant={variant}
          groupId={idToSendRequest}
        />
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
