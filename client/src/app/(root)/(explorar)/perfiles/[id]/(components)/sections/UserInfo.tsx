import SendRequest from "@/components/buttons/SendRequest/SendRequest";
import {
  Contact,
  GetUser,
  UserBusiness,
  UserRelations,
} from "@/types/userTypes";
import { Image, Link } from "@nextui-org/react";
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
import PrimaryButton from "@/components/buttons/PrimaryButton";
import DeleteUserRelation from "../DeleteUserRelation";
import {
  extractDomain,
  formatFacebookUrl,
  formatInstagamUrl,
} from "@/utils/functions/formatUrls";

const UserInfo = ({
  user,
  isMyProfile,
  isMyContact,
}: {
  user: GetUser & { isFriendRequestPending: boolean };
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
          <>
            <div className="flex flex-col gap-1">
              {user.isFriendRequestPending ? (
                <PrimaryButton
                  isDisabled
                  className="hover:bg-none"
                  variant="bordered"
                >
                  Cambio de Relación Enviada
                </PrimaryButton>
              ) : (
                <SendRequest
                  variant="solid"
                  removeMargin={false}
                  idToSendRequest={user._id}
                  previousUserRelation={isMyContact}
                />
              )}
              <p className="text-xs md:text-small ml-2.5 italic">
                Es tu{" "}
                {
                  relationTypes.find(
                    (relation) => relation.value === isMyContact.typeRelationA
                  )?.label
                }
              </p>
            </div>
            <DeleteUserRelation relationId={isMyContact._id} />
          </>
        );
      case user.isFriendRequestPending:
        return (
          <PrimaryButton
            isDisabled
            className="hover:bg-none"
            variant="bordered"
          >
            Solicitud enviada
          </PrimaryButton>
        );
      default:
        return (
          <SendRequest
            variant="solid"
            removeMargin={false}
            idToSendRequest={user._id}
          />
        );
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
      <div className="flex gap-2 md:gap-3 items-start flex-col flex-1">
        <div className="flex gap-1 lg:gap-12 items-start justify-between w-full">
          <h2 className="max-lg:mt-1">
            {userType === "Business"
              ? business.businessName
              : `${user.name} ${user.lastName}`}
          </h2>
          <OptionsDropdown user={user} />
        </div>
        <h6>@{user.username}</h6>
        {user.description && (
          <p className="text-small md:text-sm lg:text-base">
            {user.description}
          </p>
        )}
        <div className="flex items-center gap-1">
          <TbWorldPin className="size-4 min-w-4" />
          <p className="text-xs md:text-sm">{user.countryRegion}</p>
        </div>
        {user.contact && <SocialMedia contact={user.contact} />}
        <div className="flex gap-2 items-start">{actionToShow()}</div>
      </div>
    </section>
  );
};

export default UserInfo;

const SocialMedia = ({ contact }: { contact: Contact }) => {
  const { phone, instagram, facebook, x, website } = contact;
  function formatXTwitterUrl(x: string): import("react").ReactNode {
    throw new Error("Function not implemented.");
  }

  return (
    <div className="flex gap-2 flex-col items-start">
      {phone && (
        <Link
          href={`https://api.whatsapp.com/send?phone=${phone}`}
          target="_blank"
          color="foreground"
          className="flex items-center gap-1"
        >
          <FaWhatsapp className="size-4" />
          <p className="text-xs md:text-sm">{phone}</p>
        </Link>
      )}
      {instagram && (
        <Link
          className="flex items-center gap-1"
          color="foreground"
          href={instagram}
          target="_blank"
        >
          <FaInstagram className="size-4" />
          <p className="text-xs md:text-sm">{formatInstagamUrl(instagram)}</p>
        </Link>
      )}
      {facebook && (
        <Link
          className="flex items-center gap-1"
          color="foreground"
          href={facebook}
          target="_blank"
        >
          <FaFacebook className="size-4" />
          <p className="text-xs md:text-sm">{formatFacebookUrl(facebook)}</p>
        </Link>
      )}
      {x && (
        <Link
          className="flex items-center gap-1"
          color="foreground"
          href={x}
          target="_blank"
        >
          <FaXTwitter className="size-4" />
          <p className="text-xs md:text-sm">{formatXTwitterUrl(x)}</p>
        </Link>
      )}
      {website && (
        <Link
          className="flex items-center gap-1"
          color="foreground"
          href={website}
          target="_blank"
        >
          <FaLink className="size-4" />
          <p className="text-xs md:text-sm">{extractDomain(website)}</p>
        </Link>
      )}
    </div>
  );
};
