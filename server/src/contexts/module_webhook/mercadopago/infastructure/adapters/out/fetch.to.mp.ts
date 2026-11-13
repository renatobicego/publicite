import { MyLoggerService } from "src/contexts/module_shared/logger/logger.service";
import { FetchToMpInterface } from "../../../application/adapter/out/fech.to.mp.interface";
import { MercadoPagoApiError } from "../../../application/adapter/out/mercadopago.api.error";
import { ConfigService } from "@nestjs/config";
import { BadRequestException } from "@nestjs/common";

const PREAPPROVAL_URL = 'https://api.mercadopago.com/preapproval';

export class FetchToMercadoPagoAdapter implements FetchToMpInterface {
    constructor(
        private readonly configService: ConfigService,
        private readonly logger: MyLoggerService
    ) { }

    private getAccessToken(): string {
        const MP_ACCESS_TOKEN = this.configService.get<string>('MP_ACCESS_TOKEN');
        if (!MP_ACCESS_TOKEN) {
            this.logger.error('MercadoPago access token is not defined');
            throw new Error('MP_ACCESS_TOKEN is not configured');
        }
        return MP_ACCESS_TOKEN;
    }

    /*
    Llamada con cuerpo a la API de MP. Si MP no la acepta lanza MercadoPagoApiError
    con su respuesta (no se loguea el cuerpo enviado: lleva el token de la tarjeta).
    */
    private async sendToMp(method: 'POST' | 'PUT', url: string, body: Record<string, any>): Promise<any> {
        const response = await fetch(url, {
            method,
            headers: {
                Authorization: `Bearer ${this.getAccessToken()}`,
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(body),
        });
        const text = await response.text();
        let parsed: any = text;
        try {
            parsed = text ? JSON.parse(text) : {};
        } catch {
            // MP respondió algo que no es JSON: se devuelve el texto tal cual.
        }
        if (!response.ok) {
            this.logger.error(`MercadoPago ${method} ${url} respondió ${response.status}: ${text}`);
            throw new MercadoPagoApiError(response.status, parsed);
        }
        return parsed;
    }

    async createPreapproval(body: Record<string, any>): Promise<any> {
        this.logger.log('Creating preapproval in Mercadopago for ' + (body?.external_reference ?? 'unknown'));
        return this.sendToMp('POST', PREAPPROVAL_URL, body);
    }

    async updatePreapproval(preapprovalId: string, body: Record<string, any>): Promise<any> {
        this.logger.log('Updating preapproval in Mercadopago: ' + preapprovalId);
        return this.sendToMp('PUT', `${PREAPPROVAL_URL}/${preapprovalId}`, body);
    }

    async getDataFromMp_fetch(url: string): Promise<any> {
        try {

            const MP_ACCESS_TOKEN = this.configService.get<string>('MP_ACCESS_TOKEN');
            if (!MP_ACCESS_TOKEN) {
                this.logger.error('MercadoPago access token is not defined');
                throw new Error('MP_ACCESS_TOKEN is not configured');
            }

            this.logger.log('Fetching to Mercadopago----> ' + url);
            const response = await fetch(url, {
                method: 'GET',
                headers: {
                    Authorization: `Bearer ${MP_ACCESS_TOKEN}`,
                },
            });
            if (response.status !== 200) {
                this.logger.error(`Error fetching data: ${response.status}`);
                console.log(response);
                throw new BadRequestException('Error fetching data');
            }
            const response_result = await response.json();
            return response_result;
        } catch (error) {
            this.logger.error('Error fetching data: ' + error);
            throw error;
        }
    }
    async changeSubscriptionStatusInMercadopago_fetch(url: string, preapproval_id: string, subscription_action: string): Promise<any> {

        /*
        BODY DOCUMENTATION:
        STATUS: "authorized" | "paused" 
        
        */

        const MP_ACCESS_TOKEN = this.configService.get<string>('MP_ACCESS_TOKEN');
        if (!MP_ACCESS_TOKEN) {
            this.logger.error('MercadoPago access token is not defined');
            throw new Error('MP_ACCESS_TOKEN is not configured');
        }
        try {
            const rute = `${url}${preapproval_id}`;
            this.logger.warn('fetching to mp url: ' + rute);

            const response = await fetch(rute, {
                method: 'PUT',
                headers: {
                    Authorization: `Bearer ${MP_ACCESS_TOKEN}`,
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    status: subscription_action,
                }),
            });

            if (!response.ok) {
                throw new Error(`Error en la solicitud: ${response.statusText}`);
            }

            const data = await response.json();
            return data;
        } catch (error) {
            console.error('Error al actualizar la suscripción:', error);
            throw error;
        }
    }
}