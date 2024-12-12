import SendRequest from "@/components/buttons/SendRequest/SendRequest";
import {
  Contact,
  GetUser,
  UserBusiness,
  UserRelations,
} from "@/types/userTypes";
import {
  Button,
  Dropdown,
  DropdownItem,
  DropdownMenu,
  DropdownTrigger,
  Image,
  Link,
} from "@nextui-org/react";
import {
  FaFacebook,
  FaInstagram,
  FaLink,
  FaWhatsapp,
  FaXTwitter,
} from "react-icons/fa6";
import { TbWorldPin } from "react-icons/tb";
import OptionsDropdown from "../OptionsDropdown";
import ContactPetitionsList from "@/components/modals/ContactPetition/ContactPetitionsList";
import { relationTypes } from "@/utils/data/selectData";

const UserInfo = ({
  user,
  isMyProfile,
  isMyContact,
}: {
  user: GetUser;
  isMyProfile: boolean;
  isMyContact?: UserRelations;
}) => {
  const { userType } = user;
  const business = user as unknown as UserBusiness;

  const actionToShow = () => {
    switch (true) {
      case isMyProfile:
        return <ContactPetitionsList userId={user._id} />;
      case isMyContact !== undefined:
        return (
          <div className="flex flex-col gap-1">
            <SendRequest
              variant="solid"
              removeMargin={false}
              idToSendRequest={user._id}
              previousUserRelation={isMyContact}
            />
            <p className="text-xs md:text-small">
              {
                relationTypes.find(
                  (relation) => relation.value === isMyContact.typeRelationA
                )?.label
              }
            </p>
          </div>
        );
      default:
        <SendRequest
          variant="solid"
          removeMargin={false}
          idToSendRequest={user._id}
        />;
    }
  };
  return (
    <section className="flex gap-4 md:gap-6 xl:gap-8 md:max-w-[65%] xl:max-w-[50%]">
      <Image
        src={user.profilePhotoUrl}
        alt={`foto de perfil de ${user.username}`}
        className="rounded-full "
        classNames={{
          img: "object-cover w-full !h-24 md:!h-32 xl:!h-52 border",
          wrapper: "!min-w-24 w-24 md:!min-w-32 md:!w-32 xl:!w-52 xl:!min-w-52",
        }}
      />
      <div className="flex gap-2 md:gap-4 items-start flex-col">
        <h2>
          {userType === "Business"
            ? business.businessName
            : `${user.name} ${user.lastName}`}
        </h2>
        <h6>@{user.username}</h6>
        {user.description && (
          <p className="text-sm lg:text-base">{user.description}</p>
        )}
        <div className="flex items-center gap-1">
          <TbWorldPin className="size-4 min-w-4" />
          <p className="text-xs md:text-sm">{user.countryRegion}</p>
        </div>
        <div className="flex gap-2 items-center">
          {actionToShow()}
          {user.contact && <SocialMedia contact={user.contact} />}
          <OptionsDropdown user={user} />
        </div>
      </div>
    </section>
  );
};

export default UserInfo;

const SocialMedia = ({ contact }: { contact: Contact }) => {
  const { phone, instagram, facebook, x, website } = contact;
  return (
    <div className="flex gap-2">
      {phone && (
        <Link
          href={`https://api.whatsapp.com/send?phone=${phone}`}
          target="_blank"
          color="foreground"
        >
          <FaWhatsapp className="size-5" />
        </Link>
      )}
      {instagram && (
        <Link color="foreground" href={instagram} target="_blank">
          <FaInstagram className="size-5" />
        </Link>
      )}
      {facebook && (
        <Link color="foreground" href={facebook} target="_blank">
          <FaFacebook className="size-5" />
        </Link>
      )}
      {x && (
        <Link color="foreground" href={x} target="_blank">
          <FaXTwitter className="size-5" />
        </Link>
      )}
      {website && (
        <Link color="foreground" href={website} target="_blank">
          <FaLink className="size-5" />
        </Link>
      )}
    </div>
  );
};
