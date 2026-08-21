"use client";

import { useState } from "react";
import { Button, Spinner } from "@nextui-org/react";
import { useUser } from "@clerk/nextjs";
import { FaPlus } from "react-icons/fa6";

import { Avatar } from "@/types/avatarTypes";
import { useAvatars } from "./AvatarsContext";
import AvatarCard from "./AvatarCard";
import CreateAvatarModal from "./CreateAvatarModal";
import EditAvatarModal from "./EditAvatarModal";

export default function AvatarsPanel() {
  const { user } = useUser();
  const { avatars, isLoading, remove } = useAvatars();

  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [avatarToEdit, setAvatarToEdit] = useState<Avatar | null>(null);

  if (!user) {
    return (
      <p className="text-sm text-default-500">
        Necesitás iniciar sesión para crear tus avatares.
      </p>
    );
  }

  return (
    <div className="w-full max-w-3xl mx-auto flex flex-col gap-4">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h2 className="text-lg font-semibold">Mis Avatares</h2>
          <p className="text-xs text-default-500 max-w-lg">
            Un avatar le da a Cubito un rol y un enfoque fijos. Elegilo antes de
            escribir y responde con ese contexto.
          </p>
        </div>
        <Button
          className="bg-service text-white shrink-0"
          radius="full"
          startContent={<FaPlus size={13} />}
          onPress={() => setIsCreateOpen(true)}
        >
          Crear Avatar
        </Button>
      </div>

      {isLoading && avatars.length === 0 ? (
        <div className="flex justify-center py-10">
          <Spinner />
        </div>
      ) : avatars.length === 0 ? (
        <p className="text-sm text-default-500 py-6">
          Todavía no creaste ningún avatar.
        </p>
      ) : (
        <div className="grid gap-3 sm:grid-cols-2">
          {avatars.map((avatar) => (
            <AvatarCard
              key={avatar._id}
              avatar={avatar}
              onEdit={setAvatarToEdit}
              onDelete={(toDelete) => remove(toDelete._id)}
            />
          ))}
        </div>
      )}

      <CreateAvatarModal
        isOpen={isCreateOpen}
        onClose={() => setIsCreateOpen(false)}
      />

      <EditAvatarModal
        avatar={avatarToEdit}
        isOpen={!!avatarToEdit}
        onClose={() => setAvatarToEdit(null)}
      />
    </div>
  );
}
