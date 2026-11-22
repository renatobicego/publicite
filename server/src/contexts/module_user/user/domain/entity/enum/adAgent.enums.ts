import { registerEnumType } from '@nestjs/graphql';

/** Condición frente al IVA de una cuenta Empresa / Agente. */
export enum AdAgentTaxCondition {
  responsableInscripto = 'responsableInscripto',
  monotributo = 'monotributo',
  exento = 'exento',
  noAlcanzado = 'noAlcanzado',
}

registerEnumType(AdAgentTaxCondition, {
  name: 'AdAgentTaxCondition',
  description: 'Condición frente al IVA de una cuenta Empresa / Agente',
});
