"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.MpWebhookService = void 0;
const common_1 = require("@nestjs/common");
const subcription_entity_1 = require("../../domain/mercadopago/entity/subcription.entity");
const invoice_entity_1 = require("../../domain/mercadopago/entity/invoice.entity");
const payment_entity_1 = require("../../domain/mercadopago/entity/payment.entity");
//import { UserRepositoryInterface } from 'src/contexts/user/domain/user-repository.interface';
/*
Capa de servicio: Debe encargarse de arrojar las exceptions, transforma las request en objetos de dominio (entidades) y las envia al repositorio de persistencia.
Esta capa deberia retornar todos los errores.
*/
let MpWebhookService = class MpWebhookService {
    constructor(logger, configService, mercadoPagoEventsRepository) {
        this.logger = logger;
        this.configService = configService;
        this.mercadoPagoEventsRepository = mercadoPagoEventsRepository;
        this.MP_ACCESS_TOKEN = this.configService.get('MP_ACCESS_TOKEN');
    }
    async create_payment(payment) {
        try {
            this.logger.log('Creating payment for suscription description: ' + payment.description);
            this.logger.log('Creating payment with ID: ' + payment.id);
            if (payment && payment.payer) {
                const newPayment = new payment_entity_1.default(payment.id, payment.payer.id, payment.payer.email, payment.payment_type_id, payment.payment_method_id, payment.transaction_amount, payment.date_approved);
                console.log(newPayment);
                await this.mercadoPagoEventsRepository.createPayment(newPayment);
            }
            else {
                this.logger.error('Invalid payment data - Error in payment service');
                throw new common_1.BadRequestException('Invalid payment data');
            }
            return Promise.resolve();
        }
        catch (error) {
            this.logger.error('An error has ocurred while creating payment for suscription description: ' +
                payment.description);
            this.logger.error('An error has ocurred while creating payment ID: ' + payment.id);
            throw error;
        }
    }
    // Generamos la factura del usuario
    async createSubscription_authorize_payment(subscription_authorized_payment) {
        this.logger.log('createSubscription_authorize_payment - Class:mpWebhookService');
        try {
            this.logger.log('---INVOICE SERVICE---');
            if (subscription_authorized_payment.status === 'scheduled') {
                this.logger.log('Status: ' +
                    subscription_authorized_payment.status +
                    ' the invoice for subscription_authorized_payment ID: ' +
                    subscription_authorized_payment.id +
                    ' is not saved yet. Waiting for payment to be approved');
                return Promise.resolve();
            }
            /*
                  PENDIENTE:
                  si el evento es scheduled creamos el invoice y guardamos en la base de datos, pero lo hacemos con el estado en pending.
                  Cuando llega el otro evento deberiamos buscar el invoice en estado pending y cambiar su estado a approved y adicionalmente updatear el schema con el ID del pago y lo que falte
                  
                  */
            const subscripcion = await this.mercadoPagoEventsRepository.findSubscriptionByPreapprovalId(subscription_authorized_payment.preapproval_id);
            const payment = await this.mercadoPagoEventsRepository.findPaymentByPaymentID(subscription_authorized_payment.payment.id);
            if (!subscripcion || subscripcion === null) {
                this.logger.error('Subscription not found. An error has ocurred with subscription_authorized_payment ID: ' +
                    subscription_authorized_payment.id +
                    '- Class:mpWebhookService');
                throw new common_1.BadRequestException();
            }
            if (!payment || payment === null) {
                this.logger.error('Payment not found. An error has ocurred with the payment ID: ' +
                    subscription_authorized_payment.id +
                    'preapproval ID:' +
                    subscription_authorized_payment.preapproval_id +
                    '- Class:mpWebhookService');
                throw new common_1.BadRequestException();
            }
            if (subscription_authorized_payment != null ||
                subscription_authorized_payment != undefined) {
                this.logger.log('Status: ' +
                    subscription_authorized_payment.status +
                    ' Generate invoice to save');
                const newInvoice = new invoice_entity_1.default(payment.getId(), //Payment ID de nuestro schema
                subscripcion.getId(), // Id de la suscripcion en nuestro schema
                subscription_authorized_payment.payment.status, //Payment status
                subscription_authorized_payment.preapproval_id);
                await this.mercadoPagoEventsRepository.saveInvoice(newInvoice);
            }
            return Promise.resolve();
        }
        catch (error) {
            this.logger.error('Error createSubscription_authorize_payment - Class:mpWebhookService', error);
            throw new common_1.InternalServerErrorException(error);
        }
    }
    // Generamos la subscripcion del usuario
    async createSubscription_preapproval(subscription_preapproval) {
        this.logger.log('---SUBSCRIPTION SERVICE---');
        this.logger.log('createSubscription_preapproval - Class: mpWebhookService');
        try {
            // Crear el nuevo objeto de suscripción
            const { id, payer_id, status, preapproval_plan_id, auto_recurring, external_reference, } = subscription_preapproval;
            if (!auto_recurring ||
                !auto_recurring.start_date ||
                !auto_recurring.end_date ||
                !external_reference) {
                this.logger.error('Invalid subscription data - missing dates');
                throw new common_1.BadRequestException('Invalid subscription data');
            }
            let { start_date, end_date } = auto_recurring;
            start_date = this.parseTimeX(start_date);
            end_date = this.parseTimeX(end_date);
            //Buscamos el plan al que pertenece la suscripción
            const plan = await this.mercadoPagoEventsRepository.findSubscriptionPlanByMeliID(preapproval_plan_id);
            if (!plan) {
                this.logger.error('Plan not found - Class: mpWebhookService');
                throw new common_1.BadRequestException("Plan not found, we can't create the subscription");
            }
            const planID = plan.getId();
            try {
                this.logger.log('Creating a new subscription with ID: ' +
                    id +
                    'external reference: ' +
                    external_reference +
                    'for plan ' +
                    plan.getDescription() +
                    ' - Class: mpWebhookService');
                const newUserSuscription = new subcription_entity_1.default(id, // ID de la suscripción
                payer_id, // id del payer
                status, // estado de la suscripción
                planID, // id del plan en nuestro sistema
                start_date, // fecha de inicio
                end_date, // fecha de fin
                external_reference);
                await this.mercadoPagoEventsRepository.saveSubPreapproval(newUserSuscription);
            }
            catch (error) {
                throw error;
            }
            //PENDIENTE: Deberia ver si el estado esta cancelado o no, ver luego como manejar eso.
            // const checkStatus =
            //   await this.mercadoPagoEventsRepository.findByPayerIdAndSubscriptionPlanID(
            //     payer_id,
            //     planID,
            //     external_reference,
            //   );
            // await this.mercadoPagoEventsRepository.updateUserSubscription(
            //   payer_id,
            //   newUserSuscription,
            // );
        }
        catch (error) {
            this.logger.error('Error in createSubscription_preapproval - Class: mpWebhookService', error);
            throw error;
        }
    }
    async fetchData(url) {
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
            throw new common_1.BadRequestException('Error fetching data');
        }
        const response_result = await response.json();
        return response_result;
    }
    parseTimeX(date) {
        return date.split('T')[0];
    }
};
MpWebhookService = __decorate([
    (0, common_1.Injectable)(),
    __param(2, (0, common_1.Inject)('MercadoPagoEventsInterface'))
], MpWebhookService);
exports.MpWebhookService = MpWebhookService;
//# sourceMappingURL=mpWebhook.service.js.map