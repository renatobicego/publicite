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
import { useMagazinesData } from "@/app/(root)/providers/userDataProvider";
import { useState } from "react";
import SavePostLogic from "./SavePostLogic";

interface SaveButtonProps extends ButtonProps {
  post: Good | Service | Petition;
}

const SaveButton: React.FC<SaveButtonProps> = ({ post, ...props }) => {
  // get magazines and posts that are in magazines
  const { magazines, postsInMagazine } = useMagazinesData();
  const [isOpen, setIsOpen] = useState(false);
  // get posts in each magazine and section
  const saved = postsInMagazine.filter(
    (postInMagazine) => postInMagazine.postId === post._id
  )
  return (
    <Popover
      isOpen={isOpen}
      onOpenChange={(open) => setIsOpen(open)}
      placement="bottom"
      shouldFlip={false}
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
          { saved.length > 0 ? <FaBookmark /> : <FaRegBookmark />}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-[270px]">
        {(titleProps) =>
          isOpen ? (
            <SavePostLogic
              titleProps={titleProps}
              magazines={magazines}
              postId={post._id}
              saved={saved}
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
