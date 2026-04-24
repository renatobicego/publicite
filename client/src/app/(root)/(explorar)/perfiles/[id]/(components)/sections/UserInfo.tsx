"use client";
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
import AcceptRequestFriend from "./AcceptRequestFriend";
import { AnimatePresence, motion } from "framer-motion";
import { useState } from "react";

const UserInfo = ({
  user,
  isMyProfile,
  isMyContact,
}: {
  user: GetUser & {
    isFriendRequestPending: boolean;
    isAcceptRequestFriend?: {
      notification_id: string;
      type:
        | "notification_user_new_friend_request"
        | "notification_user_new_relation_change";
      value: boolean;
      userRelationId: string;
      toRelationShipChange: UserRelation;
      newRelation: UserRelation;
    };
  };
  isMyProfile: boolean;
  isMyContact?: UserRelations;
}) => {
  const { userType } = user;
  const business = user as unknown as UserBusiness;
  const [isOpen, setIsOpen] = useState(false);

  const actionToShow = () => {
    switch (true) {
      case isMyProfile:
        return <ContactPetitionsList userId={user._id} />;
      case user.isAcceptRequestFriend?.value:
        return (
          <AcceptRequestFriend
            isAcceptRequestFriend={user.isAcceptRequestFriend}
            userIdTo={user._id}
          />
        );
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

  const showAddress = () => {
    if (isMyProfile) return true;
    if (isMyContact) {
      if (!user.addressPrivacy) return true;
      if (user.addressPrivacy === "all") return true;
      if (user.addressPrivacy === isMyContact.typeRelationA) return true;
      switch (user.addressPrivacy) {
        case "contacts":
          if (
            isMyContact.typeRelationA === "friends" ||
            isMyContact.typeRelationA === "topfriends"
          )
            return true;
          return false;
        case "friends":
          if (isMyContact.typeRelationA === "topfriends") return true;
          return false;
      }
      return false;
    }
  };
  return (
    <section className="w-full max-w-4xl  flex flex-col gap-4">
      {/* CARD PRINCIPAL */}
      <div className="flex flex-col md:flex-row rounded-2xl border overflow-hidden">
        {/* IZQUIERDA (ROJO) */}
        <div className="bg-primary text-white p-6 md:w-1/2 flex flex-col items-start justify-center gap-3">
          <h2 className="max-lg:mt-1">
            {userType === "Business"
              ? business.businessName
              : `${user.name} ${user.lastName}`}
          </h2>

          <p className="opacity-90">@{user.username}</p>

          <Image
            src={user.profilePhotoUrl}
            alt={`foto de perfil de ${user.username}`}
            className="rounded-full self-end"
            classNames={{
              img: "object-cover w-full !h-24 md:!h-32 xl:!h-52 2xl:!w-64 border-4 border-white",
              wrapper:
                "!min-w-24 w-24 md:!min-w-32 md:!w-32 xl:!w-52 xl:!min-w-52 2xl:!w-52 2xl:!min-w-52 self-end",
            }}
          />
        </div>

        {/* DERECHA (GRIS) */}
        <div className="p-6 md:w-1/2 flex flex-col justify-start gap-4">
          <div className="flex justify-between items-start">
            <h4>Profesion</h4>
            <OptionsDropdown user={user} />
          </div>

          {user.description && (
            <p className="text-small md:text-sm lg:text-base">
              {user.description}
            </p>
          )}
          {showAddress() && (
            <div className="flex items-center gap-2 text-sm text-default-600">
              <TbWorldPin />
              <span>{user.countryRegion}</span>
            </div>
          )}

          <div className="mt-auto">{actionToShow()}</div>
        </div>
      </div>

      {user.contact && (
        <div className="flex flex-col gap-2">
          <PrimaryButton onClick={() => setIsOpen((prev) => !prev)}>
            {isOpen ? "Ocultar links" : "Desplegar para ver links"}
          </PrimaryButton>

          <AnimatePresence initial={false}>
            {isOpen && (
              <motion.div
                key="links"
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: "auto", opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                transition={{ duration: 0.3 }}
                className="overflow-hidden"
              >
                <div className="flex flex-col md:flex-row border rounded-2xl overflow-hidden">
                  {/* TITULO */}
                  <div className="bg-primary text-white p-4 md:w-1/2 font-medium">
                    <h3>Links útiles</h3>
                  </div>

                  {/* LINKS */}
                  <div className="p-4 md:w-1/2 flex flex-col gap-2">
                    <SocialMedia contact={user.contact} />

                    <PrimaryButton className="mt-2 w-fit">
                      Descargar CV
                    </PrimaryButton>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      )}
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
