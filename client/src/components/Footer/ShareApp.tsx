import { Button } from "@nextui-org/react";
import { FaShare } from "react-icons/fa6";

const ShareApp = () => {
  return (
    <Button size="sm" variant="light" className="bg-white items-center">
      <FaShare className="text-text-color size-4" />
      <span className=" ml-2 text-text-color ">Compartir App</span>
    </Button>
  );
};

export default ShareApp;
