import { randomInt } from 'crypto';

// Sin 0/O ni 1/I: el código se lee y se dicta sin confundir letras.
const CODE_ALPHABET = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';

export function generateGiftCode(length = 10): string {
  let code = '';
  for (let i = 0; i < length; i++) {
    code += CODE_ALPHABET[randomInt(CODE_ALPHABET.length)];
  }
  return code;
}

export function normalizeEmail(email: string): string {
  return email.trim().toLowerCase();
}

/** "maxi@gmail.com" -> "ma***@gmail.com": para mostrar a quién está reservado sin exponerlo. */
export function maskEmail(email: string | null | undefined): string | null {
  if (!email) return null;
  const [local, domain] = email.split('@');
  if (!domain) return null;
  const visible = local.slice(0, Math.min(2, local.length));
  return `${visible}***@${domain}`;
}

export function displayName(user: { name?: string; lastName?: string; username?: string } | null | undefined): string | null {
  if (!user) return null;
  const full = `${user.name ?? ''} ${user.lastName ?? ''}`.trim();
  return full || user.username || null;
}

export const giftLink = (code: string) => `/canjear/${code}`;
