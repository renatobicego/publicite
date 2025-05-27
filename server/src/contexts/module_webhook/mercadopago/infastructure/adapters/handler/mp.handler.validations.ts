import { UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as crypto from 'crypto';

import { MyLoggerService } from 'src/contexts/module_shared/logger/logger.service';
import { MpHandlerValidationsInterface } from 'src/contexts/module_webhook/mercadopago/domain/handler/mp.handler.validations.interface';

export class MpHandlerValidations implements MpHandlerValidationsInterface {
  constructor(
    private readonly configService: ConfigService,
    private readonly logger: MyLoggerService,
  ) {}
  isHashValid(req: Request, header: Record<string, string>): boolean {
    const request = req.url.split('?')[1];
    const queryObject = new URLSearchParams(request);
    const dataId = queryObject.get('data.id');
    const xSignature = header['x-signature'];
    const xRequestId = header['x-request-id'];

    if (!xSignature || !xRequestId) {
      this.logger.error('Invalid webhook headers');
      throw new UnauthorizedException('Invalid webhook headers');
    }

    this.logger.log('Check hash validation - Class:mpHandlerValidations');
    // Separate x-signature into parts
    const parts = xSignature.split(',');
    let ts: string | undefined;
    let hash: string | undefined;

    // Iterate over the values to obtain ts and v1
    parts.forEach((part) => {
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

    const secret = this.configService.get<string>('SECRET_KEY_MP_WEBHOOK');
    if (!secret) {
      this.logger.error(
        'Please add SECRET_KEY_MP_WEBHOOK to your environment variables',
      );
      return false;
    }

    // Create the manifest string
    const manifest = `id:${dataId};request-id:${xRequestId};ts:${ts};`;
    // Generate the HMAC signature
    const hmac = crypto.createHmac('sha256', secret);
    hmac.update(manifest);
    const sha = hmac.digest('hex');
    if (sha === hash) {
      this.logger.warn('Check hash validation - VALIDATION: OK');
      return true;
    } else {
      this.logger.error(
        'Check hash validation - VALIDATION: WRONG - Please check your headers',
      );
      throw new UnauthorizedException('Invalid webhook headers');
    }
  }
}
