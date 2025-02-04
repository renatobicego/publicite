import { Injectable } from '@nestjs/common';
import { EventEmitter2 } from '@nestjs/event-emitter';

@Injectable()
export class EmitterService {
    constructor(private readonly eventEmitter: EventEmitter2) { }

    emit(event: string, body: any): any {
        this.eventEmitter.emit(event, body);
    }

    async emitAsync(event: string, body: any): Promise<any> {
        const res = await this.eventEmitter.emitAsync(event, body);
        console.log(res);
    }
}
