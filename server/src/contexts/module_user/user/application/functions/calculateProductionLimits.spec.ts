import { afterEach, describe, expect, it } from '@jest/globals';

import { MyLoggerService } from 'src/contexts/module_shared/logger/logger.service';
import { calculateProductionLimitsFromUser } from './calculateProductionLimits';

const logger = {
  log: () => undefined,
  warn: () => undefined,
  error: () => undefined,
} as unknown as MyLoggerService;

function userWith(productions: string[], plans: any[]): any {
  return {
    productions: productions.map((ownerType) => ({ ownerType })),
    subscriptions: plans.map((subscriptionPlan) => ({ subscriptionPlan })),
  };
}

describe('calculateProductionLimitsFromUser (Mis Producciones - RNF-06)', () => {
  const ENV_KEYS = [
    'PRODUCTION_FREE_PERSONAL_BLOGS',
    'PRODUCTION_FREE_GROUP_BLOGS',
    'PRODUCTION_FREE_FILES_PER_BLOG',
    'PRODUCTION_MAX_PERSONAL_BLOGS',
  ];

  afterEach(() => {
    ENV_KEYS.forEach((key) => delete process.env[key]);
  });

  it('sin suscripciones aplica el piso del plan gratuito (1 + 1 + 10)', () => {
    const limits = calculateProductionLimitsFromUser(userWith([], []), logger);

    expect(limits.totalPersonalBlogLimit).toBe(1);
    expect(limits.totalGroupBlogLimit).toBe(1);
    expect(limits.filesPerBlogLimit).toBe(10);
    expect(limits.personalBlogsAvailable).toBe(1);
    expect(limits.groupBlogsAvailable).toBe(1);
  });

  it('planes anteriores a MP (sin las dimensiones) caen al piso gratuito', () => {
    const legacyPlan = { postsLibresCount: 5, postsAgendaCount: 2 };
    const limits = calculateProductionLimitsFromUser(
      userWith([], [legacyPlan, legacyPlan]),
      logger,
    );

    expect(limits.totalPersonalBlogLimit).toBe(1);
    expect(limits.totalGroupBlogLimit).toBe(1);
    expect(limits.filesPerBlogLimit).toBe(10);
  });

  it('acumula blogs de grupo y archivos entre suscripciones (PLN-02)', () => {
    const limits = calculateProductionLimitsFromUser(
      userWith(
        [],
        [
          { personalBlogsCount: 1, groupBlogsCount: 3, filesPerBlogCount: 50 },
          { personalBlogsCount: 1, groupBlogsCount: 2, filesPerBlogCount: 25 },
        ],
      ),
      logger,
    );

    expect(limits.totalGroupBlogLimit).toBe(5);
    expect(limits.filesPerBlogLimit).toBe(75);
  });

  it('el blog personal no se acumula: es 1 fijo aunque haya varios planes', () => {
    const limits = calculateProductionLimitsFromUser(
      userWith(
        [],
        [
          { personalBlogsCount: 1, groupBlogsCount: 1, filesPerBlogCount: 10 },
          { personalBlogsCount: 1, groupBlogsCount: 1, filesPerBlogCount: 10 },
          { personalBlogsCount: 3, groupBlogsCount: 1, filesPerBlogCount: 10 },
        ],
      ),
      logger,
    );

    expect(limits.totalPersonalBlogLimit).toBe(1);
  });

  it('cuenta blogs personales y de grupo por separado y calcula el disponible (PLN-04)', () => {
    const limits = calculateProductionLimitsFromUser(
      userWith(
        ['User', 'Group', 'Group'],
        [{ personalBlogsCount: 1, groupBlogsCount: 3, filesPerBlogCount: 10 }],
      ),
      logger,
    );

    expect(limits.personalBlogCount).toBe(1);
    expect(limits.groupBlogCount).toBe(2);
    expect(limits.personalBlogsAvailable).toBe(0);
    expect(limits.groupBlogsAvailable).toBe(1);
  });

  it('ignora suscripciones sin plan populado (plan borrado)', () => {
    const limits = calculateProductionLimitsFromUser(
      {
        productions: [],
        subscriptions: [
          { subscriptionPlan: null },
          { subscriptionPlan: { groupBlogsCount: 4 } },
        ],
      } as any,
      logger,
    );

    expect(limits.totalGroupBlogLimit).toBe(4);
  });

  it('sólo un plan pago activo habilita tickets pagos (PLN-02/03, TKT-10)', () => {
    const free = { isFree: true, isPack: false };
    const pack = { isFree: false, isPack: true };
    const paid = { isFree: false, isPack: false };

    expect(
      calculateProductionLimitsFromUser(userWith([], []), logger)
        .canSellPaidTickets,
    ).toBe(false);
    expect(
      calculateProductionLimitsFromUser(userWith([], [free, pack]), logger)
        .canSellPaidTickets,
    ).toBe(false);
    expect(
      calculateProductionLimitsFromUser(userWith([], [free, paid]), logger)
        .canSellPaidTickets,
    ).toBe(true);
  });

  it('el piso gratuito es configurable por variables de entorno', () => {
    process.env.PRODUCTION_FREE_GROUP_BLOGS = '2';
    process.env.PRODUCTION_FREE_FILES_PER_BLOG = '25';

    const limits = calculateProductionLimitsFromUser(userWith([], []), logger);

    expect(limits.totalGroupBlogLimit).toBe(2);
    expect(limits.filesPerBlogLimit).toBe(25);
  });

  it('ignora valores inválidos en las variables de entorno', () => {
    process.env.PRODUCTION_FREE_FILES_PER_BLOG = 'no-es-numero';
    process.env.PRODUCTION_FREE_GROUP_BLOGS = '-3';

    const limits = calculateProductionLimitsFromUser(userWith([], []), logger);

    expect(limits.filesPerBlogLimit).toBe(10);
    expect(limits.totalGroupBlogLimit).toBe(1);
  });
});
