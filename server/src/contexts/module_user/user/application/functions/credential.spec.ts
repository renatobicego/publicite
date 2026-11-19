import { describe, expect, it } from '@jest/globals';
import { BadRequestException } from '@nestjs/common';
import { normalizeCredential } from './credential';

describe('normalizeCredential', () => {
  it('acepta una key de UploadThing y un hex, y pasa el color a minúsculas', () => {
    expect(
      normalizeCredential({
        credentialPhotoUrl: 'abc123-XYZ_9',
        credentialColor: '#FF00aa',
      }),
    ).toEqual({ credentialPhotoUrl: 'abc123-XYZ_9', credentialColor: '#ff00aa' });
  });

  it('vacío o nulo significa quitar', () => {
    expect(
      normalizeCredential({ credentialPhotoUrl: '  ', credentialColor: null }),
    ).toEqual({ credentialPhotoUrl: null, credentialColor: null });
  });

  it('rechaza una foto que no es una key (p. ej. una URL)', () => {
    expect(() =>
      normalizeCredential({ credentialPhotoUrl: 'https://evil.com/x.png' }),
    ).toThrow(BadRequestException);
  });

  it('rechaza un color que no es #rrggbb', () => {
    expect(() =>
      normalizeCredential({ credentialColor: 'red; background:url(x)' }),
    ).toThrow(BadRequestException);
    expect(() => normalizeCredential({ credentialColor: '#fff' })).toThrow(
      BadRequestException,
    );
  });
});
