import { Group } from "@/types/userTypes";
import { Avatar, Card, CardBody, Link } from "@nextui-org/react";
import SendRequest from "../buttons/SendRequest";
import { FILE_URL, GROUPS } from "@/utils/data/urls";

const GroupCard = ({ group }: { group: Group }) => {
  return (
    <Card className="bg-fondo">
      <CardBody className="sm:flex-row gap-2 md:gap-6 sm:items-center">
        <Avatar
          className="shrink-0 bg-white border"
          src={group.profilePhotoUrl ? FILE_URL + group.profilePhotoUrl : "/groupLogo.png" }
          classNames={{
            base: "!w-14 md:!w-16 2xl:!w-20 !h-14 md:!h-16 2xl:!h-20",
          }}
        />
        <div className="flex flex-col gap-2 md:gap-1 items-start flex-1">
          <Link color="foreground" href={`${GROUPS}/${group._id}`}>
            <h6>{group.name}</h6>
          </Link>
          <p className="text-xs md:text-sm">{group.members.length} miembros</p>
          <SendRequest isGroup />
        </div>
      </CardBody>
    </Card>
  );
};

export default GroupCard;
