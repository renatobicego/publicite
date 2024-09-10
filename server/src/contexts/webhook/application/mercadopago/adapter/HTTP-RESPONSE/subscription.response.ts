import { ApiProperty } from '@nestjs/swagger';
import { Types } from 'mongoose';

export class SubscriptionResponse {
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
    description: 'The ID of the subscription plan',
    type: String,
  })
  readonly subscriptionPlan: Types.ObjectId;

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

  constructor(
    mpPreapprovalId: string,
    payerId: string,
    status: string,
    subscriptionPlan: Types.ObjectId,
    startDate: string,
    endDate: string,
    external_reference: string,
  ) {
    this.mpPreapprovalId = mpPreapprovalId;
    this.payerId = payerId;
    this.status = status;
    this.subscriptionPlan = subscriptionPlan;
    this.startDate = startDate;
    this.endDate = endDate;
    this.external_reference = external_reference;
  }
}
