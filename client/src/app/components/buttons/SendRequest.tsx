import { IoMdPersonAdd } from "react-icons/io";
import PrimaryButton from "./PrimaryButton";

const SendRequest = () => {
  return (
    <>
      <PrimaryButton variant="light" className="max-md:hidden mt-auto -ml-2.5">Enviar solicitud</PrimaryButton>
      <PrimaryButton isIconOnly className="md:hidden p-0.5 mt-auto" size="sm">
        <IoMdPersonAdd />
      </PrimaryButton>
    </>
  );
};

export default SendRequest;
