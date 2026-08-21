/** Personaje de IA creado por el usuario para personalizar a Cubito. */
export interface Avatar {
  _id: string;
  userId: string;
  name: string;
  context: string;
  /** Semilla determinística de la imagen (Blobatar). Es el _id del avatar. */
  seed: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface CreateAvatarInput {
  name: string;
  context: string;
}

export interface UpdateAvatarInput {
  avatarId: string;
  name?: string;
  context?: string;
}

export const AVATAR_NAME_MAX_LENGTH = 60;
export const AVATAR_CONTEXT_MAX_LENGTH = 1000;
