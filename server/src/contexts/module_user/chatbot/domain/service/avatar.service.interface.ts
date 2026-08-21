import { Avatar } from '../entity/avatar.entity';
import { CreateAvatarRequest } from '../../application/dto/HTTP-REQUEST/create.avatar.request';
import { UpdateAvatarRequest } from '../../application/dto/HTTP-REQUEST/update.avatar.request';

export interface AvatarServiceInterface {
  getUserAvatars(userId: string): Promise<Avatar[]>;
  createAvatar(userId: string, input: CreateAvatarRequest): Promise<Avatar>;
  updateAvatar(userId: string, input: UpdateAvatarRequest): Promise<Avatar>;
  deleteAvatar(userId: string, avatarId: string): Promise<boolean>;
  /** Contexto del avatar si existe y pertenece al usuario; si no, undefined. */
  resolveContextForUser(
    avatarId: string,
    userId?: string,
  ): Promise<string | undefined>;
}
