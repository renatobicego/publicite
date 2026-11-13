"use client";

import { Autocomplete, AutocompleteItem, Avatar } from "@nextui-org/react";
import { Key, useEffect, useRef, useState } from "react";
import { FaSearch } from "react-icons/fa";

import { getUsers } from "@/services/userServices";
import { User, UserBusiness } from "@/types/userTypes";

export const userDisplayName = (user: Pick<User, "userType" | "name" | "lastName" | "username"> & { businessName?: string }) =>
  user.userType === "Business"
    ? (user as UserBusiness).businessName || user.username
    : `${user.name ?? ""} ${user.lastName ?? ""}`.trim() || user.username;

interface UserPickerProps {
  label: string;
  placeholder?: string;
  description?: string;
  /** Usuarios que no se ofrecen (por ejemplo, uno mismo o los que ya están). */
  excludeIds?: string[];
  onSelect: (user: User | null) => void;
  isDisabled?: boolean;
}

/*
Buscador de UN usuario con cuenta (por nombre o @usuario). Busca en el server
mientras se escribe, con una pequeña espera para no pedir en cada tecla.
*/
export default function UserPicker({
  label,
  placeholder = "Buscá por nombre o @usuario",
  description,
  excludeIds = [],
  onSelect,
  isDisabled,
}: UserPickerProps) {
  const [term, setTerm] = useState("");
  const [items, setItems] = useState<User[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    if (timer.current) clearTimeout(timer.current);
    const search = term.trim();
    if (search.length < 2) {
      setItems([]);
      return;
    }
    timer.current = setTimeout(async () => {
      setIsLoading(true);
      try {
        const result = await getUsers(search, 1);
        const users: User[] = (result?.items ?? []) as User[];
        setItems(users.filter((user) => !excludeIds.includes(user._id)));
      } finally {
        setIsLoading(false);
      }
    }, 350);
    return () => {
      if (timer.current) clearTimeout(timer.current);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [term]);

  const handleSelection = (key: Key | null) => {
    if (!key) {
      onSelect(null);
      return;
    }
    onSelect(items.find((user) => user._id === key) ?? null);
  };

  return (
    <Autocomplete
      label={label}
      placeholder={placeholder}
      description={description}
      labelPlacement="outside"
      variant="bordered"
      radius="full"
      items={items}
      isLoading={isLoading}
      isDisabled={isDisabled}
      inputValue={term}
      onInputChange={setTerm}
      onSelectionChange={handleSelection}
      startContent={<FaSearch className="text-light-text" />}
      listboxProps={{
        emptyContent:
          term.trim().length < 2
            ? "Escribí al menos 2 letras."
            : "No encontramos usuarios con ese nombre.",
      }}
      inputProps={{
        classNames: {
          inputWrapper:
            "shadow-none hover:shadow-sm border-[0.5px] group-data-[focus=true]:border-light-text",
          input: "text-[0.8125rem]",
          label: "font-medium text-[0.8125rem]",
        },
      }}
    >
      {(user) => (
        <AutocompleteItem key={user._id} textValue={userDisplayName(user)}>
          <div className="flex gap-2 items-center">
            <Avatar
              alt={user.username}
              className="flex-shrink-0"
              size="sm"
              src={user.profilePhotoUrl}
            />
            <div className="flex flex-col">
              <span className="text-small">{userDisplayName(user)}</span>
              <span className="text-tiny text-default-400">@{user.username}</span>
            </div>
          </div>
        </AutocompleteItem>
      )}
    </Autocomplete>
  );
}
