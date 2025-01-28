import { EventEmitter2 } from "@nestjs/event-emitter";

export abstract class EventEmitter {
    static eventEmitter: EventEmitter2;
    static async emmit_event(event: string, body: any): Promise<any> {

    }
}

export default EventEmitter