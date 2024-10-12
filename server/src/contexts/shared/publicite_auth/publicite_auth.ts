import { decodeJwt } from '@clerk/backend/jwt';

export class PubliciteAuth {
  static authorize(context: any): boolean {
    //DEBEMOS VER EL TOKEN, HACER LA DECODIFICACION Y COMPARAR CON EL ID DEL QUE HACE LA SOLICITUD, SI TODO VA BIEN DEJAMOS PASAR

    const token = context.req.token;
    console.log(`Token: ${token}`);

    const claims = decodeJwt(token);
    console.log(claims);
    return true;
  }
}
