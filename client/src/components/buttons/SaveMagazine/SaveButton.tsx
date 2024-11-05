"use client";
import { Good, Petition, Service } from "@/types/postTypes";
import {
  Button,
  ButtonProps,
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@nextui-org/react";
import { FaBookmark, FaRegBookmark } from "react-icons/fa6";
import { useUserData } from "@/app/(root)/userDataProvider";
import { useState } from "react";
import SavePostLogic from "./SavePostLogic";

interface SaveButtonProps extends ButtonProps {
  post: Good | Service | Petition;
}

const SaveButton: React.FC<SaveButtonProps> = ({ post, ...props }) => {
  const { magazines, postsInMagazine } = useUserData();
  const [isOpen, setIsOpen] = useState(false);
  const saved = postsInMagazine.includes(post._id);
  const [savedRecently, setSavedRecently] = useState(false);
  return (
    <Popover
      isOpen={isOpen}
      onOpenChange={(open) => setIsOpen(open)}
      placement="bottom"
      showArrow
      offset={10}
    >
      <PopoverTrigger>
        <Button
          isIconOnly
          color="primary"
          radius="full"
          {...props}
          className={`opacity-75 data-[hover=true]:opacity-100 ${props.className}`}
        >
          {savedRecently || saved ? <FaBookmark /> : <FaRegBookmark />}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-[240px]">
        {(titleProps) =>
          isOpen ? (
            <SavePostLogic
              titleProps={titleProps}
              magazines={magazines}
              postId={post._id}
              setSavedRecently={setSavedRecently}
            />
          ) : (
            <></>
          )
        }
      </PopoverContent>
    </Popover>
  );
};

export default SaveButton;
