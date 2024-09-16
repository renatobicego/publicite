import { FaShare } from "react-icons/fa6";
import SecondaryButton from "./SecondaryButton";
import { Good, Petition, Service } from "@/types/postTypes";

const ShareButton = ({ post }: { post: Good | Service | Petition }) => {
  return (
    <SecondaryButton startContent={<FaShare />} variant="flat">
      Compartir
    </SecondaryButton>
  );
};

export default ShareButton;
