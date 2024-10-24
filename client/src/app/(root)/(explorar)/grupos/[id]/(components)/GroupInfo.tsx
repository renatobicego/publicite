import SendRequest from "@/components/buttons/SendRequest";
import { Image, Link } from "@nextui-org/react";
import { FaUser } from "react-icons/fa6";
import OptionsDropdown from "./OptionsDropdown";
import RulesPopover from "./RulesPopover";
import SecondaryButton from "@/components/buttons/SecondaryButton";
import { EDIT_GROUP, FILE_URL } from "@/utils/data/urls";
import { Group } from "@/types/groupTypes";
import { currentUser, User } from "@clerk/nextjs/server";

const GroupInfo = async ({
  group,
  isAdmin,
  isMember,
  userId
}: {
  group: Group;
  isAdmin: boolean;
    isMember: boolean;
    userId: string;
}) => {
  return (
    <section className="flex gap-4 md:gap-6 xl:gap-8 md:max-w-[75%] xl:max-w-[65%] max-md:flex-col">
      <Image
        src={
          group.profilePhotoUrl
            ? FILE_URL + group.profilePhotoUrl
            : "/groupLogo.png"
        }
        alt={`foto de perfil de ${group.name}`}
        radius="full"
        classNames={{
          img: "object-cover w-full !h-24 md:!h-32 xl:!h-52 ",
          wrapper:
            "!min-w-24 w-24 md:!min-w-32 md:!w-32 xl:!w-52 xl:!min-w-52 border",
        }}
      />
      <div className="flex gap-2 md:gap-4 items-start flex-col">
        <h2>{group.name}</h2>
        <p className="text-sm lg:text-base">{group.details}</p>
        <div className="flex items-center gap-1">
          <FaUser className="size-4 min-w-4" />
          <p className="text-xs md:text-sm">{group.members.length} miembro/s</p>
        </div>
        <div className="flex gap-2 items-center max-md:flex-wrap">
          {isAdmin && (
            <SecondaryButton as={Link} href={`${EDIT_GROUP}/${group._id}`}>
              {" "}
              Editar Grupo{" "}
            </SecondaryButton>
          )}

          {isMember ? (
            <>
              <RulesPopover rules={group.rules} />
            </>
          ) : (
            <SendRequest variant="solid" removeMargin={false} isGroup />
          )}
          <OptionsDropdown
            groupId={group._id}
            isMember={isMember}
            isCreator={userId === group.creator}
            image={group.profilePhotoUrl}
          />
        </div>
      </div>
    </section>
  );
};

export default GroupInfo;
