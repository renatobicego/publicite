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
exports.WebhookController = void 0;
/* eslint-disable prettier/prettier */
const common_1 = require("@nestjs/common");
const swagger_1 = require("@nestjs/swagger");
/*
  Servidor de prueba, se levanta con: ngrok http --domain=regular-loved-hare.ngrok-free.app 3000
  WEB TEST URL:  https://regular-loved-hare.ngrok-free.app
*/
let WebhookController = class WebhookController {
    constructor(clerkWebhookAdapter, configService, mpWebhookAdapter, logger) {
        this.clerkWebhookAdapter = clerkWebhookAdapter;
        this.configService = configService;
        this.mpWebhookAdapter = mpWebhookAdapter;
        this.logger = logger;
    }
    async handleWebhookClerk(payload, headers) {
        const WEBHOOK_SECRET_CLERK = this.configService.get('WEBHOOK_SECRET_CLERK');
        if (!WEBHOOK_SECRET_CLERK) {
            this.logger.error('Please add WEBHOOK_SECRET_CLERK to your environment variables', 'Class:WebhookController');
            throw new Error('Please add WEBHOOK_SECRET_CLERK to your environment variables');
        }
        await this.clerkWebhookAdapter.handleRequest(payload, headers);
    }
    async handleWebhookMp(headers, res, req) {
        try {
            //Valido el origen de la petición
            const authSecretValidation = await this.mpWebhookAdapter.handleRequestWebHookOriginValidation(headers, req);
            if (authSecretValidation) {
                //En el caso de que validemos el origen y que el pago se complete correctamente, vamos a deolver el estado OK, de lo contrario esta operacion no se hara 
                this.logger.log('Webhook MP OK - Credentials are valid - WEBHOOK_PROCESS: COMPLETE ---> sending response to Meli - Class:WebhookController 🚀');
                return res.status(common_1.HttpStatus.OK).send('Signature verified');
            }
            else {
                this.logger.error('Webhook MP FAIL - Credentials are not valid', 'Class:WebhookController');
                return res
                    .status(common_1.HttpStatus.UNAUTHORIZED)
                    .send('Signature verification failed');
            }
        }
        catch (error) {
            this.logger.error(error, 'Class:WebhookController');
            return res
                .status(common_1.HttpStatus.INTERNAL_SERVER_ERROR)
                .send('Internal Server Error');
        }
    }
    async handleMpTest(headers, res, req, body) {
        try {
            //Valido el origen de la petición
            const authSecretValidation = await this.mpWebhookAdapter.payment(body.id, "asd");
            if (authSecretValidation) {
                //En el caso de que validemos el origen y que el pago se complete correctamente, vamos a deolver el estado OK, de lo contrario esta operacion no se hara 
                this.logger.log('Webhook MP OK - Credentials are valid - WEBHOOK_PROCESS: COMPLETE ---> sending response to Meli - Class:WebhookController 🚀');
                return res.status(common_1.HttpStatus.OK).send('Signature verified');
            }
            else {
                this.logger.error('Webhook MP FAIL - Credentials are not valid', 'Class:WebhookController');
                return res
                    .status(common_1.HttpStatus.UNAUTHORIZED)
                    .send('Signature verification failed');
            }
        }
        catch (error) {
            this.logger.error(error, 'Class:WebhookController');
            return res
                .status(common_1.HttpStatus.INTERNAL_SERVER_ERROR)
                .send('Internal Server Error');
        }
    }
    async healthTest() {
        this.logger.log('Service ON - Class:WebhookController');
        return { status: 'Service ON' };
    }
};
__decorate([
    (0, common_1.Post)('/clerk'),
    (0, swagger_1.ApiExcludeEndpoint)(),
    (0, common_1.HttpCode)(common_1.HttpStatus.OK),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, common_1.Headers)())
], WebhookController.prototype, "handleWebhookClerk", null);
__decorate([
    (0, common_1.Post)('/mp'),
    (0, swagger_1.ApiExcludeEndpoint)(),
    (0, common_1.HttpCode)(common_1.HttpStatus.OK),
    __param(0, (0, common_1.Headers)()),
    __param(1, (0, common_1.Res)()),
    __param(2, (0, common_1.Req)())
], WebhookController.prototype, "handleWebhookMp", null);
__decorate([
    (0, common_1.Post)('/mp-test'),
    (0, swagger_1.ApiExcludeEndpoint)(),
    (0, common_1.HttpCode)(common_1.HttpStatus.OK),
    __param(0, (0, common_1.Headers)()),
    __param(1, (0, common_1.Res)()),
    __param(2, (0, common_1.Req)()),
    __param(3, (0, common_1.Body)())
], WebhookController.prototype, "handleMpTest", null);
__decorate([
    (0, common_1.Get)('health'),
    (0, swagger_1.ApiExcludeEndpoint)(),
    (0, common_1.HttpCode)(common_1.HttpStatus.OK)
], WebhookController.prototype, "healthTest", null);
WebhookController = __decorate([
    (0, common_1.Controller)('webhook')
], WebhookController);
exports.WebhookController = WebhookController;
//# sourceMappingURL=webhook.controller.js.map