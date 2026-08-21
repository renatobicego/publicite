"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import { useUser } from "@clerk/nextjs";

import {
  createAvatar as createAvatarService,
  deleteAvatar as deleteAvatarService,
  getUserAvatars,
  updateAvatar as updateAvatarService,
} from "@/services/avatarServices";
import { Avatar, CreateAvatarInput, UpdateAvatarInput } from "@/types/avatarTypes";
import { toastifyError, toastifySuccess } from "@/utils/functions/toastify";

interface AvatarsContextValue {
  avatars: Avatar[];
  isLoading: boolean;
  reload: () => Promise<void>;
  create: (input: CreateAvatarInput) => Promise<boolean>;
  update: (input: UpdateAvatarInput) => Promise<boolean>;
  remove: (avatarId: string) => Promise<boolean>;
}

const AvatarsContext = createContext<AvatarsContextValue | null>(null);

/**
 * Lista de avatares compartida entre el panel (tab "Avatares") y el selector
 * del chat: crear un avatar en el panel lo deja disponible en el chat sin
 * recargar la página.
 */
export function AvatarsProvider({ children }: { children: React.ReactNode }) {
  const { user, isLoaded } = useUser();
  const [avatars, setAvatars] = useState<Avatar[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const reload = useCallback(async () => {
    if (!user) {
      setAvatars([]);
      return;
    }
    setIsLoading(true);
    const res = await getUserAvatars();
    setIsLoading(false);

    if ("error" in res) {
      toastifyError(res.error);
      return;
    }
    setAvatars(res);
  }, [user]);

  useEffect(() => {
    if (isLoaded) reload();
  }, [isLoaded, reload]);

  const create = useCallback(async (input: CreateAvatarInput) => {
    const res = await createAvatarService(input);
    if ("error" in res) {
      toastifyError(res.error);
      return false;
    }
    setAvatars((prev) => [...prev, res]);
    toastifySuccess("Avatar creado");
    return true;
  }, []);

  const update = useCallback(async (input: UpdateAvatarInput) => {
    const res = await updateAvatarService(input);
    if ("error" in res) {
      toastifyError(res.error);
      return false;
    }
    setAvatars((prev) =>
      prev.map((avatar) => (avatar._id === res._id ? res : avatar))
    );
    toastifySuccess("Avatar actualizado");
    return true;
  }, []);

  const remove = useCallback(async (avatarId: string) => {
    const res = await deleteAvatarService(avatarId);
    if (typeof res !== "boolean") {
      toastifyError(res.error);
      return false;
    }
    setAvatars((prev) => prev.filter((avatar) => avatar._id !== avatarId));
    toastifySuccess("Avatar eliminado");
    return true;
  }, []);

  const value = useMemo(
    () => ({ avatars, isLoading, reload, create, update, remove }),
    [avatars, isLoading, reload, create, update, remove]
  );

  return (
    <AvatarsContext.Provider value={value}>{children}</AvatarsContext.Provider>
  );
}

export function useAvatars(): AvatarsContextValue {
  const context = useContext(AvatarsContext);
  if (!context) {
    throw new Error("useAvatars debe usarse dentro de <AvatarsProvider>");
  }
  return context;
}
