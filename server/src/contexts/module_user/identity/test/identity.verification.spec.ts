import {
  BadRequestException,
  ServiceUnavailableException,
} from '@nestjs/common';

import {
  evaluateDiditResponse,
  toRenaperGender,
} from '../application/functions/evaluateDiditResponse';
import { IdentityVerificationService } from '../application/service/identity.verification.service';
import { MockIdentityVerifier } from '../infraestructure/adapters/mock.identity.verifier';

const renaper = (outcome_code: string, validation: any = {}, source_data: any = {}) => ({
  request_id: 'req-1',
  status: 'Approved',
  match_type: 'full_match',
  validations: [
    { outcome_code, service_id: 'arg_renaper_data', validation, source_data },
  ],
});

describe('evaluateDiditResponse', () => {
  it('aprueba con MATCH', () => {
    expect(evaluateDiditResponse(renaper('MATCH'))).toEqual({
      status: 'approved',
      outcomeCode: 'MATCH',
      requestId: 'req-1',
    });
  });

  it('acepta la respuesta anidada en database_validation', () => {
    const body = { request_id: 'req-2', database_validation: renaper('MATCH') };
    expect(evaluateDiditResponse(body).status).toBe('approved');
  });

  it('PARTIAL_MATCH con fecha distinta se rechaza', () => {
    const r = evaluateDiditResponse(
      renaper('PARTIAL_MATCH', {
        identification_number: 'full_match',
        date_of_birth: 'no_match',
      }),
    );
    expect(r.status).toBe('declined');
  });

  it('PARTIAL_MATCH sólo por el nombre se aprueba', () => {
    const r = evaluateDiditResponse(
      renaper(
        'PARTIAL_MATCH',
        { identification_number: 'full_match', date_of_birth: 'full_match', full_name: 'no_match' },
        { gender_match: true },
      ),
    );
    expect(r.status).toBe('approved');
  });

  it('PARTIAL_MATCH con sexo distinto se rechaza', () => {
    const r = evaluateDiditResponse(
      renaper(
        'PARTIAL_MATCH',
        { identification_number: 'full_match', date_of_birth: 'full_match' },
        { gender_match: false },
      ),
    );
    expect(r.status).toBe('declined');
  });

  it.each(['NO_MATCH', 'DOCUMENT_NOT_FOUND', 'MINOR_BLOCKED', 'DECEASED'])(
    '%s se rechaza',
    (code) => {
      expect(evaluateDiditResponse(renaper(code)).status).toBe('declined');
    },
  );

  it.each(['INCONCLUSIVE', 'REGISTRY_UNAVAILABLE', 'REGISTRY_ERROR'])(
    '%s queda como no disponible',
    (code) => {
      expect(evaluateDiditResponse(renaper(code)).status).toBe('unavailable');
    },
  );

  it('sin validaciones queda como no disponible', () => {
    expect(evaluateDiditResponse({ database_validation: { errors: [{}] } }).status).toBe(
      'unavailable',
    );
    expect(evaluateDiditResponse(null).status).toBe('unavailable');
  });

  it('traduce el sexo a M/F/X', () => {
    expect(toRenaperGender('M')).toBe('M');
    expect(toRenaperGender('F')).toBe('F');
    expect(toRenaperGender('O')).toBe('X');
    expect(toRenaperGender(undefined)).toBe('X');
  });
});

describe('IdentityVerificationService', () => {
  const logger: any = { log: jest.fn(), warn: jest.fn(), error: jest.fn() };
  const input = { dni: '30123456', gender: 'M', birthDate: '1990-05-01', clerkId: 'user_1' };
  let exists: jest.Mock;
  let service: IdentityVerificationService;
  const previous = process.env.IDENTITY_VERIFICATION_ENABLED;

  beforeEach(() => {
    process.env.IDENTITY_VERIFICATION_ENABLED = 'true';
    exists = jest.fn().mockResolvedValue(false);
    service = new IdentityVerificationService(
      new MockIdentityVerifier(),
      { existsVerifiedPersonWithDni: exists } as any,
      logger,
    );
  });

  afterAll(() => {
    process.env.IDENTITY_VERIFICATION_ENABLED = previous;
  });

  it('apagada no verifica', async () => {
    process.env.IDENTITY_VERIFICATION_ENABLED = 'false';
    await expect(service.verifyPersonForRegistration(input)).resolves.toBeNull();
    expect(exists).not.toHaveBeenCalled();
  });

  it('aprobada devuelve el registro a guardar', async () => {
    const record = await service.verifyPersonForRegistration(input);
    expect(record).toMatchObject({ provider: 'mock', method: 'renaperData' });
    expect(record?.verifiedAt).toBeInstanceOf(Date);
  });

  it('datos que no coinciden bloquean el registro', async () => {
    await expect(
      service.verifyPersonForRegistration({ ...input, dni: '30123400' }),
    ).rejects.toBeInstanceOf(BadRequestException);
  });

  it('RENAPER caído también bloquea, con otro error', async () => {
    await expect(
      service.verifyPersonForRegistration({ ...input, dni: '30123499' }),
    ).rejects.toBeInstanceOf(ServiceUnavailableException);
  });

  it('un DNI ya verificado en otra cuenta se rechaza sin consultar', async () => {
    exists.mockResolvedValue(true);
    const verifier = new MockIdentityVerifier();
    const spy = jest.spyOn(verifier, 'verifyPerson');
    service = new IdentityVerificationService(
      verifier,
      { existsVerifiedPersonWithDni: exists } as any,
      logger,
    );
    await expect(service.verifyPersonForRegistration(input)).rejects.toThrow(
      'Ya hay una cuenta registrada con este DNI.',
    );
    expect(spy).not.toHaveBeenCalled();
  });

  it('rechaza un DNI con puntos o una fecha inválida', async () => {
    await expect(
      service.verifyPersonForRegistration({ ...input, dni: '30.123.456' }),
    ).rejects.toBeInstanceOf(BadRequestException);
    await expect(
      service.verifyPersonForRegistration({ ...input, birthDate: '' }),
    ).rejects.toBeInstanceOf(BadRequestException);
  });
});
