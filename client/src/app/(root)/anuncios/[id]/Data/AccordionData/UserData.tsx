import { PROFILE } from "@/app/utils/urls";
import { Author } from "@/types/postTypes";
import { Avatar, Link } from "@nextui-org/react";
import {
  FaFacebook,
  FaInstagram,
  FaLink,
  FaWhatsapp,
  FaXTwitter,
} from "react-icons/fa6";

const UserData = ({
  author,
  showContact,
}: {
  author: Author;
  showContact: boolean;
}) => {
  const { phone, facebook, instagram, x, website } = author.contact;
  return (
    <div className="w-full justify-between flex items-center">
      <Link
        href={`${PROFILE}/${author.username}`}
        className="flex gap-2"
        color="foreground"
        size="sm"
      >
        <Avatar color="primary" src={author.profilePhotoUrl} />
        <p className="font-medium">
          {author.name} {author.lastName}
        </p>
      </Link>
      {showContact && (
        <div className="flex gap-2">
          Redes:
          {phone && (
            <Link
              href={`https://api.whatsapp.com/send?phone=${phone}`}
              target="_blank"
              color="foreground"
            >
              <FaWhatsapp className="size-5" />
            </Link>
          )}
          {website && (
            <Link href={website} target="_blank" color="foreground">
              <FaLink className="size-5" />
            </Link>
          )}
          {facebook && (
            <Link href={facebook} target="_blank" color="foreground">
              <FaFacebook className="size-5" />
            </Link>
          )}
          {instagram && (
            <Link href={instagram} target="_blank" color="foreground">
              <FaInstagram className="size-5" />
            </Link>
          )}
          {x && (
            <Link href={x} target="_blank" color="foreground">
              <FaXTwitter className="size-5" />
            </Link>
          )}
        </div>
      )}
    </div>
  );
};

export default UserData;
