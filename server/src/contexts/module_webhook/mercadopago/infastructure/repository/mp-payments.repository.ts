import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';



import { PaymentDocument } from '../schemas/payment.schema';
import { PaymentResponse } from 'src/contexts/module_webhook/mercadopago/application/adapter/HTTP-RESPONSE/payment.response';
import { MyLoggerService } from 'src/contexts/module_shared/logger/logger.service';
import Payment from 'src/contexts/module_webhook/mercadopago/domain/entity/payment.entity';
import { MercadoPagoPaymentsRepositoryInterface } from '../../domain/repository/mp-payments.repository.interface';


export class MercadoPagoPaymentsRepository
  implements MercadoPagoPaymentsRepositoryInterface {
  constructor(
    private readonly logger: MyLoggerService,
    @InjectModel('Payment')
    private readonly paymentModel: Model<PaymentDocument>,
  ) { }

  async createPayment(payment: Payment): Promise<void> {
    try {
      this.logger.log('Save payment: ' + payment.getMPPaymentId() + ' with status ' + payment.getStatus() + ' and description ' + payment.getDescriptionOfPayment() + ' for preapproval id ' + payment.getMPPreapprovalId());
      const newPayment = new this.paymentModel(payment);
      await newPayment.save();
    } catch (error: any) {
      throw error;
    }
  }

  async getPaymentByMongoId(id: any): Promise<PaymentResponse[]> {
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

  async findPaymentByPaymentID(id: any): Promise<any> {
    this.logger.log('Find payment by mpPaymentId ID: ' + id);
    return await this.paymentModel.findOne({ mpPaymentId: id }).lean();

  }

  // Fallback: cuando el invoice quedó con un paymentId placeholder (el payment
  // todavía no existía al crearse el invoice por orden de webhooks), buscamos el
  // payment real por sus referencias, del match más fuerte al más laxo.
  async findApprovedPaymentByReference(
    external_reference: string,
    preapprovalId: string,
    transactionAmount: number,
  ): Promise<any> {
    try {
      const base: any = { external_reference, status: 'approved' };

      let payment = await this.paymentModel
        .findOne({ ...base, mpPreapprovalId: preapprovalId, transactionAmount })
        .sort({ dateApproved: -1 })
        .lean();

      if (!payment) {
        payment = await this.paymentModel
          .findOne({ ...base, mpPreapprovalId: preapprovalId })
          .sort({ dateApproved: -1 })
          .lean();
      }

      if (!payment) {
        payment = await this.paymentModel
          .findOne(base)
          .sort({ dateApproved: -1 })
          .lean();
      }

      return payment;
    } catch (error: any) {
      throw error;
    }
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
