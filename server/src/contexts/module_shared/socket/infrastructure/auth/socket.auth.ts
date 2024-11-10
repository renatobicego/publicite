import { CanActivate, ExecutionContext, Injectable, UnauthorizedException } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";




@Injectable()
export class AuthSocket implements CanActivate {


    constructor(
        private readonly configService: ConfigService,
    ) { }

    canActivate(context: ExecutionContext): Promise<boolean> {
        const req = context.switchToHttp().getRequest();
        const API_KEY_IN_SOCKET_REQUEST = req.headers['authorization'] ?? undefined;
        const PUBLICITE_SOCKET_API_KEY = this.configService.get<string>('PUBLICITE_SOCKET_API_KEY');

        if (!API_KEY_IN_SOCKET_REQUEST || API_KEY_IN_SOCKET_REQUEST !== PUBLICITE_SOCKET_API_KEY) {
            console.log("API KEY IS NOT VALID")
            throw new UnauthorizedException('Unauthorized');
        }
        console.log("API KEY VALIDATED")
        return Promise.resolve(true);
    }


}