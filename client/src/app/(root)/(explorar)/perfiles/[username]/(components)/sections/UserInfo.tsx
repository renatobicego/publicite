import SendRequest from "@/components/buttons/SendRequest/SendRequest";
import { Contact, GetUser, UserBusiness } from "@/types/userTypes";
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

const UserInfo = ({
  user,
  isMyProfile,
}: {
  user: GetUser;
  isMyProfile: boolean;
}) => {
  const { userType } = user;
  const business = user as unknown as UserBusiness;
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
        {user.contact && <SocialMedia contact={user.contact} />}
        <div className="flex gap-2 items-center">
          {isMyProfile ? (
            <ContactPetitionsList userId={user._id} />
          ) : (
            <SendRequest
              variant="solid"
              removeMargin={false}
              idToSendRequest={user._id}
            />
          )}
          <OptionsDropdown username={user.username} />
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
