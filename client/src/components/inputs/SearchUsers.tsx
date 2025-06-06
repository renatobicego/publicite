import { User, UserBusiness } from "@/types/userTypes";
import { toastifyError } from "@/utils/functions/toastify";
import {
  Select,
  Chip,
  SelectItem,
  Avatar,
  SharedSelection,
  AutocompleteItem,
  Autocomplete,
  AutocompleteProps,
  Button,
} from "@nextui-org/react";
import { FieldInputProps } from "formik";
import { Key, useState } from "react";
import { FaSearch, FaTimes } from "react-icons/fa";

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
          "shadow-none hover:shadow-sm border-[0.5px] group-data-[focus=true]:border-light-text py-1 h-fit",
        value: "text-[0.8125rem]",
        label: "font-medium text-[0.8125rem]",
        innerWrapper: "h-fit",
      }}
      renderValue={(items) => {
        return (
          <div className="flex max-w-full gap-2 overflow-x-auto h-fit py-1">
            {items.map((item) => (
              <Chip color="default" size="sm" variant="bordered" key={item.key}>
                {item.data?.username}
              </Chip>
            ))}
          </div>
        );
      }}
      {...props}
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

export { SelectUsers };

interface SearchUsersProps extends Omit<AutocompleteProps<User>, "children"> {
  items: User[];
  onValueChange?: (value: string) => void;
  onSelectionChange: (key: Key | null) => void;
  showOnlyUsername?: boolean;
  label?: string;
}
const SearchUsers = (props: SearchUsersProps) => {
  const [isLoading, setIsLoading] = useState(false);
  const [selectedUsers, setSelectedUsers] = useState<
    {
      _id: string;
      username: string;
    }[]
  >([]);
  const nameToShow = (user: User) => {
    if (props.showOnlyUsername) {
      return user.username;
    }
    const { userType } = user;
    return userType === "Business"
      ? (user as UserBusiness).businessName
      : `${user.name} ${user.lastName}`;
  };
  const deleteUser = (id: string) => {
    setSelectedUsers((prev) => prev.filter((user) => user._id !== id));
  };

  return (
    <div className="flex flex-col gap-2">
      <div className="flex flex-wrap gap-2">
        {selectedUsers.map((item) => (
          <Chip
            as={Button}
            onPress={() => {
              props.onSelectionChange(item._id);
              deleteUser(item._id);
            }}
            startContent={<FaTimes className="text-gray-500" />}
            color="default"
            size="sm"
            variant="bordered"
            key={item._id}
          >
            {item.username}
          </Chip>
        ))}
      </div>
      <Autocomplete
        label="Invitar colaboradores"
        placeholder="Buscar y seleccionar usuarios"
        variant="bordered"
        radius="full"
        labelPlacement="outside"
        isLoading={isLoading}
        selectedKey={null}
        listboxProps={{
          emptyContent: "No se encontraron usuarios.",
        }}
        startContent={<FaSearch className="text-light-text" />}
        scrollShadowProps={{
          hideScrollBar: false,
        }}
        inputProps={{
          classNames: {
            inputWrapper:
              "shadow-none hover:shadow-sm border-[0.5px] group-data-[focus=true]:border-light-text",
            input: "text-[0.8125rem]",
            label: "font-medium text-[0.8125rem]",
          },
        }}
        {...props}
        onValueChange={
          props.onValueChange !== undefined
            ? (value) => {
                setIsLoading(true);
                try {
                  if (props.onValueChange) {
                    props.onValueChange(value);
                  }
                } catch (error) {
                  toastifyError("Error al buscar usuarios");
                } finally {
                  setIsLoading(false);
                }
              }
            : undefined
        }
        onSelectionChange={(key) => {
          if (!key) return;
          const user = props.items.find((u) => u._id === key);
          props.onSelectionChange(key);
          if (selectedUsers.some((user) => user._id === key)) {
            deleteUser(key as string);
            return;
          }
          setSelectedUsers((prev) => [
            ...prev,
            {
              _id: user?._id || "",
              username: user?.username || "",
            },
          ]);
        }}
      >
        {(user) => (
          <AutocompleteItem
            key={user._id}
            textValue={nameToShow(user)}
            value={user._id}
          >
            <div className="flex gap-2 items-center">
              <Avatar
                alt={props.showOnlyUsername ? user.username : user.name}
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
          </AutocompleteItem>
        )}
      </Autocomplete>
    </div>
  );
};

export { SearchUsers };
