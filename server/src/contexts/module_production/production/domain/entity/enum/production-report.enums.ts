import { registerEnumType } from '@nestjs/graphql';

/** Motivo de la denuncia (DEN-01). */
export enum ProductionReportReason {
  inappropriate = 'inappropriate',
  violence = 'violence',
  sexual = 'sexual',
  spam = 'spam',
  copyright = 'copyright',
  other = 'other',
}

registerEnumType(ProductionReportReason, {
  name: 'ProductionReportReason',
  description:
    'Contenido inapropiado, violencia, sexual, spam, derechos de autor u otro',
});

/** Estado de una denuncia (DEN-03). */
export enum ProductionReportStatus {
  pending = 'pending',
  upheld = 'upheld',
  dismissed = 'dismissed',
}

registerEnumType(ProductionReportStatus, {
  name: 'ProductionReportStatus',
  description:
    'pending (sin revisar), upheld (el admin bloqueó el contenido), dismissed (el admin lo restauró)',
});

/** Decisión del admin sobre el contenido denunciado (DEN-03). */
export enum ProductionModerationAction {
  block = 'block',
  restore = 'restore',
}

registerEnumType(ProductionModerationAction, {
  name: 'ProductionModerationAction',
  description: 'block: confirma el bloqueo; restore: vuelve a mostrar el contenido',
});
