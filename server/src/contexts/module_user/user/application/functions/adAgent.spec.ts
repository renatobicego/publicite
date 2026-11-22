import {
  normalizeAdAgentData,
  normalizeAdAgentRegistration,
  normalizeCuit,
} from './adAgent';

const valid = {
  adAgent: {
    website: 'https://radiosol.com.ar',
    taxCondition: 'responsableInscripto' as any,
    taxNote: 'Los precios no incluyen IVA (21%).',
  },
  profilePhotoUrl: 'https://img/1.png',
  countryRegion: 'Mendoza, Argentina',
  description: 'Radio FM líder en la región de Cuyo desde 1990.',
  dni: '30-71234567-9',
};

describe('cuenta Empresa / Agente', () => {
  it('acepta un alta completa y normaliza el CUIT', () => {
    const res = normalizeAdAgentRegistration(valid);
    expect(res.dni).toBe('30712345679');
    expect(res.adAgent.taxCondition).toBe('responsableInscripto');
  });

  it('exige web, condición fiscal, explicación, foto, localización y descripción', () => {
    expect(() =>
      normalizeAdAgentData({ ...valid.adAgent, website: 'radiosol.com' }),
    ).toThrow('sitio web');
    expect(() =>
      normalizeAdAgentData({ ...valid.adAgent, taxCondition: 'otro' as any }),
    ).toThrow('IVA');
    expect(() => normalizeAdAgentData({ ...valid.adAgent, taxNote: 'IVA' })).toThrow();
    expect(() =>
      normalizeAdAgentRegistration({ ...valid, profilePhotoUrl: '' }),
    ).toThrow('foto');
    expect(() =>
      normalizeAdAgentRegistration({ ...valid, countryRegion: ' ' }),
    ).toThrow('localización');
    expect(() =>
      normalizeAdAgentRegistration({ ...valid, description: 'corta' }),
    ).toThrow('descripción');
    expect(() => normalizeCuit('12345678')).toThrow('CUIT');
  });
});
