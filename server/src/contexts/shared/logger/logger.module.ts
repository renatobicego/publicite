import { Module } from '@nestjs/common';
import { MyLoggerService } from './logger.service';

@Module({
  providers: [MyLoggerService],
  exports: [MyLoggerService], // Exportar para que otros módulos puedan usarlo
})
export class LoggerModule {}
