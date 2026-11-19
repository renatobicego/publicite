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
import OptionsDropdown from "../OptionsDropdown";
import ContactPetitionsList from "@/components/modals/ContactPetition/ContactPetitionsList";
import { relationTypes } from "@/utils/data/selectData";
import PrimaryButton from "@/components/buttons/PrimaryButton";
import DeleteUserRelation from "../DeleteUserRelation";
import {
  extractDomain,
  formatFacebookUrl,
  formatInstagamUrl,
  formatTwitterUrl,
} from "@/utils/functions/formatUrls";
import AcceptRequestFriend from "./AcceptRequestFriend";
import { AnimatePresence, motion } from "framer-motion";
import { useState } from "react";
import { TbWorldPin } from "react-icons/tb";
import CredentialCard from "@/components/Credential/CredentialCard";
import ImagePreview from "@/components/Credential/ImagePreview";
import CredentialPhotoPrompt from "../CredentialPhotoPrompt";

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
  const [isOpen, setIsOpen] = useState(true);

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
                    (relation) => relation.value === isMyContact!.typeRelationA
                  )?.label
                }
              </p>
            </div>
            <DeleteUserRelation relationId={isMyContact!._id} />
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

  // Resolve description: prefer contact.description.text, fallback to user.description
  const displayDescription = user.contact?.description?.text ?? user.description;

  const displayName =
    userType === "Business"
      ? business.businessName
      : [user.name, user.lastName].filter(Boolean).join(" ") || user.username;

  const profesion = canSeeField(
    user.contact?.profesion?.visibility,
    isMyProfile,
    isMyContact
  )
    ? user.contact?.profesion?.label
    : undefined;

  const showDescription =
    !!displayDescription &&
    canSeeField(user.contact?.description?.visibility, isMyProfile, isMyContact);

  return (
    <section className="w-full md:max-w-2xl flex flex-col gap-3">
      {/* Por fuera de la credencial: foto de perfil, nombre y usuario */}
      <div className="flex items-center gap-4">
        <ImagePreview
          src={user.profilePhotoUrl}
          alt={`foto de perfil de ${user.username}`}
        >
          <Image
            src={user.profilePhotoUrl}
            alt={`foto de perfil de ${user.username}`}
            radius="full"
            removeWrapper
            className="block size-24 md:size-32 object-cover shrink-0 border-4 border-white shadow-md"
          />
        </ImagePreview>
        <div className="flex-1 min-w-0">
          <h2 className="text-xl md:text-2xl font-semibold leading-tight break-words">
            {displayName}
          </h2>
          <p className="text-sm text-default-500 truncate">@{user.username}</p>
        </div>
        <OptionsDropdown user={user} isMyProfile={isMyProfile} />
      </div>

      <CredentialCard
        userId={user._id}
        displayName={displayName}
        profilePhotoUrl={user.profilePhotoUrl}
        credentialPhotoUrl={user.credentialPhotoUrl}
        credentialColor={user.credentialColor}
        credentialId={user.credentialId}
        footer={actionToShow()}
      >
        {profesion && (
          <h4 className="font-semibold text-sm md:text-base leading-tight">
            {profesion}
          </h4>
        )}
        {showDescription && (
          <p className="text-xs md:text-sm whitespace-pre-line">
            {displayDescription}
          </p>
        )}
        {showAddress() && (
          <div className="flex items-center gap-1.5 text-xs md:text-sm text-default-600">
            <TbWorldPin className="shrink-0" />
            <span>{user.countryRegion}</span>
          </div>
        )}
        {isMyProfile && !user.credentialPhotoUrl && (
          <CredentialPhotoPrompt credentialColor={user.credentialColor} />
        )}
      </CredentialCard>

      {user.contact && (
        <div className="flex flex-col gap-2">
          <PrimaryButton
            size="sm"
            className="self-start"
            onClick={() => setIsOpen((prev) => !prev)}
          >
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
                <div className="flex flex-col sm:flex-row border rounded-2xl overflow-hidden bg-white">
                  <div className="bg-primary text-white px-4 py-3 sm:w-2/5 font-medium">
                    <h3 className="text-sm md:text-base">Links útiles</h3>
                  </div>

                  <div className="px-4 py-3 sm:w-3/5 flex flex-col gap-2">
                    <SocialMediaLinks
                      contact={user.contact}
                      isMyProfile={isMyProfile}
                      isMyContact={isMyContact}
                    />
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

// ─── Visibility helper ────────────────────────────────────────────────────────

const relationHierarchy: UserRelation[] = ["contacts", "friends", "topfriends"];

function canSeeField(
  visibility: Visibility | undefined,
  isMyProfile: boolean,
  isMyContact?: UserRelations
): boolean {
  if (isMyProfile) return true;
  if (!visibility || visibility === "public" || visibility === "registered") return true;
  if (!isMyContact) return false;
  const myRelationIndex = relationHierarchy.indexOf(isMyContact.typeRelationA);
  const requiredIndex = relationHierarchy.indexOf(visibility.toLowerCase() as UserRelation);
  return myRelationIndex >= requiredIndex;
}

function ContactField<T extends string | undefined>({
  value,
  visibility,
  isMyProfile,
  isMyContact,
  render,
  fallback = null,
}: {
  value: T;
  visibility: Visibility | undefined;
  isMyProfile: boolean;
  isMyContact?: UserRelations;
  render: (val: NonNullable<T>) => React.ReactNode;
  fallback?: React.ReactNode;
}) {
  if (!canSeeField(visibility, isMyProfile, isMyContact)) return <>{fallback}</>;
  if (!value) return <>{fallback}</>;
  return <>{render(value as NonNullable<T>)}</>;
}

// ─── Social media links section ───────────────────────────────────────────────

const SocialMediaLinks = ({
  contact,
  isMyProfile,
  isMyContact,
}: {
  contact: Contact;
  isMyProfile: boolean;
  isMyContact?: UserRelations;
}) => {
  const { phone, instagram, facebook, x, website, curriculum, links } = contact;

  return (
    <div className="flex gap-2 flex-col items-start">
      <ContactField
        value={phone}
        visibility={contact.phoneVisibility}
        isMyProfile={isMyProfile}
        isMyContact={isMyContact}
        render={(val) => (
          <Link
            href={`https://api.whatsapp.com/send?phone=${val}`}
            target="_blank"
            color="foreground"
            className="flex items-center gap-1"
          >
            <FaWhatsapp className="size-4" />
            <p className="text-xs md:text-sm">{val}</p>
          </Link>
        )}
      />

      <ContactField
        value={instagram}
        visibility={contact.instagramVisibility}
        isMyProfile={isMyProfile}
        isMyContact={isMyContact}
        render={(val) => (
          <Link
            className="flex items-center gap-1"
            color="foreground"
            href={val}
            target="_blank"
          >
            <FaInstagram className="size-4" />
            <p className="text-xs md:text-sm">{formatInstagamUrl(val)}</p>
          </Link>
        )}
      />

      <ContactField
        value={facebook}
        visibility={contact.facebookVisibility}
        isMyProfile={isMyProfile}
        isMyContact={isMyContact}
        render={(val) => (
          <Link
            className="flex items-center gap-1"
            color="foreground"
            href={val}
            target="_blank"
          >
            <FaFacebook className="size-4" />
            <p className="text-xs md:text-sm">{formatFacebookUrl(val)}</p>
          </Link>
        )}
      />

      <ContactField
        value={x}
        visibility={contact.xVisibility}
        isMyProfile={isMyProfile}
        isMyContact={isMyContact}
        render={(val) => (
          <Link
            className="flex items-center gap-1"
            color="foreground"
            href={val}
            target="_blank"
          >
            <FaXTwitter className="size-4" />
            <p className="text-xs md:text-sm">{formatTwitterUrl(val)}</p>
          </Link>
        )}
      />

      <ContactField
        value={website}
        visibility={contact.websiteVisibility}
        isMyProfile={isMyProfile}
        isMyContact={isMyContact}
        render={(val) => (
          <Link
            className="flex items-center gap-1"
            color="foreground"
            href={/^https?:\/\//i.test(val) ? val : `https://${val}`}
            isExternal
            target="_blank"
          >
            <FaLink className="size-4" />
            <p className="text-xs md:text-sm">{extractDomain(val)}</p>
          </Link>
        )}
      />

      {links && links.length > 0 &&
        links
          .filter((link) => canSeeField(link.visibility, isMyProfile, isMyContact))
          .map((link, i) => (
            <Link
              key={i}
              href={link.url}
              target="_blank"
              color="foreground"
              className="flex items-center gap-1"
            >
              <FaLink className="size-4" />
              <p className="text-xs md:text-sm">{link.label || extractDomain(link.url)}</p>
            </Link>
          ))}

      {curriculum?.ref && canSeeField(curriculum.visibility, isMyProfile, isMyContact) && (
        <Link href={`https://utfs.io/f/${curriculum.ref}`} target="_blank">
          <PrimaryButton className="mt-1">Descargar CV</PrimaryButton>
        </Link>
      )}
    </div>
  );
};
