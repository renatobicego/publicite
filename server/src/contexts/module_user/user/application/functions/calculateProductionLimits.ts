import { MyLoggerService } from 'src/contexts/module_shared/logger/logger.service';
import { ProductionBehaviourType } from 'src/contexts/module_shared/production-limits/production.behaviour-type.enum';
import {
  getFreeAgendaBlogsLimit,
  getFreeFilesPerBlogLimit,
  getFreeGroupBlogsLimit,
  getFreeLibreBlogsLimit,
  getFreeStorageBytesLimit,
  isBlogLimitEnabled,
  isFilesPerBlogLimitEnabled,
  isStorageLimitEnabled,
} from 'src/contexts/module_shared/production-limits/production.limits.config';

/**
 * Cálculo de límites de "Mis Producciones" (RNF-06, PLN-01/02/04/05).
 *
 * Replica el patrón acumulativo de `calculatePostLimitAndContactLimit`: se suman
 * las dimensiones de todas las suscripciones activas del usuario. Diferencias
 * propias de MP:
 *
 * - **Blogs personales:** separados por comportamiento (libre / agenda) igual que
 *   los anuncios, y acumulativos entre suscripciones. Un blog personal guardado
 *   antes del comportamiento cuenta como agenda si su alcance es de la agenda
 *   de contactos, y como libre en cualquier otro caso.
 * - **Blogs de grupo / archivos por blog:** también se acumulan.
 * - **Piso gratuito:** si el usuario no tiene suscripciones activas, o sus planes
 *   son anteriores a MP y no tienen las dimensiones cargadas, el total da 0 y se
 *   aplica el piso del plan gratuito. Es un default seguro: nunca otorga más que
 *   el free, y en cuanto el admin configure el plan manda la DB.
 *
 * El cupo de archivos es **por blog**, no un total global del usuario.
 */

interface userWithProductionsAndSubscriptions {
  productions: [
    {
      ownerType: string; // 'User' (blog personal) o 'Group' (blog de grupo)
      behaviourType?: string | null; // 'libre' | 'agenda' (sólo personales)
      visibility?: string | null;
    },
  ];
  subscriptions: [
    {
      subscriptionPlan: {
        personalBlogsLibreCount?: number;
        personalBlogsAgendaCount?: number;
        groupBlogsCount?: number;
        filesPerBlogCount?: number;
        storageBytesLimit?: number;
        isFree?: boolean;
        isPack?: boolean;
      };
    },
  ];
}

interface ProductionLimits {
  /** Blogs personales (libres + agenda). */
  personalBlogCount: number;
  libreBlogCount: number;
  agendaBlogCount: number;
  totalLibreBlogLimit: number;
  totalAgendaBlogLimit: number;
  libreBlogsAvailable: number;
  agendaBlogsAvailable: number;
  groupBlogCount: number;
  totalPersonalBlogLimit: number;
  totalGroupBlogLimit: number;
  personalBlogsAvailable: number;
  groupBlogsAvailable: number;
  filesPerBlogLimit: number;
  /**
   * Feature flag: ¿se aplica el límite de CANTIDAD de blogs por usuario? Si es
   * false, `personalBlogsAvailable` / `groupBlogsAvailable` quedan "infinitos".
   */
  blogLimitEnabled: boolean;
  /**
   * Feature flag: ¿se aplica el límite de CANTIDAD de archivos por blog? Si es
   * false, `filesPerBlogLimit` es informativo y no se rechazan subidas.
   */
  filesPerBlogLimitEnabled: boolean;
  /** Feature flag: ¿se aplica el límite de ALMACENAMIENTO por usuario? */
  storageLimitEnabled: boolean;
  /**
   * Límite de almacenamiento POR USUARIO en bytes (suma de los archivos de todos
   * sus blogs). Acumulativo entre suscripciones; piso gratuito si el plan no lo
   * define. Sólo relevante si `storageLimitEnabled`.
   */
  storageBytesLimit: number;
  /**
   * Tickets pagos (PLN-02/03, TKT-10): sólo con un plan pago activo. El plan
   * gratuito y los packs de publicaciones no los habilitan.
   */
  canSellPaidTickets: boolean;
}

const AGENDA_VISIBILITIES = ['contacts', 'friends', 'topfriends'];

/** Comportamiento de un blog personal (deducido del alcance si es anterior). */
function personalBlogBehaviour(production: {
  behaviourType?: string | null;
  visibility?: string | null;
}): ProductionBehaviourType {
  if (production.behaviourType === ProductionBehaviourType.agenda) {
    return ProductionBehaviourType.agenda;
  }
  if (production.behaviourType === ProductionBehaviourType.libre) {
    return ProductionBehaviourType.libre;
  }
  return AGENDA_VISIBILITIES.includes(production.visibility ?? '')
    ? ProductionBehaviourType.agenda
    : ProductionBehaviourType.libre;
}

function calculateProductionLimitsFromUser(
  userWithProductionsAndSubscriptions: userWithProductionsAndSubscriptions,
  logger: MyLoggerService,
): ProductionLimits {
  const subscriptions = userWithProductionsAndSubscriptions.subscriptions ?? [];
  const productions = userWithProductionsAndSubscriptions.productions ?? [];

  const {
    totalLibreBlogs,
    totalAgendaBlogs,
    totalGroupBlogLimit,
    totalFilesPerBlog,
    totalStorageBytes,
  } = subscriptions.reduce(
    (limits, subscription) => {
      const plan = subscription?.subscriptionPlan;
      if (!plan) return limits;
      limits.totalLibreBlogs += plan.personalBlogsLibreCount ?? 0;
      limits.totalAgendaBlogs += plan.personalBlogsAgendaCount ?? 0;
      limits.totalGroupBlogLimit += plan.groupBlogsCount ?? 0;
      limits.totalFilesPerBlog += plan.filesPerBlogCount ?? 0;
      limits.totalStorageBytes += plan.storageBytesLimit ?? 0;
      return limits;
    },
    {
      totalLibreBlogs: 0,
      totalAgendaBlogs: 0,
      totalGroupBlogLimit: 0,
      totalFilesPerBlog: 0,
      totalStorageBytes: 0,
    },
  );

  const { libreBlogCount, agendaBlogCount, groupBlogCount } = productions.reduce(
    (counts, production) => {
      if (!production) return counts;
      if (production.ownerType === 'Group') counts.groupBlogCount++;
      else if (
        personalBlogBehaviour(production) === ProductionBehaviourType.agenda
      ) {
        counts.agendaBlogCount++;
      } else counts.libreBlogCount++;
      return counts;
    },
    { libreBlogCount: 0, agendaBlogCount: 0, groupBlogCount: 0 },
  );
  const personalBlogCount = libreBlogCount + agendaBlogCount;

  // Piso gratuito cuando el plan no define la dimensión (default seguro).
  const totalLibreBlogLimit =
    totalLibreBlogs > 0 ? totalLibreBlogs : getFreeLibreBlogsLimit();
  const totalAgendaBlogLimit =
    totalAgendaBlogs > 0 ? totalAgendaBlogs : getFreeAgendaBlogsLimit();
  const totalPersonalBlogLimit = totalLibreBlogLimit + totalAgendaBlogLimit;
  const groupBlogLimit =
    totalGroupBlogLimit > 0 ? totalGroupBlogLimit : getFreeGroupBlogsLimit();
  const filesPerBlogLimit =
    totalFilesPerBlog > 0 ? totalFilesPerBlog : getFreeFilesPerBlogLimit();
  const storageBytesLimit =
    totalStorageBytes > 0 ? totalStorageBytes : getFreeStorageBytesLimit();

  const blogLimitEnabled = isBlogLimitEnabled();
  const filesPerBlogLimitEnabled = isFilesPerBlogLimitEnabled();
  const storageLimitEnabled = isStorageLimitEnabled();

  logger.warn('Status of Limit productions of user: ');
  logger.log(
    'User has libre blogs: ' +
      libreBlogCount +
      ' |--| User has agenda blogs: ' +
      agendaBlogCount +
      ' |--| User has group blogs: ' +
      groupBlogCount,
  );
  logger.log(
    'Total libre blog limit: ' +
      totalLibreBlogLimit +
      ' - Total agenda blog limit: ' +
      totalAgendaBlogLimit +
      ' - Total group blog limit: ' +
      groupBlogLimit +
      ' - Files per blog limit: ' +
      filesPerBlogLimit,
  );

  // Con el flag de blogs apagado no se aplica tope de cantidad: la
  // disponibilidad queda "infinita" (Infinity) para que los gates siempre pasen.
  const libreBlogsAvailable = blogLimitEnabled
    ? totalLibreBlogLimit - libreBlogCount
    : Infinity;
  const agendaBlogsAvailable = blogLimitEnabled
    ? totalAgendaBlogLimit - agendaBlogCount
    : Infinity;
  const personalBlogsAvailable = blogLimitEnabled
    ? Math.max(0, libreBlogsAvailable) + Math.max(0, agendaBlogsAvailable)
    : Infinity;
  const groupBlogsAvailable = blogLimitEnabled
    ? groupBlogLimit - groupBlogCount
    : Infinity;
  const canSellPaidTickets = subscriptions.some(
    (subscription) =>
      !!subscription?.subscriptionPlan &&
      subscription.subscriptionPlan.isFree !== true &&
      subscription.subscriptionPlan.isPack !== true,
  );

  return {
    personalBlogCount,
    libreBlogCount,
    agendaBlogCount,
    totalLibreBlogLimit,
    totalAgendaBlogLimit,
    libreBlogsAvailable,
    agendaBlogsAvailable,
    groupBlogCount,
    totalPersonalBlogLimit,
    totalGroupBlogLimit: groupBlogLimit,
    personalBlogsAvailable,
    groupBlogsAvailable,
    filesPerBlogLimit,
    blogLimitEnabled,
    filesPerBlogLimitEnabled,
    storageLimitEnabled,
    storageBytesLimit,
    canSellPaidTickets,
  };
}

export {
  calculateProductionLimitsFromUser,
  userWithProductionsAndSubscriptions,
  ProductionLimits,
};
