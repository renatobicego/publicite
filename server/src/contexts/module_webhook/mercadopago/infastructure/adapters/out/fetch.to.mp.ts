import { MyLoggerService } from "src/contexts/module_shared/logger/logger.service";
import { FetchToMpInterface } from "../../../application/adapter/out/fech.to.mp.interface";
import { ConfigService } from "@nestjs/config";
import { BadRequestException } from "@nestjs/common";

export class FetchToMercadoPagoAdapter implements FetchToMpInterface {
    constructor(
        private readonly configService: ConfigService,
        private readonly logger: MyLoggerService
    ) { }

    async getDataFromMp_fetch(url: string): Promise<any> {
        try {

            const MP_ACCESS_TOKEN = this.configService.get<string>('MP_ACCESS_TOKEN');
            if (!MP_ACCESS_TOKEN) {
                this.logger.error('MercadoPago access token is not defined');
                throw new Error('MP_ACCESS_TOKEN is not configured');
            }

            this.logger.log('Fetching data to Mercadopago: ' + url);
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
                    'Content-Type': 'application/json', // Asegúrate de incluir Content-Type
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