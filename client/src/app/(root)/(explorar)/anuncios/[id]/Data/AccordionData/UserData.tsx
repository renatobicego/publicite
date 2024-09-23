import UsernameAvatar from "@/components/buttons/UsernameAvatar";
import { PROFILE } from "@/utils/data/urls";
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
      <UsernameAvatar author={author} />
      {showContact && (
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
