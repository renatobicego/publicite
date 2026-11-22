import { BadRequestException } from '@nestjs/common';
import { AdAgentTaxCondition } from '../../domain/entity/enum/adAgent.enums';

/**
 * Datos propios de una cuenta Empresa / Agente (`User.adAgent`): la única que
 * puede publicar espacios publicitarios.
 */
export interface AdAgentData {
  website: string;
  taxCondition: AdAgentTaxCondition;
  taxNote: string;
}

/** Lo que se muestra de un agente en sus espacios publicitarios. */
export interface AdAgentProfile {
  userId: string;
  businessName: string | null;
  countryRegion: string | null;
  website: string;
  taxCondition: string;
  taxNote: string;
}

const URL_REGEX = /^https?:\/\/[^\s/$.?#].[^\s]*$/i;
const CUIT_REGEX = /^\d{11}$/;
export const MIN_AGENT_DESCRIPTION = 20;
const MAX_TAX_NOTE = 1000;
const MIN_TAX_NOTE = 10;

const fail = (message: string): never => {
  throw new BadRequestException(message);
};

/** Valida sitio web e impuestos (alta y edición). */
export function normalizeAdAgentData(
  input: Partial<AdAgentData> | null | undefined,
): AdAgentData {
  const website = (input?.website ?? '').trim();
  if (!URL_REGEX.test(website)) {
    fail('Ingresá el sitio web oficial (tiene que empezar con http:// o https://).');
  }
  const taxCondition = Object.values(AdAgentTaxCondition).find(
    (t) => t === input?.taxCondition,
  );
  if (!taxCondition) fail('Elegí tu condición frente al IVA.');
  const taxNote = (input?.taxNote ?? '').trim();
  if (taxNote.length < MIN_TAX_NOTE) {
    fail('Explicá cómo facturás y qué impuestos se suman al precio.');
  }
  if (taxNote.length > MAX_TAX_NOTE) {
    fail(`La explicación de impuestos puede tener hasta ${MAX_TAX_NOTE} caracteres.`);
  }
  return { website, taxCondition: taxCondition!, taxNote };
}

/** CUIT con o sin guiones → 11 dígitos. */
export function normalizeCuit(value: string | null | undefined): string {
  const cuit = (value ?? '').replace(/[-\s]/g, '');
  if (!CUIT_REGEX.test(cuit)) fail('Ingresá un CUIT válido de 11 dígitos.');
  return cuit;
}

/**
 * Requisitos del alta de una cuenta Empresa / Agente: sitio web, foto,
 * localización, descripción, CUIT y explicación de impuestos.
 */
export function normalizeAdAgentRegistration(request: {
  adAgent?: Partial<AdAgentData> | null;
  profilePhotoUrl?: string | null;
  countryRegion?: string | null;
  description?: string | null;
  dni?: string | null;
}): { adAgent: AdAgentData; dni: string } {
  const adAgent = normalizeAdAgentData(request.adAgent);
  if (!request.profilePhotoUrl?.trim()) fail('Subí una foto o logo para tu cuenta.');
  if (!request.countryRegion?.trim()) fail('Indicá tu localización.');
  if ((request.description ?? '').trim().length < MIN_AGENT_DESCRIPTION) {
    fail(`Escribí una descripción de al menos ${MIN_AGENT_DESCRIPTION} caracteres.`);
  }
  return { adAgent, dni: normalizeCuit(request.dni) };
}
