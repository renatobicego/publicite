import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { MyLoggerService } from 'src/contexts/shared/logger/logger.service';
import Payment from 'src/contexts/webhook/domain/mercadopago/entity/payment.entity';
import { MercadoPagoPaymentsRepositoryInterface } from 'src/contexts/webhook/domain/mercadopago/repository/mp-payments.repository.interface';
import { PaymentDocument } from '../../schemas/mercadopago/payment.schema';
import { PaymentResponse } from 'src/contexts/webhook/application/mercadopago/adapter/HTTP-RESPONSE/payment.response';

export class MercadoPagoPaymentsRepository
  implements MercadoPagoPaymentsRepositoryInterface
{
  constructor(
    private readonly logger: MyLoggerService,
    @InjectModel('Payment')
    private readonly paymentModel: Model<PaymentDocument>,
  ) {}

  async createPayment(payment: Payment): Promise<void> {
    this.logger.log('Save payment: ' + payment.getMPPaymentId());
    const newPayment = new this.paymentModel(payment);
    await newPayment.save();
  }

  async findPaymentByClerkId(id: any): Promise<PaymentResponse[]> {
    try {
      const payments = await this.paymentModel
        .find({ external_reference: id })
        .lean();
      return payments.map((payment) => {
        return new PaymentResponse(payment);
      });
    } catch (error: any) {
      throw error;
    }
  }

  async findPaymentByPaymentID(id: any): Promise<Payment | null> {
    this.logger.log('Find payment by mpPaymentId ID: ' + id);
    const payment = await this.paymentModel.findOne({ mpPaymentId: id }).exec();
    return payment ? Payment.fromDocument(payment) : null;
  }

  async updatePayment(paymentToUpdate: any, id: any): Promise<void> {
    try {
      this.logger.log('Update payment: ' + id);

      await this.paymentModel.findOneAndUpdate(
        { mpPaymentId: id },
        paymentToUpdate,
      );

      this.logger.log('Payment updated with status: ' + paymentToUpdate.status);
    } catch (error) {
      this.logger.error(
        'An error has ocurred while updating mpPaymentId : ' + id,
      );
    }
  }
}
