import { BadRequestException } from '@nestjs/common';
import { randomBytes, scrypt, timingSafeEqual } from 'crypto';
import { promisify } from 'util';

/**
 * Clave de acceso del blog, tipo Zoom (INV-01/02, RNF-13). Se guarda sólo el
 * hash (scrypt con salt aleatorio); nunca el texto plano.
 *
 * Formato persistido: `scrypt$<salt hex>$<hash hex>`.
 */

const scryptAsync = promisify(scrypt) as (
  password: string,
  salt: Buffer,
  keylen: number,
) => Promise<Buffer>;

const KEY_LENGTH = 64;
const SALT_LENGTH = 16;
export const ACCESS_KEY_MIN_LENGTH = 4;
export const ACCESS_KEY_MAX_LENGTH = 128;

export function validateAccessKey(accessKey: string): string {
  const normalized = (accessKey ?? '').trim();
  if (
    normalized.length < ACCESS_KEY_MIN_LENGTH ||
    normalized.length > ACCESS_KEY_MAX_LENGTH
  ) {
    throw new BadRequestException(
      `La clave debe tener entre ${ACCESS_KEY_MIN_LENGTH} y ${ACCESS_KEY_MAX_LENGTH} caracteres`,
    );
  }
  return normalized;
}

export async function hashAccessKey(accessKey: string): Promise<string> {
  const normalized = validateAccessKey(accessKey);
  const salt = randomBytes(SALT_LENGTH);
  const hash = await scryptAsync(normalized, salt, KEY_LENGTH);
  return `scrypt$${salt.toString('hex')}$${hash.toString('hex')}`;
}

export async function verifyAccessKey(
  accessKey: string | undefined | null,
  storedHash: string | undefined | null,
): Promise<boolean> {
  if (!accessKey || !storedHash) return false;
  const [algorithm, saltHex, hashHex] = storedHash.split('$');
  if (algorithm !== 'scrypt' || !saltHex || !hashHex) return false;

  const expected = Buffer.from(hashHex, 'hex');
  const actual = await scryptAsync(
    accessKey.trim(),
    Buffer.from(saltHex, 'hex'),
    expected.length,
  );
  return (
    actual.length === expected.length && timingSafeEqual(actual, expected)
  );
}
