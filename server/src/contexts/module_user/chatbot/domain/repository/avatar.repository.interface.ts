import { Avatar } from '../entity/avatar.entity';

export interface AvatarRepositoryInterface {
  create(avatar: Avatar): Promise<Avatar>;
  findByUserId(userId: string): Promise<Avatar[]>;
  findById(avatarId: string): Promise<Avatar | null>;
  countByUserId(userId: string): Promise<number>;
  update(
    avatarId: string,
    changes: { name?: string; context?: string },
  ): Promise<Avatar | null>;
  delete(avatarId: string): Promise<boolean>;
}
