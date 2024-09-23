import { Group, User, UserBusiness } from "@/types/userTypes";
import { Avatar, Card, CardBody } from "@nextui-org/react";
import { TbWorldPin } from "react-icons/tb";
import SendRequest from "../buttons/SendRequest";

const GroupCard = ({ group }: { group: Group }) => {
  return (
    <Card className="bg-fondo">
      <CardBody className="sm:flex-row gap-2 md:gap-6 sm:items-center">
        <Avatar
          className="shrink-0"
          src={group.profilePhotoUrl}
          classNames={{
            base: "!w-14 md:!w-16 2xl:!w-20 !h-14 md:!h-16 2xl:!h-20",
          }}
        />
        <div className="flex flex-col gap-2 md:gap-1 items-start flex-1">
          <h6>{group.name}</h6>
          <p className="text-xs md:text-sm">{group.members.length} miembros</p>
          <SendRequest isGroup />
        </div>
      </CardBody>
    </Card>
  );
};

export default GroupCard;
