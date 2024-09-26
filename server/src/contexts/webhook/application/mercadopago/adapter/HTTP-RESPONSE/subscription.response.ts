import { ApiProperty } from '@nestjs/swagger';
import { ObjectId, Types } from 'mongoose';
import { SubscriptionPlan } from 'src/contexts/webhook/domain/mercadopago/entity/subscriptionPlan.entity';

export class SubscriptionResponse {
  @ApiProperty({
    description: 'The unique identifier for Subscription in mongo',
    type: Types.ObjectId,
  })
  readonly _id: ObjectId | null;

  @ApiProperty({
    description: 'The unique identifier for the preapproval',
    type: String,
  })
  readonly mpPreapprovalId: string;

  @ApiProperty({
    description: 'The payer ID associated with the subscription',
    type: String,
  })
  readonly payerId: string;

  @ApiProperty({
    description: 'The status of the subscription',
    type: String,
  })
  readonly status: string;

  @ApiProperty({
    description: 'Subscription Plan',
    type: SubscriptionPlan,
  })
  readonly subscriptionPlan: SubscriptionPlan;

  @ApiProperty({
    description: 'The start date of the subscription',
    type: String,
    format: 'date-time',
  })
  readonly startDate: string;

  @ApiProperty({
    description: 'The end date of the subscription',
    type: String,
    format: 'date-time',
  })
  readonly endDate: string;

  @ApiProperty({
    description: 'The external reference identifier',
    type: String,
  })
  readonly external_reference: string;
  @ApiProperty({
    description: 'The day of the update',
    type: String,
  })
  readonly timeOfUpdate: string;

  constructor(
    _id: ObjectId | null,
    mpPreapprovalId: string,
    payerId: string,
    status: string,
    subscriptionPlan: SubscriptionPlan,
    startDate: string,
    endDate: string,
    external_reference: string,
    timeOfUpdate: string,
  ) {
    this._id = _id;
    this.mpPreapprovalId = mpPreapprovalId;
    this.payerId = payerId;
    this.status = status;
    this.subscriptionPlan = subscriptionPlan;
    this.startDate = startDate;
    this.endDate = endDate;
    this.external_reference = external_reference;
    this.timeOfUpdate = timeOfUpdate;
  }
}
