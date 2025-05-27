import { Global, Module } from '@nestjs/common';
import { MyLoggerService } from './logger.service';
@Global()
@Module({
  providers: [MyLoggerService],
  exports: [MyLoggerService], // Exportar para que otros módulos puedan usarlo
})
export class LoggerModule {}
