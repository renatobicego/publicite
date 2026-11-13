import { PlanGiftRecord, PlanGiftStatus, PlanGiftUserRef } from '../entity/plan-gift.types';

export interface PlanGiftRepositoryInterface {
  create(gift: Partial<PlanGiftRecord>): Promise<PlanGiftRecord>;
  findById(id: string): Promise<PlanGiftRecord | null>;
  findByCode(code: string): Promise<PlanGiftRecord | null>;
  update(id: string, fields: Partial<PlanGiftRecord>): Promise<PlanGiftRecord | null>;
  /** Regalos hechos a un email que todavía no tienen cuenta asignada. */
  findUnassignedByEmail(email: string, statuses: PlanGiftStatus[]): Promise<PlanGiftRecord[]>;
  findByGiver(userId: string): Promise<PlanGiftRecord[]>;
  findByRecipient(userId: string): Promise<PlanGiftRecord[]>;
  findAllPaginated(page: number, limit: number): Promise<{ gifts: PlanGiftRecord[]; hasMore: boolean }>;
  findUserById(userId: string): Promise<PlanGiftUserRef | null>;
  findUserByEmail(email: string): Promise<PlanGiftUserRef | null>;
  findUsersByIds(userIds: string[]): Promise<PlanGiftUserRef[]>;
}
