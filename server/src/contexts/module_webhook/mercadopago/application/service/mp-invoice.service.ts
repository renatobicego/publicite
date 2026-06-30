import {
  BadRequestException,
  ForbiddenException,
  Inject,
  NotFoundException,
} from '@nestjs/common';
import mongoose from 'mongoose';
import PDFDocument = require('pdfkit');

import { MyLoggerService } from 'src/contexts/module_shared/logger/logger.service';
import Invoice from 'src/contexts/module_webhook/mercadopago/domain/entity/invoice.entity';
import { MpServiceInvoiceInterface } from 'src/contexts/module_webhook/mercadopago/domain/service/mp-invoice.service.interface';
import { MpPaymentServiceInterface } from 'src/contexts/module_webhook/mercadopago/domain/service/mp-payments.service.interface';
import { SubscriptionServiceInterface } from 'src/contexts/module_webhook/mercadopago/domain/service/mp-subscription.service.interface';
import { MercadoPagoInvoiceRepositoryInterface } from '../../domain/repository/mp-invoice.respository.interface';
import { getTodayDateTime } from 'src/contexts/module_shared/utils/functions/getTodayDateTime';
import { authorized_payments } from '../../domain/entity_mp/authorized_payments';
import { PUBLICITE_LOGO_BASE64 } from './assets/publicite-logo';

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

  async generateInvoiceTicket(
    invoiceId: string,
    userRequestId: string,
  ): Promise<Buffer> {
    this.logger.log('---INVOICE SERVICE GENERATE TICKET ---');

    if (!mongoose.Types.ObjectId.isValid(invoiceId)) {
      throw new BadRequestException('invoiceId inválido');
    }

    // 1. Buscar invoice con paymentId y subscriptionId.subscriptionPlan populados
    const invoice =
      await this.mpInvoiceRepository.getInvoiceByIdForTicket(invoiceId);

    // 2. Validar que existe
    if (!invoice) {
      throw new NotFoundException('Invoice no encontrado');
    }

    // 3. Validar ownership (external_reference === userRequestId)
    if (invoice.external_reference !== userRequestId) {
      throw new ForbiddenException('No tienes acceso a este comprobante');
    }

    // 4. Validar que el pago está aprobado
    if (invoice.paymentStatus !== 'approved') {
      throw new BadRequestException(
        'Solo se pueden generar tickets de pagos aprobados',
      );
    }

    // 5. Resolver el payment. Si el invoice quedó con un paymentId placeholder
    // (el payment no existía al crearse el invoice por orden de webhooks), el
    // populate devuelve null: buscamos el payment real por sus referencias.
    let payment = invoice.paymentId;
    if (!payment) {
      this.logger.warn(
        `Invoice ${invoiceId} sin payment vinculado, buscando por referencias`,
      );
      payment = await this.paymentService.findApprovedPaymentByReference(
        invoice.external_reference,
        invoice.preapprovalId,
        invoice.transactionAmount,
      );
    }

    // 6. Generar PDF
    return this.generatePdf(invoice, payment);
  }

  private generatePdf(invoice: any, paymentData: any): Promise<Buffer> {
    const payment = paymentData ?? {};
    const subscription = invoice.subscriptionId ?? {};

    return new Promise<Buffer>((resolve, reject) => {
      try {
        const doc = new PDFDocument({ size: 'A4', margin: 50 });
        const chunks: Buffer[] = [];

        doc.on('data', (chunk: Buffer) => chunks.push(chunk));
        doc.on('end', () => resolve(Buffer.concat(chunks)));
        doc.on('error', (err: any) => reject(err));

        // ----- Logo / branding -----
        try {
          const logoBuffer = Buffer.from(PUBLICITE_LOGO_BASE64, 'base64');
          const logoWidth = 110;
          const logoHeight = (logoWidth * 193) / 303; // proporción original 303x193
          const logoX = (doc.page.width - logoWidth) / 2;
          doc.image(logoBuffer, logoX, doc.y, { width: logoWidth });
          doc.y = doc.y + logoHeight + 14;
        } catch (logoError) {
          // Si el logo falla por cualquier motivo, generamos el comprobante igual (sin branding).
          this.logger.warn('No se pudo dibujar el logo en el comprobante');
        }

        // ----- Encabezado -----
        doc
          .fontSize(20)
          .font('Helvetica-Bold')
          .text('Comprobante de Pago', { align: 'center' });
        doc.moveDown(0.3);
        doc
          .fontSize(10)
          .font('Helvetica')
          .fillColor('#555555')
          .text(`N° de comprobante: ${invoice.invoice_id ?? invoice._id}`, {
            align: 'center',
          });
        doc.fillColor('#000000');
        doc.moveDown(1);
        this.drawDivider(doc);
        doc.moveDown(1);

        // ----- Datos del pagador -----
        this.drawSectionTitle(doc, 'Datos del pagador');
        this.drawField(doc, 'Email', payment.payerEmail ?? '-');
        this.drawField(doc, 'ID de pagador (MercadoPago)', payment.payerId ?? '-');
        doc.moveDown(0.8);

        // ----- Datos de la suscripción -----
        this.drawSectionTitle(doc, 'Suscripción');
        this.drawField(doc, 'Plan', invoice.reason ?? '-');
        this.drawField(
          doc,
          'Período de facturación',
          this.buildBillingPeriod(subscription),
        );
        doc.moveDown(0.8);

        // ----- Detalle del pago -----
        this.drawSectionTitle(doc, 'Detalle del pago');
        this.drawField(
          doc,
          'Fecha de pago',
          this.formatDate(invoice.timeOfUpdate),
        );
        this.drawField(
          doc,
          'Monto',
          this.formatAmount(invoice.transactionAmount, invoice.currencyId),
        );
        this.drawField(doc, 'Moneda', invoice.currencyId ?? '-');
        this.drawField(doc, 'Método de pago', payment.paymentMethodId ?? '-');
        this.drawField(doc, 'Tipo de pago', payment.paymentTypeId ?? '-');
        this.drawField(doc, 'Estado', 'Aprobado');
        this.drawField(doc, 'Detalle de estado', payment.status_detail ?? '-');
        this.drawField(doc, 'ID de pago MP', payment.mpPaymentId ?? '-');
        doc.moveDown(1);
        this.drawDivider(doc);
        doc.moveDown(1);

        // ----- Pie -----
        doc
          .fontSize(9)
          .fillColor('#555555')
          .text(`Fecha de emisión: ${this.formatDate(getTodayDateTime())}`);
        doc.moveDown(0.5);
        doc
          .fontSize(8)
          .text(
            'Este comprobante no tiene valor fiscal. Es un resumen informativo de la transacción.',
            { align: 'left' },
          );
        doc.fillColor('#000000');

        doc.end();
      } catch (error: any) {
        reject(error);
      }
    });
  }

  private drawSectionTitle(doc: PDFKit.PDFDocument, title: string): void {
    doc.fontSize(13).font('Helvetica-Bold').text(title);
    doc.moveDown(0.3);
    doc.font('Helvetica').fontSize(10);
  }

  private drawField(doc: PDFKit.PDFDocument, label: string, value: string): void {
    doc.font('Helvetica-Bold').fontSize(10).text(`${label}: `, { continued: true });
    doc.font('Helvetica').text(value ?? '-');
  }

  private drawDivider(doc: PDFKit.PDFDocument): void {
    const y = doc.y;
    doc
      .strokeColor('#cccccc')
      .lineWidth(1)
      .moveTo(doc.page.margins.left, y)
      .lineTo(doc.page.width - doc.page.margins.right, y)
      .stroke()
      .strokeColor('#000000');
  }

  private buildBillingPeriod(subscription: any): string {
    const start = this.formatDateShort(subscription?.startDate);
    const next = this.formatDateShort(subscription?.nextPaymentDate);
    if (start === '-' && next === '-') return '-';
    return `${start} - ${next}`;
  }

  private formatAmount(amount: number, currencyId: string): string {
    const symbol = currencyId === 'USD' ? 'US$' : '$';
    const value = typeof amount === 'number' ? amount : 0;
    return `${symbol} ${value.toLocaleString('es-AR', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    })}`;
  }

  // Parsea un string tipo ZonedDateTime ("...[America/...]") o ISO a DD/MM/YYYY HH:mm
  private formatDate(value: string): string {
    const date = this.parseToDate(value);
    if (!date) return value ?? '-';
    const dd = String(date.getDate()).padStart(2, '0');
    const mm = String(date.getMonth() + 1).padStart(2, '0');
    const yyyy = date.getFullYear();
    const hh = String(date.getHours()).padStart(2, '0');
    const min = String(date.getMinutes()).padStart(2, '0');
    return `${dd}/${mm}/${yyyy} ${hh}:${min}`;
  }

  private formatDateShort(value: string): string {
    const date = this.parseToDate(value);
    // Si no es una fecha válida (ej. suscripción free: "free" / "FREE SUBSCRIPTION"),
    // devolvemos "-" en vez de mostrar el valor crudo.
    if (!date) return '-';
    const dd = String(date.getDate()).padStart(2, '0');
    const mm = String(date.getMonth() + 1).padStart(2, '0');
    const yyyy = date.getFullYear();
    return `${dd}/${mm}/${yyyy}`;
  }

  private parseToDate(value: string): Date | null {
    if (!value) return null;
    // Quitar sufijo de zona entre corchetes que Date no sabe parsear
    const cleaned = value.replace(/\[.*\]$/, '');
    const date = new Date(cleaned);
    return isNaN(date.getTime()) ? null : date;
  }
}
