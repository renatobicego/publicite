"use client";
import { magazines } from "@/app/utils/data/mockedData";
import { Good, Magazine, Petition, Service } from "@/types/postTypes";
import {
  Accordion,
  AccordionItem,
  Button,
  ButtonProps,
  Link,
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@nextui-org/react";
import { FaBookmark, FaChevronLeft, FaRegBookmark } from "react-icons/fa6";
import PrimaryButton from "./PrimaryButton";
import { CREATE_MAGAZINE } from "@/app/utils/data/urls";

interface SaveButtonProps extends ButtonProps {
  saved: boolean;
  post: Good | Service | Petition;
}

const SaveButton: React.FC<SaveButtonProps> = ({ saved, post, ...props }) => {
  return (
    <Popover placement="bottom" showArrow offset={10}>
      <PopoverTrigger>
        <Button
          isIconOnly
          color="primary"
          radius="full"
          {...props}
          className={`opacity-75 data-[hover=true]:opacity-100 ${props.className}`}
        >
          {saved ? <FaBookmark /> : <FaRegBookmark />}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-[240px]">
        {(titleProps) => (
          <div className="px-1 py-2 w-full">
            <p
              className="text-sm font-semibold text-text-color"
              {...titleProps}
            >
              Guardar en Revista
            </p>
            <div className="mt-2 flex flex-col gap-2 w-full">
              <p className="text-xs">Tus revistas</p>
              {magazines.map((magazine) => (
                <MagazineCard key={magazine._id} magazine={magazine} />
              ))}
              <PrimaryButton as={Link} href={`${CREATE_MAGAZINE}/${post._id}`}>
                Crear Revista
              </PrimaryButton>
            </div>
          </div>
        )}
      </PopoverContent>
    </Popover>
  );
};

export default SaveButton;

const MagazineCard = ({ magazine }: { magazine: Magazine }) => {
  if (magazine.sections.length > 1) {
    return (
      <Accordion variant="bordered" isCompact>
        <AccordionItem
          indicator={<FaChevronLeft className="size-3" />}
          title={magazine.name}
          classNames={{
            title: "text-small font-normal",
            content: "flex flex-col gap-1"
          }}
        >
          {magazine.sections.map((section) => (
            <Button
              key={section._id}
              variant="bordered"
              className="justify-start w-full"
            >
              {section.title}
            </Button>
          ))}
        </AccordionItem>
      </Accordion>
    );
  } else {
    return (
      <Button variant="bordered" className="justify-start">
        {magazine.name}
      </Button>
    );
  }
};
