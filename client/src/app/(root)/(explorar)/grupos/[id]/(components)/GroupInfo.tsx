import SendRequest from "@/components/buttons/SendRequest";
import { Group, User } from "@/types/userTypes";
import { Image, Link } from "@nextui-org/react";
import { FaUser } from "react-icons/fa6";
import OptionsDropdown from "./OptionsDropdown";
import { currentUser } from "@clerk/nextjs/server";
import RulesPopover from "./RulesPopover";
import SecondaryButton from "@/components/buttons/SecondaryButton";
import { EDIT_GROUP, FILE_URL } from "@/utils/data/urls";

const GroupInfo = async ({ group, isAdmin }: { group: Group; isAdmin: boolean }) => {
  return (
    <section className="flex gap-4 md:gap-6 xl:gap-8 md:max-w-[65%] xl:max-w-[50%] max-md:flex-col">
      <Image
        src={group.profilePhotoUrl ? FILE_URL + group.profilePhotoUrl : "/groupLogo.png"}
        alt={`foto de perfil de ${group.name}`}
        className="rounded-full "
        classNames={{
          img: "object-cover w-full !h-24 md:!h-32 xl:!h-52",
          wrapper: "!min-w-24 w-24 md:!min-w-32 md:!w-32 xl:!w-52 xl:!min-w-52",
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
          {isAdmin ? (
            <SecondaryButton as={Link} href={`${EDIT_GROUP}/${group._id}`}>
              {" "}
              Editar Grupo{" "}
            </SecondaryButton>
          ) : (
            <SendRequest variant="solid" removeMargin={false} isGroup />
          )}
          <RulesPopover rules={group.rules} />
          <OptionsDropdown groupId={group._id} />
        </div>
      </div>
    </section>
  );
};

export default GroupInfo;
