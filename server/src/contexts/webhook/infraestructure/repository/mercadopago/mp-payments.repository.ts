import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { MyLoggerService } from 'src/contexts/shared/logger/logger.service';
import Payment from 'src/contexts/webhook/domain/mercadopago/entity/payment.entity';
import { MercadoPagoPaymentsRepositoryInterface } from 'src/contexts/webhook/domain/mercadopago/repository/mp-payments.repository.interface';
import { PaymentDocument } from '../../schemas/mercadopago/payment.schema';

export class MercadoPagoPaymentsRepository
  implements MercadoPagoPaymentsRepositoryInterface
{
  constructor(
    private readonly logger: MyLoggerService,
    @InjectModel('Payment')
    private readonly paymentModel: Model<PaymentDocument>,
  ) {}
  async findPaymentByPaymentID(id: any): Promise<Payment | null> {
    this.logger.log('Find payment by payment ID: ' + id);
    const payment = await this.paymentModel.findOne({ mpPaymentId: id }).exec();
    return payment ? Payment.fromDocument(payment) : null;
  }

  async createPayment(payment: Payment): Promise<void> {
    this.logger.log('Save payment: ' + payment.getMPPaymentId());
    const newPayment = new this.paymentModel(payment);
    await newPayment.save();
  }
}
