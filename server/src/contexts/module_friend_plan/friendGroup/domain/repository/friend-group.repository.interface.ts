import {
  FriendGroupMember,
  FriendGroupRecord,
  FriendGroupStatus,
  FriendGroupUserRef,
} from '../entity/friend-group.types';

export interface FriendGroupRepositoryInterface {
  create(group: Partial<FriendGroupRecord>): Promise<FriendGroupRecord>;
  findById(id: string): Promise<FriendGroupRecord | null>;
  findByInviteCode(code: string): Promise<FriendGroupRecord | null>;
  /** Grupo vivo (forming, paying, active, paymentFailed) donde el usuario está aceptado. */
  findLiveGroupOfMember(userId: string): Promise<FriendGroupRecord | null>;
  /** Grupos que se están armando y donde el usuario está invitado (sin aceptar). */
  findInvitationsOf(userId: string): Promise<FriendGroupRecord[]>;
  /** Actualiza sólo si el grupo está en alguno de esos estados (null si no). */
  updateIfStatus(
    id: string,
    statuses: FriendGroupStatus[],
    fields: Partial<FriendGroupRecord>,
  ): Promise<FriendGroupRecord | null>;
  update(id: string, fields: Partial<FriendGroupRecord>): Promise<FriendGroupRecord | null>;
  /** Suma un miembro si todavía no está y el grupo se está armando. */
  addMember(id: string, member: FriendGroupMember): Promise<FriendGroupRecord | null>;
  setMemberStatus(
    id: string,
    userId: string,
    status: string,
    joinedAt: Date,
  ): Promise<FriendGroupRecord | null>;
  removeMember(id: string, userId: string): Promise<FriendGroupRecord | null>;
  findUsersByIds(userIds: string[]): Promise<FriendGroupUserRef[]>;
  /** Ids de los anuncios activos del usuario. */
  findActivePostIds(userId: string): Promise<string[]>;
  /** De esos ids, los que hoy están inactivos. */
  findInactivePostIds(postIds: string[]): Promise<string[]>;
}
