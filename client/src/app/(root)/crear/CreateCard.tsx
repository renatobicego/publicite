import { Button, Card, CardBody, CardHeader } from "@nextui-org/react";
import Link from "next/link";
import { IconType } from "react-icons";
import { FaChevronRight } from "react-icons/fa6";

export interface PostType {
  label: string;
  description: string;
  icon: IconType;
  bg: string;
  url: string;
}

interface CreateCardProps {
  postType: PostType;
}

const CreateCard = ({ postType }: CreateCardProps) => {
  return (
    <Card
      as={Link}
      shadow="md"
      href={postType.url}
      className={`${postType.bg} w-full text-white hover:scale-[1.02] transition-all duration-500`}
    >
      <CardHeader className="flex w-full justify-between pl-8 pr-6 2xl:pl-10 2xl:pr-8 pt-8 pb-0 md:py-8 2xl:py-10">
        <postType.icon className="text-white size-12" />
        <Button radius="full" isIconOnly className="bg-white">
          <FaChevronRight className={`text-${postType.bg.split("-")[1]}`} />
        </Button>
      </CardHeader>
      <CardBody className="px-8 2xl:px-10 pt-10 md:pt-20 pb-8 2xl:pb-10 justify-end">
        <h4 className="text-lg md:text-xl xl:text-2xl">{postType.label}</h4>
        <p className="text-sm xl:text-base">{postType.description}</p>
      </CardBody>
    </Card>
  );
};

export default CreateCard;
