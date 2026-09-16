import { Provider } from '@nestjs/common';
import { ModelDefinition } from '@nestjs/mongoose';

import ProductionModel from '../schemas/production.schema';
import ProductionItemModel, {
  PRODUCTION_ITEM_DISCRIMINATORS,
} from '../schemas/production-item.schema';
import ProductionAccessGrantModel from '../schemas/production-access-grant.schema';
import ProductionTicketModel from '../schemas/production-ticket.schema';
import ProductionTicketPurchaseModel from '../schemas/production-ticket-purchase.schema';
import { ProductionRepository } from '../repository/production.repository';
import { ProductionItemRepository } from '../repository/production-item.repository';
import { ProductionAccessGrantRepository } from '../repository/production-access-grant.repository';
import {
  ProductionTicketPurchaseRepository,
  ProductionTicketRepository,
} from '../repository/production-ticket.repository';
import { ProductionService } from '../../application/service/production.service';
import { ProductionAccessService } from '../../application/service/production.access.service';
import { ProductionCascadeService } from '../../application/service/production.cascade.service';
import { ProductionInsightsService } from '../../application/service/production.insights.service';
import { ProductionTicketService } from '../../application/service/production.ticket.service';
import { ProductionAdapter } from '../adapter/production.adapter';
import { ProductionTicketAdapter } from '../adapter/production-ticket.adapter';
import ProductionAuditLogModel from '../schemas/production-audit-log.schema';
import { ProductionAuditRepository } from '../repository/production-audit.repository';
import { ProductionSeudoBaseService } from '../../application/service/production.seudobase.service';
import { ProductionSeudoBaseAdapter } from '../adapter/production-seudobase.adapter';

/**
 * Modelos y providers de MP, compartidos por el módulo y por el módulo de
 * test para que no se desincronicen.
 */
export const PRODUCTION_MODELS: ModelDefinition[] = [
  { name: ProductionModel.modelName, schema: ProductionModel.schema },
  {
    name: ProductionItemModel.modelName,
    schema: ProductionItemModel.schema,
    // Los discriminators se registran una sola vez por conexión.
    discriminators: PRODUCTION_ITEM_DISCRIMINATORS,
  },
  {
    name: ProductionAccessGrantModel.modelName,
    schema: ProductionAccessGrantModel.schema,
  },
  { name: ProductionTicketModel.modelName, schema: ProductionTicketModel.schema },
  {
    name: ProductionTicketPurchaseModel.modelName,
    schema: ProductionTicketPurchaseModel.schema,
  },
  {
    name: ProductionAuditLogModel.modelName,
    schema: ProductionAuditLogModel.schema,
  },
];

export const PRODUCTION_PROVIDERS: Provider[] = [
  ProductionAccessService,
  ProductionCascadeService,
  { provide: 'ProductionRepositoryInterface', useClass: ProductionRepository },
  {
    provide: 'ProductionItemRepositoryInterface',
    useClass: ProductionItemRepository,
  },
  {
    provide: 'ProductionAccessGrantRepositoryInterface',
    useClass: ProductionAccessGrantRepository,
  },
  {
    provide: 'ProductionTicketRepositoryInterface',
    useClass: ProductionTicketRepository,
  },
  {
    provide: 'ProductionTicketPurchaseRepositoryInterface',
    useClass: ProductionTicketPurchaseRepository,
  },
  {
    provide: 'ProductionAuditRepositoryInterface',
    useClass: ProductionAuditRepository,
  },
  { provide: 'ProductionServiceInterface', useClass: ProductionService },
  {
    provide: 'ProductionInsightsServiceInterface',
    useClass: ProductionInsightsService,
  },
  {
    provide: 'ProductionTicketServiceInterface',
    useClass: ProductionTicketService,
  },
  {
    provide: 'ProductionSeudoBaseServiceInterface',
    useClass: ProductionSeudoBaseService,
  },
  { provide: 'ProductionAdapterInterface', useClass: ProductionAdapter },
  {
    provide: 'ProductionTicketAdapterInterface',
    useClass: ProductionTicketAdapter,
  },
  {
    provide: 'ProductionSeudoBaseAdapterInterface',
    useClass: ProductionSeudoBaseAdapter,
  },
];
