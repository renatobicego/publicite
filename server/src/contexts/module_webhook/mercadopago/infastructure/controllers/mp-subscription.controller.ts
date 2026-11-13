import {
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Inject,
  Param,
  Req,
  UseGuards,
} from '@nestjs/common';

import { MyLoggerService } from 'src/contexts/module_shared/logger/logger.service';
import { SubscriptionAdapterInterface } from '../../application/adapter/in/mp-subscription.adapter.interface';
import { ClerkAuthGuard } from 'src/contexts/module_shared/auth/clerk-auth/clerk.auth.guard';
import { AuthSocket } from 'src/contexts/module_socket/infrastructure/auth/socket.auth';

@Controller('subscription')
export class SubscriptionController {
  constructor(
    private readonly logger: MyLoggerService,
    @Inject('SubscriptionAdapterInterface')
    private readonly subscriptionAdapter: SubscriptionAdapterInterface,
  ) {}

  /*
  Historial de suscripciones del usuario logueado. El `_id` de la ruta se ignora
  (se mantiene para no romper el cliente): se usa siempre el del token, así nadie
  puede leer las suscripciones de otro.
  */
  @Get(':_id')
  @HttpCode(HttpStatus.OK)
  @UseGuards(ClerkAuthGuard)
  async getActiveSubscriptionController(
    @Param('_id') _id: string,
    @Req() request: { userRequestId?: string },
  ): Promise<any[] | []> {
    try {
      const userId = request?.userRequestId;
      if (!userId) return [];
      if (_id && _id !== userId) {
        this.logger.warn(
          `Pidieron el historial de ${_id} con el token de ${userId}: se devuelve el del token.`,
        );
      }
      const subscription =
        await this.subscriptionAdapter.getSubscriptionHistory(userId);
      return subscription;
    } catch (error: any) {
      throw error;
    }
  }

  @Delete(':id')
  @UseGuards(AuthSocket)
  async deleteSubscriptionController(@Param('id') id: string) {
    try {
      await this.subscriptionAdapter.deleteSubscription(id);
    } catch (error: any) {
      throw error;
    }
  }
}
