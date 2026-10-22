import { Production } from '../../domain/entity/production.entity';
import {
  ProductionArticle,
  ProductionFile,
  ProductionItem,
} from '../../domain/entity/production-item.entity';
import { ProductionRole, ProductionVisibility } from '../../domain/entity/enum/production.enums';
import { ProductionOwnerInfo } from '../../domain/repository/production.repository.interface';
import {
  ProductionItemResponse,
  ProductionResponse,
  ProductionTicketSummaryResponse,
} from '../../domain/entity/models_graphql/HTTP-RESPONSE/production.response';
import { getTicketCommissionPercent } from 'src/contexts/module_shared/production-limits/production.limits.config';
import { AccessDecision } from './production.access';
import { ProductionPermissions } from './production.roles';

export interface ProductionViewExtras {
  ownerInfo?: ProductionOwnerInfo | null;
  filesPerBlogLimit?: number | null;
  foldersCount?: number | null;
  rootFilesCount?: number | null;
  isFan?: boolean;
  pendingReviewProductionId?: string | null;
}

/** Arma la respuesta del blog según el rol de quien consulta. */
function toGeoLocationResponse(production: Production) {
  const geo = production.getGeoLocation;
  if (!geo) return null;
  const [longitude, latitude] = geo.location.coordinates;
  return {
    latitude,
    longitude,
    description: geo.description,
    userSetted: geo.userSetted,
    ratio: geo.ratio,
  };
}

export function toProductionResponse(
  production: Production,
  role: ProductionRole,
  decision: AccessDecision,
  extras: ProductionViewExtras = {},
): ProductionResponse {
  const isStaff = ProductionPermissions.canEditContent(role);
  const canManagePayout = ProductionPermissions.canManagePayout(role);

  return {
    _id: production.getId!,
    owner: production.getOwner,
    ownerType: production.getOwnerType,
    ownerInfo: extras.ownerInfo ?? null,
    creator: production.getCreator,
    title: production.getTitle,
    description: production.getDescription ?? '',
    headerPhotoKey: production.getHeaderPhotoKey ?? null,
    welcomeText: production.getWelcomeText ?? null,
    welcomeVideoKey: production.getWelcomeVideoKey ?? null,
    url: production.getUrl,
    shelf: production.getShelf ?? [],
    // El muestrario expone archivos: sólo si se puede ver el contenido.
    showcase: decision.canViewContent ? production.getShowcase ?? [] : [],
    visibility: (production.getVisibility ?? ProductionVisibility.public) as ProductionVisibility,
    behaviourType: production.getBehaviourType,
    geoLocation: toGeoLocationResponse(production),
    hasAccessKey: production.hasAccessKey,
    filesCount: production.getFilesCount ?? 0,
    foldersCount: extras.foldersCount ?? null,
    rootFilesCount: extras.rootFilesCount ?? null,
    filesPerBlogLimit: isStaff ? extras.filesPerBlogLimit ?? null : null,
    fansCount: production.getFansCount ?? 0,
    rating: production.getRating,
    reviewsCount: production.getReviewsCount,
    isFeatured: production.getIsFeatured ?? false,
    moderationStatus: isStaff ? production.getModerationStatus : null,
    aliasCbu: canManagePayout ? production.getAliasCbu ?? null : null,
    ticketCommissionPercent: getTicketCommissionPercent(),
    createdAt: production.getCreatedAt,
    updatedAt: production.getUpdatedAt,
    viewer: {
      role,
      canViewContent: decision.canViewContent,
      lockReason: decision.lockReason,
      canEdit: isStaff,
      canManageAccess: ProductionPermissions.canManageAccess(role),
      canDelete: ProductionPermissions.canDeleteBlog(role),
      canManagePayout,
      isFan: extras.isFan ?? false,
      pendingReviewProductionId: extras.pendingReviewProductionId ?? null,
    },
  };
}

/**
 * Arma la respuesta de un ítem. Si el contenido está bloqueado (ticket, clave,
 * reseña pendiente) se devuelven sólo los metadatos: sin key, bloques ni dorso.
 */
export function toItemResponse(
  item: ProductionItem,
  params: {
    role: ProductionRole;
    decision: AccessDecision;
    effectiveVisibility: string;
    ticket?: ProductionTicketSummaryResponse | null;
  },
): ProductionItemResponse {
  const { role, decision } = params;
  const canView = decision.canViewContent;

  const response: ProductionItemResponse = {
    _id: item.getId!,
    production: item.getProduction,
    parent: item.getParent,
    kind: item.getKind,
    name: item.getName,
    visibility: (item.getVisibility as ProductionVisibility) ?? null,
    effectiveVisibility: params.effectiveVisibility as ProductionVisibility,
    moderationStatus: ProductionPermissions.canEditContent(role)
      ? item.getModerationStatus
      : null,
    createdAt: item.getCreatedAt,
    updatedAt: item.getUpdatedAt,
    access: {
      canViewContent: canView,
      lockReason: decision.lockReason,
      ticket: params.ticket ?? null,
    },
  };

  if (item instanceof ProductionFile) {
    response.fileName = item.getFileName;
    response.fileType = item.getFileType;
    response.key = canView ? item.getKey : null;
    response.postcard = canView ? item.getPostcard ?? null : null;
  } else if (item instanceof ProductionArticle) {
    response.fileName = item.getFileName;
    response.blocks = canView ? item.getBlocks : null;
  }

  return response;
}
