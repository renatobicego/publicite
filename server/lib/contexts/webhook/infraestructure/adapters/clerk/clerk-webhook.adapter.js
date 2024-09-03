"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ClerkWebhookAdapter = void 0;
const common_1 = require("@nestjs/common");
const svix_1 = require("svix");
/*
  Esta capa actua como intermediaria de la interacción con la API de Webhook de Clerk.
  La principal responabilidad de esta capa es interceptar los eventos de webhook

*/
let ClerkWebhookAdapter = class ClerkWebhookAdapter {
    constructor(webhookService, webhookSecret) {
        this.webhookService = webhookService;
        this.webhookSecret = webhookSecret;
    }
    async handleRequest(payload, headers) {
        const svixId = headers['svix-id'];
        const svixTimestamp = headers['svix-timestamp'];
        const svixSignature = headers['svix-signature'];
        if (!svixId || !svixTimestamp || !svixSignature) {
            throw new common_1.UnauthorizedException('Invalid webhook headers');
        }
        const body = JSON.stringify(payload);
        const wh = new svix_1.Webhook(this.webhookSecret);
        let evt;
        try {
            evt = wh.verify(body, {
                'svix-id': svixId,
                'svix-timestamp': svixTimestamp,
                'svix-signature': svixSignature,
            });
        }
        catch (err) {
            console.error('Error verifying webhook:', err);
            throw new common_1.UnauthorizedException('Invalid webhook signature');
        }
        await this.webhookService.processEvent(evt);
    }
};
ClerkWebhookAdapter = __decorate([
    (0, common_1.Injectable)()
], ClerkWebhookAdapter);
exports.ClerkWebhookAdapter = ClerkWebhookAdapter;
//# sourceMappingURL=clerk-webhook.adapter.js.map