import { normalizePayoutAccounts } from './payoutAccounts';

describe('normalizePayoutAccounts', () => {
  it('normaliza, descarta repetidos y conserva el orden', () => {
    expect(
      normalizePayoutAccounts([
        { label: ' Banco ', aliasCbu: ' mi.alias-1 ' },
        { aliasCbu: '0000003100000000000001' },
        { label: 'Otro', aliasCbu: 'MI.ALIAS-1' },
      ]),
    ).toEqual([
      { label: 'Banco', aliasCbu: 'mi.alias-1' },
      { label: null, aliasCbu: '0000003100000000000001' },
    ]);
  });

  it('lista vacía o nula = sin cuentas', () => {
    expect(normalizePayoutAccounts([])).toEqual([]);
    expect(normalizePayoutAccounts(null)).toEqual([]);
  });

  it('rechaza alias inválidos, nombres largos y más de 10 cuentas', () => {
    expect(() => normalizePayoutAccounts([{ aliasCbu: 'abc' }])).toThrow();
    expect(() =>
      normalizePayoutAccounts([{ label: 'x'.repeat(41), aliasCbu: 'mi.alias' }]),
    ).toThrow();
    const many = Array.from({ length: 11 }, (_, i) => ({
      aliasCbu: `alias.numero${i}`,
    }));
    expect(() => normalizePayoutAccounts(many)).toThrow();
  });
});
