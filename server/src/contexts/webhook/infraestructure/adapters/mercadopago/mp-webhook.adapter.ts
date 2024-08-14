/* eslint-disable prettier/prettier */
import { Injectable } from "@nestjs/common";
import { ConfigService } from '@nestjs/config'; // Asegúrate de importar ConfigServic
import * as crypto from 'crypto';

@Injectable()
export class MpWebhookAdapter {

	constructor(
		private readonly configService: ConfigService,
	) { }

	async handleRequestValidation(xSignature: any, xRequestId: any, dataID: string): Promise<boolean> {
		const SECRET_KEY_MP_WEBHOOK = this.configService.get<string>('SECRET_KEY_MP_WEBHOOK');
		//Have to extract data.id from url in production
		// const dataID = "123456";

		// Separate x-signature into parts
		const parts = xSignature.split(',');
		let ts: string | undefined;
		let hash: string | undefined;

		// Iterate over the values to obtain ts and v1
		parts.forEach((part: { split: (arg0: string) => [any, any]; }) => {
			// Split each part into key and value
			const [key, value] = part.split('=');
			if (key && value) {
				const trimmedKey = key.trim();
				const trimmedValue = value.trim();
				if (trimmedKey === 'ts') {
					ts = trimmedValue;
				} else if (trimmedKey === 'v1') {
					hash = trimmedValue;
				}
			}
		});


		const secret = SECRET_KEY_MP_WEBHOOK
		if (!secret) {
			console.log("Please add SECRET_KEY_MP_WEBHOOK to your environment variables")
			return false
		}

		// Create the manifest string
		const manifest = `id:${dataID};request-id:${xRequestId};ts:${ts};`;

		// Generate the HMAC signature
		const hmac = crypto.createHmac('sha256', secret);
		hmac.update(manifest);
		const sha = hmac.digest('hex');

		if (sha === hash) return Promise.resolve(true)
		else {
			return Promise.resolve(false)
		}
	}

	async handleSendValidation(): Promise<void> {
		
	}

}