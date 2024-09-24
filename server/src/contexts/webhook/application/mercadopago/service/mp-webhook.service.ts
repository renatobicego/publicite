import {
  BadRequestException,
  Inject,
  Injectable,
  InternalServerErrorException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

import { MyLoggerService } from 'src/contexts/shared/logger/logger.service';
import { MpWebhookServiceInterface } from 'src/contexts/webhook/domain/mercadopago/service/mp-webhook.service.interface';
import { MpServiceInvoiceInterface } from 'src/contexts/webhook/domain/mercadopago/service/mp-invoice.service.interface';
import { MpPaymentServiceInterface } from 'src/contexts/webhook/domain/mercadopago/service/mp-payments.service.interface';
import { SubscriptionServiceInterface } from 'src/contexts/webhook/domain/mercadopago/service/mp-subscription.service.interface';

/*
Capa de servicio: Capa de servicio de webHook, se encarga de comunicar el webHook con los distintos 
servicios de nuestra app para manejar las suscripciones (invoice, suscription, payment). Cada servicio posee su propia logica, esta capa actua como guia para cada una

*/

@Injectable()
export class MpWebhookService implements MpWebhookServiceInterface {
  constructor(
    private readonly logger: MyLoggerService,
    private readonly configService: ConfigService,

    @Inject('MpServiceInvoiceInterface')
    private readonly MpInvoiceService: MpServiceInvoiceInterface,
    @Inject('MpPaymentServiceInterface')
    private readonly mpPaymentService: MpPaymentServiceInterface,
    @Inject('SubscriptionServiceInterface')
    private readonly subscriptionService: SubscriptionServiceInterface,
  ) {}

  private readonly MP_ACCESS_TOKEN =
    this.configService.get<string>('MP_ACCESS_TOKEN');

  async create_payment(payment: any): Promise<void> {
    try {
      await this.mpPaymentService.createPayment(payment);
      return Promise.resolve();
    } catch (error) {
      this.logger.error(
        'An error has ocurred while creating payment for suscription description: ' +
          payment.description,
      );
      this.logger.error(
        'An error has ocurred while creating payment ID: ' + payment.id,
      );
      throw error;
    }
  }
  async updatePayment(payment: any): Promise<void> {
    try {
      await this.mpPaymentService.updatePayment(payment);
      return Promise.resolve();
    } catch (error) {
      this.logger.error(
        'An error has ocurred while updating payment for suscription description: ' +
          payment.description,
      );
      this.logger.error(
        'An error has ocurred while updating payment ID: ' + payment.id,
      );
      throw error;
    }
  }
  // CREAMOS la subscripcion del usuario
  async subscription_preapproval_create(
    subscription_preapproval: any,
  ): Promise<void> {
    try {
      await this.subscriptionService.createSubscription_preapproval(
        subscription_preapproval,
      );
    } catch (error) {
      this.logger.error(
        'Error in createSubscription_preapproval - Class: mpWebhookService',
        error,
      );
      throw error;
    }
  }

  // ACTUALIZAMOS la subscripcion del usuario
  async subscription_preapproval_update(
    subscription_preapproval_update: any,
  ): Promise<void> {
    try {
      await this.subscriptionService.updateSubscription_preapproval(
        subscription_preapproval_update,
      );
    } catch (error: any) {
      throw error;
    }
  }

  // Generamos la factura del usuario
  async subscription_authorize_payment_create(
    subscription_authorized_payment: any,
  ): Promise<void> {
    this.logger.log(
      'createSubscription_authorize_payment - Class:mpWebhookService',
    );

    try {
      await this.MpInvoiceService.saveInvoice(subscription_authorized_payment);
    } catch (error: any) {
      this.logger.error(
        'Error createSubscription_authorize_payment - Class:mpWebhookService',
        error,
      );
      throw new InternalServerErrorException(error);
    }
  }

  async subscription_authorize_payment_update(
    subscription_authorized_payment: any,
  ): Promise<void> {
    this.logger.log(
      'createSubscription_authorize_payment - Class:mpWebhookService',
    );
    try {
      const id = subscription_authorized_payment.preapproval_id;
      await this.MpInvoiceService.updateInvoice(
        subscription_authorized_payment,
        id,
      );
    } catch (error: any) {
      this.logger.error(
        'Error createSubscription_authorize_payment - Class:mpWebhookService',
        error,
      );
      throw new InternalServerErrorException(error);
    }
  }

  async fetchData(url: string): Promise<any> {
    this.logger.log('Fetching data to Mercadopago: ' + url);
    const response = await fetch(url, {
      method: 'GET',
      headers: {
        Authorization: `Bearer ${this.MP_ACCESS_TOKEN}`,
      },
    });
    if (response.status !== 200) {
      this.logger.error(`Error fetching data: ${response.status}`);
      console.log(response);
      throw new BadRequestException('Error fetching data');
    }
    const response_result = await response.json();
    return response_result;
  }

  async fetchPauseSuscription(
    url: string,
    preapproval_id: string,
  ): Promise<any> {
    try {
      const response = await fetch(url + '/' + preapproval_id, {
        method: 'PUT',
        headers: {
          Authorization: `Bearer ${this.MP_ACCESS_TOKEN}`,
        },
        body: JSON.stringify({
          status: 'paused',
        }),
      });

      if (!response.ok) {
        throw new Error(`Error en la solicitud: ${response.statusText}`);
      }

      const data = await response.json();
      await this.subscription_preapproval_update(data);
    } catch (error) {
      console.error('Error al actualizar la suscripción:', error);
      throw error;
    }
  }
}
