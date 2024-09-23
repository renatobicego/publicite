import { PROFILE } from "@/utils/data/urls";
import { Author, Reviewer } from "@/types/postTypes";
import { Avatar, Link } from "@nextui-org/react";

const UsernameAvatar = ({
  author,
  showAvatar = true,
  textColor= "text-text-color"
}: {
  author: any;
  showAvatar?: boolean;
  textColor?: string
}) => {
  return (
    <Link
      href={`${PROFILE}/${author.username}`}
      className="flex gap-2"
      color="foreground"
      size="sm"
    >
      {showAvatar && <Avatar color="primary" className="max-md:w-8 max-md:h-8" src={author.profilePhotoUrl} />}
      <p className={`${textColor} font-medium text-sm xl:text-base`}>
        {author.name && author.lastName ? `${author.name} ${author.lastName}` : author.username}
      </p>
    </Link>
  );
};

export default UsernameAvatar;
