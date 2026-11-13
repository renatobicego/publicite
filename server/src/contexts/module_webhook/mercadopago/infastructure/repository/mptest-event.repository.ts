import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';

import { MpTestEventDocument } from '../schemas/mptest-event.schema';

export interface MpTestEventInput {
  topic: string;
  action: string;
  dataId: string;
  mpObject: any;
}

export interface MpTestEventRepositoryInterface {
  save(event: MpTestEventInput): Promise<void>;
  list(limit: number): Promise<MpTestEventDocument[]>;
}

export class MpTestEventRepository implements MpTestEventRepositoryInterface {
  constructor(
    @InjectModel('MpTestEvent')
    private readonly model: Model<MpTestEventDocument>,
  ) {}

  async save({ topic, action, dataId, mpObject }: MpTestEventInput): Promise<void> {
    await this.model.create({
      topic,
      action,
      dataId,
      externalReference: mpObject?.external_reference,
      status: mpObject?.status ?? mpObject?.payment?.status,
      amount: mpObject?.transaction_amount ?? mpObject?.auto_recurring?.transaction_amount,
      payload: mpObject,
    });
  }

  async list(limit: number): Promise<MpTestEventDocument[]> {
    return this.model
      .find({})
      .sort({ receivedAt: -1 })
      .limit(Math.min(Math.max(limit, 1), 200))
      .lean();
  }
}
