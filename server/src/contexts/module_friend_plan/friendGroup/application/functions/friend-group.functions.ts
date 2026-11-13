import {
  friendPlanPricing,
  getFriendPlanDiscountTiers,
  getFriendPlanMaxMembers,
  getFriendPlanMinMembers,
} from 'src/contexts/module_shared/friend-plan/friend.plan.config';
import { FriendPlanTier } from '../../domain/graphql_models/friend-group.model.graphql';
import {
  FriendGroupMemberStatus,
  FriendGroupRecord,
  FriendGroupUserRef,
} from '../../domain/entity/friend-group.types';

export { generateGiftCode as generateInviteCode } from '../../../planGift/application/functions/plan-gift.functions';

export function displayName(user: FriendGroupUserRef | null | undefined): string | null {
  if (!user) return null;
  if (user.businessName) return user.businessName;
  const full = `${user.name ?? ''} ${user.lastName ?? ''}`.trim();
  return full || user.username || null;
}

/** Activación (decisión P): al menos un anuncio o una producción, en cualquier estado. */
export function isActivated(user: FriendGroupUserRef | null | undefined): boolean {
  return !!user && (user.postsCount > 0 || user.productionsCount > 0);
}

export function tierFor(planAmount: number, members: number): FriendPlanTier {
  return { members, ...friendPlanPricing(planAmount, members) };
}

/**
 * Tramos para mostrar: del mínimo de miembros al mayor tramo configurado (el
 * último vale "o más"). Si hay un máximo, no se pasa de ahí.
 */
export function tiersToShow(planAmount: number): FriendPlanTier[] {
  const min = getFriendPlanMinMembers();
  const max = getFriendPlanMaxMembers();
  const tierKeys = Object.keys(getFriendPlanDiscountTiers()).map(Number);
  let last = Math.max(min, ...tierKeys);
  if (max > 0) last = Math.min(last, max);
  const tiers: FriendPlanTier[] = [];
  for (let members = min; members <= last; members++) {
    tiers.push(tierFor(planAmount, members));
  }
  return tiers;
}

export const memberIds = (group: FriendGroupRecord, status?: FriendGroupMemberStatus) =>
  group.members
    .filter((member) => !status || member.status === status)
    .map((member) => String(member.user));

export const acceptedIds = (group: FriendGroupRecord) =>
  memberIds(group, FriendGroupMemberStatus.accepted);

export const memberOf = (group: FriendGroupRecord, userId: string) =>
  group.members.find((member) => String(member.user) === userId) ?? null;

/** True si ya no entra nadie más (sólo si hay un máximo configurado). */
export function isFull(group: FriendGroupRecord): boolean {
  const max = getFriendPlanMaxMembers();
  return max > 0 && group.members.length >= max;
}
