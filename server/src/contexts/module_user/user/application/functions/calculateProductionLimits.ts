import { MyLoggerService } from 'src/contexts/module_shared/logger/logger.service';
import {
  getFreeFilesPerBlogLimit,
  getFreeGroupBlogsLimit,
  getFreePersonalBlogsLimit,
  getMaxPersonalBlogsLimit,
} from 'src/contexts/module_shared/production-limits/production.limits.config';

/**
 * Cálculo de límites de "Mis Producciones" (RNF-06, PLN-01/02/04/05).
 *
 * Replica el patrón acumulativo de `calculatePostLimitAndContactLimit`: se suman
 * las dimensiones de todas las suscripciones activas del usuario. Diferencias
 * propias de MP:
 *
 * - **Blogs personales:** NO se acumulan. El blog personal es 1 fijo en todos los
 *   planes (PLN-02: mejorar de plan no aumenta el blog personal), así que se toma
 *   el máximo entre planes y se clampea al tope duro del sistema.
 * - **Blogs de grupo / archivos por blog:** sí se acumulan entre suscripciones.
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
    },
  ];
  subscriptions: [
    {
      subscriptionPlan: {
        personalBlogsCount?: number;
        groupBlogsCount?: number;
        filesPerBlogCount?: number;
        isFree?: boolean;
        isPack?: boolean;
      };
    },
  ];
}

interface ProductionLimits {
  personalBlogCount: number;
  groupBlogCount: number;
  totalPersonalBlogLimit: number;
  totalGroupBlogLimit: number;
  personalBlogsAvailable: number;
  groupBlogsAvailable: number;
  filesPerBlogLimit: number;
  /**
   * Tickets pagos (PLN-02/03, TKT-10): sólo con un plan pago activo. El plan
   * gratuito y los packs de publicaciones no los habilitan.
   */
  canSellPaidTickets: boolean;
}

function calculateProductionLimitsFromUser(
  userWithProductionsAndSubscriptions: userWithProductionsAndSubscriptions,
  logger: MyLoggerService,
): ProductionLimits {
  const subscriptions = userWithProductionsAndSubscriptions.subscriptions ?? [];
  const productions = userWithProductionsAndSubscriptions.productions ?? [];

  const { maxPersonalBlogs, totalGroupBlogLimit, totalFilesPerBlog } =
    subscriptions.reduce(
      (limits, subscription) => {
        const plan = subscription?.subscriptionPlan;
        if (!plan) return limits;
        limits.maxPersonalBlogs = Math.max(
          limits.maxPersonalBlogs,
          plan.personalBlogsCount ?? 0,
        );
        limits.totalGroupBlogLimit += plan.groupBlogsCount ?? 0;
        limits.totalFilesPerBlog += plan.filesPerBlogCount ?? 0;
        return limits;
      },
      { maxPersonalBlogs: 0, totalGroupBlogLimit: 0, totalFilesPerBlog: 0 },
    );

  const { personalBlogCount, groupBlogCount } = productions.reduce(
    (counts, production) => {
      if (production?.ownerType === 'Group') counts.groupBlogCount++;
      else counts.personalBlogCount++;
      return counts;
    },
    { personalBlogCount: 0, groupBlogCount: 0 },
  );

  // Piso gratuito cuando el plan no define la dimensión (default seguro).
  const totalPersonalBlogLimit = Math.min(
    maxPersonalBlogs > 0 ? maxPersonalBlogs : getFreePersonalBlogsLimit(),
    getMaxPersonalBlogsLimit(),
  );
  const groupBlogLimit =
    totalGroupBlogLimit > 0 ? totalGroupBlogLimit : getFreeGroupBlogsLimit();
  const filesPerBlogLimit =
    totalFilesPerBlog > 0 ? totalFilesPerBlog : getFreeFilesPerBlogLimit();

  logger.warn('Status of Limit productions of user: ');
  logger.log(
    'User has personal blogs: ' +
      personalBlogCount +
      ' |--| User has group blogs: ' +
      groupBlogCount,
  );
  logger.log(
    'Total personal blog limit: ' +
      totalPersonalBlogLimit +
      ' - Total group blog limit: ' +
      groupBlogLimit +
      ' - Files per blog limit: ' +
      filesPerBlogLimit,
  );

  const personalBlogsAvailable = totalPersonalBlogLimit - personalBlogCount;
  const groupBlogsAvailable = groupBlogLimit - groupBlogCount;
  const canSellPaidTickets = subscriptions.some(
    (subscription) =>
      !!subscription?.subscriptionPlan &&
      subscription.subscriptionPlan.isFree !== true &&
      subscription.subscriptionPlan.isPack !== true,
  );

  return {
    personalBlogCount,
    groupBlogCount,
    totalPersonalBlogLimit,
    totalGroupBlogLimit: groupBlogLimit,
    personalBlogsAvailable,
    groupBlogsAvailable,
    filesPerBlogLimit,
    canSellPaidTickets,
  };
}

export {
  calculateProductionLimitsFromUser,
  userWithProductionsAndSubscriptions,
  ProductionLimits,
};
