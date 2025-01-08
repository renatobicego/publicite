import { FILE_URL, PROFILE } from "@/utils/data/urls";
import { Avatar, Link } from "@nextui-org/react";

const UsernameAvatar = ({
  author,
  showAvatar = true,
  textColor = "text-text-color",
  withoutLink,
}: {
  author: any;
  showAvatar?: boolean;
  textColor?: string;
  withoutLink?: boolean;
  }) => {
  if(withoutLink) return (
    <div className="flex gap-2 items-center">
      {showAvatar && (
        <Avatar
          color="primary"
          isBordered
          className="w-6 h-6 md:w-8 md:h-8 xl:w-10 xl:h-10"
          src={author.profilePhotoUrl ? author.profilePhotoUrl : ""}
        />
      )}
      <p
        className={`${textColor} font-medium text-xs lg:max-2xl:text-small 2xl:text-sm`}
      >
        {author.name && author.lastName
          ? `${author.name} ${author.lastName}`
          : author.username}
      </p>
    </div>
  )
  return (
    <Link
      href={`${PROFILE}/${author.username}`}
      className="flex gap-2"
      color="foreground"
      size="sm"
    >
      {showAvatar && (
        <Avatar
          color="primary"
          isBordered
          className="w-6 h-6 md:w-8 md:h-8 xl:w-10 xl:h-10"
          src={author.profilePhotoUrl ? author.profilePhotoUrl : ""}
        />
      )}
      <p
        className={`${textColor} font-medium text-xs lg:max-2xl:text-small 2xl:text-sm`}
      >
        {author.name && author.lastName
          ? `${author.name} ${author.lastName}`
          : author.username}
      </p>
    </Link>
  );
};

export default UsernameAvatar;
