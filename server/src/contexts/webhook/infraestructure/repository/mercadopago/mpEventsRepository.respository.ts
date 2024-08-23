import { InjectModel } from '@nestjs/mongoose';

import { Model, ObjectId } from 'mongoose';
import { MyLoggerService } from 'src/contexts/shared/logger/logger.service';
import { SubscriptionDocument } from '../../schemas/mercadopago/subscription.schema';
import Invoice from 'src/contexts/webhook/domain/mercadopago/entity/invoice.entity';
import { InvoiceDocument } from '../../schemas/mercadopago/invoice.schema';
import MercadoPagoEventsRepositoryInterface from 'src/contexts/webhook/domain/mercadopago/repository/mpEvents.repository.interface';
import Subscription from 'src/contexts/webhook/domain/mercadopago/entity/subcription.entity';
import Payment from 'src/contexts/webhook/domain/mercadopago/entity/payment.entity';
import { PaymentDocument } from '../../schemas/mercadopago/payment.schema';
import { SubscriptionPlan } from 'src/contexts/webhook/domain/mercadopago/entity/subscriptionPlan.entity';

export default class MercadoPagoEventsRepository
  implements MercadoPagoEventsRepositoryInterface
{
  constructor(
    private readonly logger: MyLoggerService,
    @InjectModel('Subscription')
    private readonly subscriptionModel: Model<SubscriptionDocument>,
    @InjectModel('Invoice')
    private readonly invoiceModel: Model<InvoiceDocument>,
    @InjectModel('Payment')
    private readonly paymentModel: Model<PaymentDocument>,
    @InjectModel('SubscriptionPlan')
    private readonly subscriptionPlanModel: Model<SubscriptionDocument>,
  ) {}

  async findPaymentByPaymentID(id: any): Promise<Payment | null> {
    this.logger.log('Find payment by payment ID: ' + id);
    const payment = await this.paymentModel.findOne({ mpPaymentId: id }).exec();
    return payment ? Payment.fromDocument(payment) : null;
  }

  async findSubscriptionByPreapprovalId(
    id: string,
  ): Promise<Subscription | null> {
    this.logger.log('Find subscription by preapproval ID: ' + id);
    const subscription = await this.subscriptionModel.findOne({
      mpPreapprovalId: id,
    }); // mpPreapprovalId es el campo de ID de SUSCRIPCION de MELI
    return subscription ? Subscription.fromDocument(subscription) : null;
  }

  async findAllSubscriptions(): Promise<Subscription[]> {
    this.logger.log('Find all subscriptions');
    const subscriptions = await this.subscriptionModel.find().exec(); // Recupera todos los documentos
    console.log(subscriptions);
    return subscriptions.map((subscription) =>
      Subscription.fromDocument(subscription),
    );
  }

  async findSubscriptionPlanByMeliID(
    id: string,
  ): Promise<SubscriptionPlan | null> {
    this.logger.log('Find subscription plan by Meli ID: ' + id);
    const subscriptionPlanDocument = await this.subscriptionPlanModel
      .findOne({ mpPreapprovalPlanId: id })
      .exec();
    return subscriptionPlanDocument
      ? SubscriptionPlan.fromDocument(subscriptionPlanDocument)
      : null;
  }

  async findByPayerIdAndSubscriptionPlanID(
    payerId: string,
    subscriptionPlan: ObjectId,
  ): Promise<Subscription | null> {
    this.logger.log(
      `Finding subscription by payerId: ${payerId} and subscriptionPlanid: ${subscriptionPlan}`,
    );
    const userSubscription = await this.subscriptionModel.findOne({
      payerId,
      subscriptionPlan: subscriptionPlan,
    });
    return userSubscription
      ? Subscription.fromDocument(userSubscription)
      : null;
  }

  async createPayment(payment: Payment): Promise<void> {
    this.logger.log('Save payment: ' + payment.getMPPaymentId());
    const newPayment = new this.paymentModel(payment);
    await newPayment.save();
  }

  async saveSubPreapproval(sub: Subscription): Promise<void> {
    this.logger.log(
      'saving new subscription in database SUB_ID: ' + sub.getMpPreapprovalId(),
    );
    const newSubscription = new this.subscriptionModel(sub);
    await newSubscription.save();
  }

  async saveInvoice(invoice: Invoice): Promise<void> {
    this.logger.log(
      'saving new Invoice in database Invoice ID: ' + invoice.getPaymentId(),
    );
    const newInvoice = new this.invoiceModel(invoice);
    await newInvoice.save();
    this.logger.log(
      'the invoice payment ID: ' +
        newInvoice.paymentId +
        ' has been related to subscription ID: ' +
        newInvoice.subscriptionId,
    );
  }

  async updateUserSubscription(
    payerId: string,
    sub: Subscription,
  ): Promise<void> {
    this.logger.log('Update subscription of payerID: ' + payerId);
    const subcriptionPlanId = sub.getSubscriptionPlan();
    const updateFields = { ...sub };

    // Realiza la actualización
    await this.subscriptionModel.findOneAndReplace(
      { payerId: payerId },
      { subscriptionPlan: subcriptionPlanId },
      { $set: updateFields },
    );
  }
}
