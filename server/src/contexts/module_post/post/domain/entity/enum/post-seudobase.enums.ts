import { registerEnumType } from '@nestjs/graphql';

/**
 * Operaciones masivas soportadas por la SeudoBase de Anuncios (SB-02/03).
 * Espeja `ProductionBulkAction` pero aplicado a `Post`.
 */
export enum PostBulkAction {
  price = 'price',
  visibility = 'visibility',
  delete = 'delete',
}

registerEnumType(PostBulkAction, {
  name: 'PostBulkAction',
  description: 'Operación masiva de la SeudoBase de Anuncios',
});

/** Modo del cambio masivo de precio: porcentual o precio fijo. */
export enum PostPriceChangeMode {
  percentage = 'percentage',
  fixed = 'fixed',
}

registerEnumType(PostPriceChangeMode, {
  name: 'PostPriceChangeMode',
  description: 'Modo del cambio masivo de precio (porcentaje o fijo)',
});
