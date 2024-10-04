import { Image } from "@nextui-org/react";
import { NotificationImage } from "../NotificationCard";
import { Group } from "@/types/userTypes";

const GroupImage = ({
  group,
}: {
  group: Pick<Group, "_id" | "name" | "profilePhotoUrl">;
}) => {
  return (
    <NotificationImage>
      <Image
        radius="full"
        src={group.profilePhotoUrl || "/groupLogo.png"}
        alt="foto"
        className="object-cover w-16 h-16"
      />
    </NotificationImage>
  );
};

export default GroupImage;
