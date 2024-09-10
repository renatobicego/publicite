import { BadRequestException, Inject } from '@nestjs/common';
import { MyLoggerService } from 'src/contexts/shared/logger/logger.service';
import Invoice from 'src/contexts/webhook/domain/mercadopago/entity/invoice.entity';
import { MercadoPagoInvoiceRepositoryInterface } from 'src/contexts/webhook/domain/mercadopago/repository/mp-invoice.respository.interface';
import { MpServiceInvoiceInterface } from 'src/contexts/webhook/domain/mercadopago/service/mp-invoice.service.interface';
import { MpPaymentServiceInterface } from 'src/contexts/webhook/domain/mercadopago/service/mp-payments.service.interface';
import { SubscriptionServiceInterface } from 'src/contexts/webhook/domain/mercadopago/service/mp-subscription.service.interface';

export class MpInvoiceService implements MpServiceInvoiceInterface {
  constructor(
    private readonly logger: MyLoggerService,
    @Inject('MercadoPagoInvoiceRepositoryInterface')
    private readonly mpInvoiceRepository: MercadoPagoInvoiceRepositoryInterface,
    @Inject('SubscriptionServiceInterface')
    private readonly subscriptionService: SubscriptionServiceInterface,
    @Inject('MpPaymentServiceInterface')
    private readonly paymentService: MpPaymentServiceInterface,
  ) {}
  async saveInvoice(subscription_authorized_payment: any): Promise<void> {
    this.logger.log('---INVOICE SERVICE---');
    if (subscription_authorized_payment.status === 'scheduled') {
      this.logger.log(
        'Status: ' +
          subscription_authorized_payment.status +
          ' the invoice for subscription_authorized_payment ID: ' +
          subscription_authorized_payment.id +
          ' is not saved yet. Waiting for payment to be approved',
      );
      return Promise.resolve();
    }

    const subscripcion =
      await this.subscriptionService.findSubscriptionByPreapprovalId(
        subscription_authorized_payment.preapproval_id,
      );
    const payment = await this.paymentService.findPaymentByPaymentID(
      subscription_authorized_payment.payment.id,
    );

    if (!subscripcion || subscripcion === null) {
      this.logger.error(
        'Subscription not found. An error has ocurred with subscription_authorized_payment ID: ' +
          subscription_authorized_payment.id +
          '- Class:mpWebhookService',
      );
      throw new BadRequestException();
    }

    if (!payment || payment === null) {
      this.logger.error(
        'Payment not found. An error has ocurred with the payment ID: ' +
          subscription_authorized_payment.id +
          'preapproval ID:' +
          subscription_authorized_payment.preapproval_id +
          '- Class:mpWebhookService',
      );
      throw new BadRequestException();
    }

    if (
      subscription_authorized_payment != null ||
      subscription_authorized_payment != undefined
    ) {
      this.logger.log(
        'Status: ' +
          subscription_authorized_payment.status +
          ' Generate invoice to save',
      );
      const newInvoice = new Invoice(
        payment.getId(), //Payment ID de nuestro schema
        subscripcion.getId() ?? undefined, // Id de la suscripcion en nuestro schema
        subscription_authorized_payment.payment.status, //Payment status
        subscription_authorized_payment.preapproval_id, // ID de la suscripcion en MELI
        subscription_authorized_payment.external_reference,
      );
      await this.mpInvoiceRepository.saveInvoice(newInvoice);
    }
    return Promise.resolve();
  }
  async getInvoicesByExternalReference(
    external_reference: string,
  ): Promise<any[]> {
    try {
      const invoice =
        await this.mpInvoiceRepository.getInvoicesByExternalReference(
          external_reference,
        );
      return invoice;
    } catch (error: any) {
      throw error;
    }
  }
}
