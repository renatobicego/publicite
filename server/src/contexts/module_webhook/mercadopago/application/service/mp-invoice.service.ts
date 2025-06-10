import { BadRequestException, Inject } from '@nestjs/common';
import mongoose from 'mongoose';

import { MyLoggerService } from 'src/contexts/module_shared/logger/logger.service';
import Invoice from 'src/contexts/module_webhook/mercadopago/domain/entity/invoice.entity';
import { MpServiceInvoiceInterface } from 'src/contexts/module_webhook/mercadopago/domain/service/mp-invoice.service.interface';
import { MpPaymentServiceInterface } from 'src/contexts/module_webhook/mercadopago/domain/service/mp-payments.service.interface';
import { SubscriptionServiceInterface } from 'src/contexts/module_webhook/mercadopago/domain/service/mp-subscription.service.interface';
import { MercadoPagoInvoiceRepositoryInterface } from '../../domain/repository/mp-invoice.respository.interface';
import { getTodayDateTime } from 'src/contexts/module_shared/utils/functions/getTodayDateTime';
import { authorized_payments } from '../../domain/entity_mp/authorized_payments';

export class MpInvoiceService implements MpServiceInvoiceInterface {

  constructor(
    private readonly logger: MyLoggerService,
    @Inject('MercadoPagoInvoiceRepositoryInterface')
    private readonly mpInvoiceRepository: MercadoPagoInvoiceRepositoryInterface,
    @Inject('SubscriptionServiceInterface')
    private readonly subscriptionService: SubscriptionServiceInterface,
    @Inject('MpPaymentServiceInterface')
    private readonly paymentService: MpPaymentServiceInterface,
  ) { }

  async updateInvoice(
    subscription_authorized_payment_to_update: any,
    id: string,
  ): Promise<any> {
    this.logger.log('---INVOICE SERVICE UPDATE ---');

    const timeOfUpdate = getTodayDateTime();

    try {
      // Crear el objeto subsToUpdate sin incluir paymentId inicialmente
      const subsToUpdate: any = {
        status: subscription_authorized_payment_to_update.status ?? '',
        paymentStatus: subscription_authorized_payment_to_update.payment.status ?? '',
        timeOfUpdate: timeOfUpdate,
        retryAttempts: subscription_authorized_payment_to_update.retry_attempt ?? undefined,
        nextRetryDay: subscription_authorized_payment_to_update.next_retry_date ?? undefined,
        rejectionCode: subscription_authorized_payment_to_update.rejection_code ?? undefined,
      };

      // Solo agregar paymentId si existe en el objeto
      if (subscription_authorized_payment_to_update?.payment?.id) {
        const payment = await this.paymentService.findPaymentByPaymentID(
          subscription_authorized_payment_to_update?.payment?.id,
        );
        subsToUpdate.paymentId = payment?._id;
      }

      // Log para verificar el estado y otros datos antes de la actualización
      this.logger.log('Updating invoice with status: ' + subsToUpdate.status);

      // Llamada al repositorio para actualizar la factura
      return await this.mpInvoiceRepository.updateInvoice(subsToUpdate, id);
    } catch (error: any) {
      this.logger.error('Error updating invoice:', error);
      throw error;
    }
  }


  async saveInvoice(subscription_authorized_payment: authorized_payments): Promise<{ payment: any, subscription: any, paymentReady: boolean } | null> {
    this.logger.log('---INVOICE SERVICE CREATE ---');
    let paymetnId;
    console.log(subscription_authorized_payment.preapproval_id)
    const subscripcion =
      await this.subscriptionService.findSubscriptionByPreapprovalId(
        subscription_authorized_payment.preapproval_id,
      );
    if (!subscripcion || subscripcion === null) {
      this.logger.error(
        'Subscription not found. An error has ocurred with subscription_authorized_payment ID: ' +
        subscription_authorized_payment.id +
        '- Class:mpWebhookService',
      );
      throw new BadRequestException();
    }
    const payment = await this.paymentService.findPaymentByPaymentID(
      subscription_authorized_payment.payment.id,
    );

    if (!payment) {
      paymetnId = this.generateCustomObjectId('0001abcd');
    } else {
      paymetnId = payment._id
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
      const timeOfUpdate = getTodayDateTime();
      const newInvoice = new Invoice(
        paymetnId as any,
        subscripcion._id ?? undefined, // Id de la suscripcion en nuestro schema
        subscription_authorized_payment.status ?? 'invoice scheduled',
        subscription_authorized_payment.payment.status ?? 'payment scheduled', //Payment status
        subscription_authorized_payment.preapproval_id, // ID de la suscripcion en MELI
        subscription_authorized_payment.external_reference,
        timeOfUpdate,
        subscription_authorized_payment.id, // ID de la factura en meli
        subscription_authorized_payment.transaction_amount ?? 0,
        subscription_authorized_payment.currency_id ?? 'ARS',
        subscription_authorized_payment.reason ?? 'No data, please check',
        subscription_authorized_payment.next_retry_date ?? 'No data, please check',
        subscription_authorized_payment.retry_attempt ?? 0,
        subscription_authorized_payment.rejection_code ?? 'No data, please check',

      );
      await this.mpInvoiceRepository.saveInvoice(newInvoice);
    }

    if (payment && subscripcion) {
      return Promise.resolve({
        payment: payment,
        subscription: subscripcion,
        paymentReady: !!payment,
      });
    } else {
      return Promise.resolve(null)
    }

  }


  generateCustomObjectId(customValue: string): mongoose.Types.ObjectId {
    // Asegúrate de que el customValue tenga solo caracteres hexadecimales y longitud de 8
    const hexCustomValue = customValue
      .replace(/[^a-fA-F0-9]/g, '')
      .padStart(8, '0')
      .slice(0, 8);

    // Crear un ObjectId válido
    const objectId = new mongoose.Types.ObjectId();
    const restOfObjectId = objectId.toHexString().slice(8, 24);

    // Concatenar la parte personalizada con el resto del ObjectId
    const customObjectIdHex = hexCustomValue + restOfObjectId;

    // Convertir el valor concatenado en un ObjectId válido
    return new mongoose.Types.ObjectId(customObjectIdHex);
  }


  async getInvoicesByExternalReferenceId(id: string, page: number, limit: number): Promise<any> {
    try {
      page = page <= 0 ? 1 : page;
      limit = limit <= 0 ? 10 : limit;
      const invoice =
        await this.mpInvoiceRepository.getInvoicesByExternalReferenceId(
          id, page, limit
        );
      return invoice;
    } catch (error: any) {
      throw error;
    }
  }
}
