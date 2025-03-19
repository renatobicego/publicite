import { Image, Link } from "@nextui-org/react";
import { FaUser } from "react-icons/fa6";
import OptionsDropdown from "./OptionsDropdown";
import SecondaryButton from "@/components/buttons/SecondaryButton";
import { EDIT_GROUP, FILE_URL } from "@/utils/data/urls";
import { GetGroups } from "@/types/groupTypes";
import { User } from "@/types/userTypes";
import GroupNote from "@/components/GroupNote/GroupNote";
import GroupActionButton from "./GroupActionButton";

const GroupInfo = async ({
  group,
  isAdmin,
  isCreator,
}: {
  group: GetGroups;
  isAdmin: boolean;
  isCreator: boolean;
}) => {
  const { profilePhotoUrl, name, _id, details, rules, members, alias, admins } =
    group.group;
  const { isMember, hasGroupRequest, hasJoinRequest } = group;

  return (
    <section className="flex gap-4 md:gap-6 xl:gap-8 w-full max-md:flex-col md:max-lg:flex-wrap">
      <Image
        src={profilePhotoUrl ? FILE_URL + profilePhotoUrl : "/groupLogo.png"}
        alt={`foto de perfil de ${name}`}
        radius="full"
        classNames={{
          img: "object-cover w-full !h-32 md:!h-40 xl:!h-52 ",
          wrapper:
            "min-w-32 !w-32 md:!w-40 md:!min-w-40 xl:!w-52 xl:!min-w-52 border h-fit",
        }}
      />
      <div className="flex gap-2 md:gap-4 items-start flex-col mr-auto">
        <h2>{name}</h2>
        <h6>@{alias}</h6>
        {details && <p className="text-sm lg:text-base">{details}</p>}
        <div className="flex items-center gap-1">
          <FaUser className="size-4 min-w-4" />
          <p className="text-xs md:text-sm">
            {members.length + 1 + admins.length} miembro/s
          </p>
        </div>
        <div className="flex gap-2 items-center max-md:flex-wrap">
          {isAdmin && (
            <SecondaryButton as={Link} href={`${EDIT_GROUP}/${_id}`}>
              {" "}
              Editar Grupo{" "}
            </SecondaryButton>
          )}

          <GroupActionButton
            isMember={isMember}
            hasGroupRequest={hasGroupRequest}
            hasJoinRequest={hasJoinRequest}
            rules={rules}
            groupId={_id}
          />
          <OptionsDropdown
            group={group.group}
            membersIds={(members as User[]).map((member) => member._id)}
            isCreator={isCreator}
            image={profilePhotoUrl}
            admins={admins as User[]}
          />
        </div>
      </div>
      <GroupNote
        groupNote={group.group.groupNote}
        isAdmin={isAdmin}
        groupId={_id}
      />
    </section>
  );
};

export default GroupInfo;
