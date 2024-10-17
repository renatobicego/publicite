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
      // selectedKeys={props.value ? props.value : []}
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
  onValueChange: (value: string) => void;
  onSelectionChange: (key: Key | null) => void;
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
      <Autocomplete
        label="Invitar colaboradores"
        placeholder="Seleccionar usuarios"
        variant="bordered"
        radius="full"
        labelPlacement="outside"
        isLoading={isLoading}
        selectedKey={null}
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
        onValueChange={(value) => {
          setIsLoading(true);
          try {
            props.onValueChange(value);
          } catch (error) {
            toastifyError("Error al buscar usuarios");
          } finally {
            setIsLoading(false);
          }
        }}
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
          </AutocompleteItem>
        )}
      </Autocomplete>
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
    </div>
  );
};

export { SearchUsers };
