import { Global, Module } from '@nestjs/common';
import { EmitterService } from './emmiter';

@Global()
@Module({
    providers: [EmitterService],
    exports: [EmitterService],
})
export class EmmiterModule { }
