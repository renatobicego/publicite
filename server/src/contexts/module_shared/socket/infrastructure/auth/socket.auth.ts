import { CanActivate, ExecutionContext, Injectable, UnauthorizedException } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { logger } from "firebase-functions/v1";
import { Observable } from "rxjs";



@Injectable()
export class AuthSocket implements CanActivate {

    // canActivate(context: ExecutionContext): Promise<boolean> {
    //     const req = context.switchToHttp().getRequest();
    //     // const headers = client.handshake.headers;  
    //     // const api_key = headers['authorization'];
    //     console.log(req.headers); 
    //     return Promise.resolve(true);
    // }
    constructor(
        private readonly configService: ConfigService,
    ) { }

    canActivate(context: ExecutionContext): boolean | Promise<boolean> | Observable<boolean> {
        try {
            const ctx = context.switchToRpc().getContext();
            const api_key_save_in_backend = this.configService.get<string>('PUBLICITE_SOCKET_API_KEY');
            const api_key_save_in_socket = ctx.get('publicite_socket_api_key')[0].toString();
            if (api_key_save_in_backend !== api_key_save_in_socket) {
                logger.error('API_KEY no válida');
                return false

            }
            logger.log('valid api key');
            return true;
        } catch (error) {
            throw new UnauthorizedException(error.message);
        }
    }


}