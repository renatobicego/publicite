"use client";
import { toastifySuccess } from "@/utils/functions/toastify";
import { Button } from "@nextui-org/react";
import { FaShare } from "react-icons/fa6";

const ShareApp = () => {
  const shareLink = async (url: string, title: string) => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: title,
          url: url,
          text: "Compartir Publicité",
        });
      } catch (error) {
        console.log("Error sharing link:", error);
      }
    } else {
      // Fallback for browsers that don't support Web Share API
      try {
        await navigator.clipboard.writeText(url);
        toastifySuccess("¡Link copiado en el portapapeles!");
      } catch (error) {
        console.log("Error copying link to clipboard:", error);
      }
    }
  };
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
