import { Injectable } from '@nestjs/common';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { MyLoggerService } from '../logger/logger.service';

@Injectable()
export class EmitterService {
    constructor(
        private readonly eventEmitter: EventEmitter2,
        private readonly logger: MyLoggerService,
    ) { }

    emit(event: string, body: any): any {
        try {
            this.logger.log('Emitting event: ' + event);
            return this.eventEmitter.emit(event, body);
        } catch (error: any) {
            this.logger.error(error);
            throw error;
        }
    }

    async emitAsync(event: string, body: any): Promise<any> {
        try {

            this.logger.log('Emitting event: ' + event);
            return await this.eventEmitter.emitAsync(event, body);
        } catch (error: any) {
            this.logger.error(error);
            throw error;
        }

    }
}
