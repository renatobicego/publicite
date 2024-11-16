import { ObjectId } from 'mongoose';
import Subscription from '../../../mercadopago/domain/entity/subcription.entity';

export default interface MercadoPagoEventsRepositoryInterface {
  findStatusOfUserSubscription(
    payerId: string,
    subscriptionPlanID: ObjectId,
    external_reference: string,
  ): Promise<Subscription | null>;

  findAllSubscriptions(): Promise<Subscription[]>;
}
