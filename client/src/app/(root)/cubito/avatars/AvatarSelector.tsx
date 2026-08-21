"use client";

import { Select, SelectItem } from "@nextui-org/react";

import { useAvatars } from "./AvatarsContext";
import AvatarImage from "./AvatarImage";

interface AvatarSelectorProps {
  selectedAvatarId: string | null;
  onSelect: (avatarId: string | null) => void;
  isDisabled?: boolean;
}

const NO_AVATAR_KEY = "none";

/** Elige el avatar activo de la conversación. Sin avatar = Cubito general. */
export default function AvatarSelector({
  selectedAvatarId,
  onSelect,
  isDisabled,
}: AvatarSelectorProps) {
  const { avatars } = useAvatars();

  if (avatars.length === 0) return null;

  const options = [
    { _id: NO_AVATAR_KEY, name: "Sin avatar (Cubito general)", seed: "cubito" },
    ...avatars,
  ];

  return (
    <Select
      size="sm"
      variant="flat"
      aria-label="Avatar activo"
      className="max-w-[15rem]"
      selectedKeys={[selectedAvatarId ?? NO_AVATAR_KEY]}
      onChange={(e) =>
        onSelect(e.target.value === NO_AVATAR_KEY ? null : e.target.value)
      }
      isDisabled={isDisabled}
      classNames={{ trigger: "h-9 min-h-9", value: "text-xs" }}
      renderValue={(items) =>
        items.map((item) => {
          const option = options.find((o) => o._id === item.key);
          if (!option) return null;
          return (
            <div key={item.key} className="flex items-center gap-2">
              <AvatarImage seed={option.seed || option._id} size={18} />
              <span className="truncate">{option.name}</span>
            </div>
          );
        })
      }
    >
      {options.map((option) => (
        <SelectItem
          key={option._id}
          value={option._id}
          textValue={option.name}
          startContent={
            <AvatarImage seed={option.seed || option._id} size={20} />
          }
        >
          {option.name}
        </SelectItem>
      ))}
    </Select>
  );
}
