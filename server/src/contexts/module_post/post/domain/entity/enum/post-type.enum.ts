import { registerEnumType } from '@nestjs/graphql';

export enum PostType {
  good = 'good',
  service = 'service',
  petition = 'petition',
  // Espacio publicitario (radio, TV, vía pública…). Sólo cuentas Empresa /
  // Agente y siempre geolocalizado (libre).
  adspace = 'adspace',
}

registerEnumType(PostType, {
  name: 'PostType',
  description: 'Type of the post ',
});
