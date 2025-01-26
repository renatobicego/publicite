import { User as UserType, UserBusiness } from "@/types/userTypes";
import { relationTypes } from "@/utils/data/selectData";
import { Checkbox, cn, User } from "@nextui-org/react";

const CheckboxUser = ({
  user,
  relationType,
  value,
}: {
  user: UserType;
  relationType: UserRelation;
  value: string;
}) => {
  const nameToShow =
    user.userType === "Business"
      ? (user as UserBusiness).businessName
      : `${user.name} ${user.lastName}`;
  return (
    <Checkbox
      aria-label={user.name}
      classNames={{
        base: cn(
          "inline-flex max-w-md w-full bg-content1 m-0",
          "hover:bg-content2 items-center justify-start",
          "cursor-pointer rounded-lg gap-2 p-4 border-2 border-transparent",
          "data-[selected=true]:border-primary"
        ),
        label: "w-full",
      }}
      value={value}
    >
      <div className="w-full flex justify-between gap-2">
        <User
          avatarProps={{ size: "md", src: user.profilePhotoUrl }}
          name={nameToShow}
          description={user.username}
        />
        <div className="flex flex-col items-end gap-1">
          <span className="text-tiny text-default-500">
            {relationTypes.find((r) => r.value === relationType)?.label}
          </span>
        </div>
      </div>
    </Checkbox>
  );
};

export default CheckboxUser;
