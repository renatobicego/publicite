import { User, UserBusiness } from "@/types/userTypes";
import {
  Select,
  Chip,
  SelectItem,
  Avatar,
  SharedSelection,
} from "@nextui-org/react";
import { FieldInputProps } from "formik";

interface SelectUserProps extends FieldInputProps<string> {
  onSelectionChange: ((key: SharedSelection) => void) | undefined;
  items: User[];
}
const SelectUsers = (props: SelectUserProps) => {
  const nameToShow = (user: User) => {
    const { userType } = user;
    return userType === "Business"
      ? (user as UserBusiness).businessName
      : `${user.name} ${user.lastName}`;
  };
  return (
    <Select
      label="Invitar colaboradores"
      placeholder="Seleccionar usuarios"
      variant="bordered"
      radius="full"
      selectionMode="multiple"
      labelPlacement="outside"
      scrollShadowProps={{
        hideScrollBar: false,
      }}
      classNames={{
        trigger:
          "shadow-none hover:shadow-sm border-[0.5px] group-data-[focus=true]:border-light-text py-1",
        value: "text-[0.8125rem]",
        label: "font-medium text-[0.8125rem]",
      }}
      renderValue={(items) => {
        return (
          <div className="flex flex-wrap gap-2">
            {items.map((item) => (
              <Chip color="default" size="sm" variant="bordered" key={item.key}>
                {item.data?.username}
              </Chip>
            ))}
          </div>
        );
      }}
      {...props}
      selectedKeys={props.value ? props.value : []}
    >
      {(user) => (
        <SelectItem
          key={user._id}
          textValue={nameToShow(user)}
          value={user._id}
        >
          <div className="flex gap-2 items-center">
            <Avatar
              alt={user.name}
              className="flex-shrink-0"
              size="sm"
              src={user.profilePhotoUrl}
            />
            <div className="flex flex-col">
              <span className="text-small">{nameToShow(user)}</span>
              <span className="text-tiny text-default-400">
                @{user.username}
              </span>
            </div>
          </div>
        </SelectItem>
      )}
    </Select>
  );
};

export default SelectUsers;
