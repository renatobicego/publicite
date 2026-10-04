import { describe, expect, it } from '@jest/globals';

import {
  generateCredentialId,
  isValidCredentialId,
} from './generateCredentialId';

describe('generateCredentialId (Mis Producciones - RNF-09)', () => {
  it('genera IDs con el formato SP-XXXX-XXXX', () => {
    const id = generateCredentialId();

    expect(id).toMatch(/^SP-[A-Z0-9]{4}-[A-Z0-9]{4}$/);
    expect(isValidCredentialId(id)).toBe(true);
  });

  it('no usa caracteres ambiguos (0, O, 1, I, L)', () => {
    for (let i = 0; i < 500; i++) {
      const body = generateCredentialId().slice(3).replace('-', '');
      expect(body).not.toMatch(/[01OIL]/);
    }
  });

  it('genera IDs distintos en llamadas sucesivas', () => {
    const ids = new Set(Array.from({ length: 1000 }, generateCredentialId));
    expect(ids.size).toBe(1000);
  });

  it('rechaza valores que no respetan el formato', () => {
    expect(isValidCredentialId(undefined)).toBe(false);
    expect(isValidCredentialId('')).toBe(false);
    expect(isValidCredentialId('SP-ABCD')).toBe(false);
    expect(isValidCredentialId('sp-abcd-efgh')).toBe(false);
    expect(isValidCredentialId('SP-AB0D-EFGH')).toBe(false);
    expect(isValidCredentialId('XX-ABCD-EFGH')).toBe(false);
  });
});
