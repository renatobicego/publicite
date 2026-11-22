/**
 * Alias (6 a 20 caracteres: letras, números, puntos o guiones) o CBU/CVU
 * (22 dígitos). Mismas reglas que `module_shared/payout/alias-cbu.ts` del
 * server: si cambian, cambiar los dos.
 */
const CBU_REGEX = /^\d{22}$/;
const ALIAS_REGEX = /^[a-zA-Z0-9.-]{6,20}$/;

export const isValidAliasCbu = (value: string) => {
  const v = value.trim();
  return CBU_REGEX.test(v) || ALIAS_REGEX.test(v);
};

export const isCbu = (value: string) => CBU_REGEX.test(value.trim());

export const ALIAS_CBU_ERROR =
  "Ingresá un alias (6 a 20 caracteres: letras, números, puntos o guiones) o un CBU/CVU de 22 dígitos";
