import { CanActivate, ExecutionContext, Injectable } from "@nestjs/common";



@Injectable()
export class AuthSocket implements CanActivate {

    canActivate(context: ExecutionContext): Promise<boolean> {
        const req = context.switchToHttp().getRequest();
        // const headers = client.handshake.headers;  
        // const api_key = headers['authorization'];
        console.log(req.headers); 
        return Promise.resolve(true);
    }


}