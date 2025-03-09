"use client";
import { toastifySuccess } from "@/utils/functions/toastify";
import { shareLink } from "@/utils/functions/utils";
import { Button } from "@nextui-org/react";
import { FaShare } from "react-icons/fa6";

const ShareApp = () => {
  return (
    <Button
      onPress={() =>
        shareLink(process.env.NEXT_PUBLIC_URL as string, "Compartir Publicité")
      }
      size="sm"
      variant="bordered"
      radius="full"
      className="bg-text-color text-white items-center"
    >
      <FaShare className="size-4" />
      <span className=" ml-2">Compartir App</span>
    </Button>
  );
};

export default ShareApp;
