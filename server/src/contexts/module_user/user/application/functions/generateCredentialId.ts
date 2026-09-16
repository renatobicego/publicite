import { randomInt } from 'crypto';

/**
 * ID decorativo de credencial (RNF-09).
 *
 * El usuario hoy solo tiene `_id` / `username` / `dni` / `finder`. La credencial
 * del perfil necesita un identificador propio, legible y compartible, que NO
 * exponga el `_id` interno de Mongo. Es decorativo: no se usa para resolver
 * permisos ni como clave foránea. El QR de compartir sigue apuntando al perfil
 * (`/perfiles/:id`).
 *
 * Formato: `SP-XXXX-XXXX` sobre un alfabeto sin caracteres ambiguos (se excluyen
 * 0/O y 1/I/L) para que se pueda dictar o tipear sin errores.
 */

const ALPHABET = '23456789ABCDEFGHJKMNPQRSTUVWXYZ';
const BLOCK_LENGTH = 4;
const PREFIX = 'SP';

function randomBlock(): string {
  let block = '';
  for (let i = 0; i < BLOCK_LENGTH; i++) {
    block += ALPHABET[randomInt(ALPHABET.length)];
  }
  return block;
}

/** Genera un ID de credencial con el formato `SP-XXXX-XXXX`. */
function generateCredentialId(): string {
  return `${PREFIX}-${randomBlock()}-${randomBlock()}`;
}

/** Valida que un string tenga el formato de ID de credencial. */
function isValidCredentialId(value: string | null | undefined): boolean {
  if (!value) return false;
  return new RegExp(
    `^${PREFIX}-[${ALPHABET}]{${BLOCK_LENGTH}}-[${ALPHABET}]{${BLOCK_LENGTH}}$`,
  ).test(value);
}

export { generateCredentialId, isValidCredentialId };
