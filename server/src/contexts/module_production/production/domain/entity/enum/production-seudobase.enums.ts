import { registerEnumType } from '@nestjs/graphql';

/** Operaciones masivas de la SeudoBase (SB-02, D5). */
export enum ProductionBulkAction {
  price = 'price',
  visibility = 'visibility',
  delete = 'delete',
}

registerEnumType(ProductionBulkAction, {
  name: 'ProductionBulkAction',
  description: 'Edición masiva de precio, cambio de visibilidad o borrado',
});

/** Cómo se aplica el cambio masivo de precio. */
export enum ProductionPriceChangeMode {
  percentage = 'percentage',
  fixed = 'fixed',
}

registerEnumType(ProductionPriceChangeMode, {
  name: 'ProductionPriceChangeMode',
  description:
    'percentage: suma o resta un porcentaje (ej. 5 = +5%); fixed: fija el precio',
});
