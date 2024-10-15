import { Module } from '@nestjs/common';
import { NotificationGatewaySocket } from '../gatewaySocket/gateway.socket';

@Module({
  providers: [NotificationGatewaySocket],
})
export class NotificationSocketModule {}
