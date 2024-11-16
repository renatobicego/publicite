import { ApiProperty } from '@nestjs/swagger';
import { ObjectId, Types } from 'mongoose';

export class SubscriptionPlanResponse {
  @ApiProperty({
    description: 'The unique identifier for the subscription',
    type: Types.ObjectId,
    example: '66c49508e80296e90ec637d8',
  })
  readonly _id: ObjectId;

  @ApiProperty({
    description: 'Id of the subscription plan in Mercado Pago',
    type: String,
    example: '2c9380849174c2ec019176e4107c00fd',
  })
  readonly mpPreapprovalPlanId: string;

  @ApiProperty({
    description: 'Describe if this plan is active or not',
    type: String,
    example: 'true',
  })
  readonly isActive: boolean;

  @ApiProperty({
    description: 'Name of the plan',
    type: String,
    example: 'Basic',
  })
  readonly reason: string;

  @ApiProperty({
    description: 'Details of the plan',
    type: String,
    example: 'In this plan you will have 10 ads',
  })
  readonly description: string;

  @ApiProperty({
    description: 'An array of features of the plan',
    type: [String],
    example: ['10 ads', 'premium ads'],
  })
  readonly features: string[];

  @ApiProperty({
    description: 'Interval time of the plan',
    type: Number,
    example: 30,
  })
  readonly intervalTime: number;

  @ApiProperty({
    description: 'Price of the plan',
    type: Number,
    example: 15000,
  })
  readonly price: number;

  @ApiProperty({
    description: 'Limit of posts of the plan',
    type: Number,
    example: 50,
  })
  readonly postLimit: number;

  constructor(
    _id: ObjectId,
    mpPreapprovalPlanId: string,
    isActive: boolean,
    reason: string,
    description: string,
    features: string[],
    intervalTime: number,
    price: number,
    postLimit: number,
  ) {
    this._id = _id;
    this.mpPreapprovalPlanId = mpPreapprovalPlanId;
    this.isActive = isActive;
    this.reason = reason;
    this.description = description;
    this.features = features;
    this.intervalTime = intervalTime;
    this.price = price;
    this.postLimit = postLimit;
  }
}
