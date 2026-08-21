import { decodeJwt } from '@clerk/backend/jwt';
import { clerkClient } from '@clerk/express';

export type PubliciteRole = 'admin' | 'user';

/**
 * Resuelve el rol de Publicité (`admin` | `user`) de quien manda el request.
 *
 * El rol vive en `publicMetadata.role` de Clerk. Si el template del JWT lo
 * propaga como claim (Dashboard → Sessions → Customize session token), alcanza
 * con leer el token; si no está configurado, caemos a la API de Clerk usando el
 * `sub` del token. El fallback existe porque el template que usa el front
 * ("testing") no necesariamente incluye `role`, y un panel de admin que depende
 * de una config de dashboard que nadie tocó es un panel que no funciona.
 */
export async function resolveRoleFromToken(
  token: string,
): Promise<PubliciteRole | undefined> {
  const claims = decodeJwt(token);
  const payload = claims.payload as any;

  const claimRole =
    payload?.metadata?.role ??
    payload?.public_metadata?.role ??
    payload?.publicMetadata?.role ??
    payload?.role;

  if (claimRole) return claimRole as PubliciteRole;

  const clerkId = payload?.sub;
  if (!clerkId) return undefined;

  const user = await clerkClient.users.getUser(clerkId);
  return (user?.publicMetadata as any)?.role as PubliciteRole | undefined;
}

export async function isAdminToken(token: string): Promise<boolean> {
  try {
    return (await resolveRoleFromToken(token)) === 'admin';
  } catch {
    return false;
  }
}
