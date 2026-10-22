import { afterEach, describe, expect, it } from '@jest/globals';

import { MyLoggerService } from 'src/contexts/module_shared/logger/logger.service';
import { calculateProductionLimitsFromUser } from './calculateProductionLimits';

const logger = {
  log: () => undefined,
  warn: () => undefined,
  error: () => undefined,
} as unknown as MyLoggerService;

function userWith(productions: (string | object)[], plans: any[]): any {
  return {
    productions: productions.map((production) =>
      typeof production === 'string' ? { ownerType: production } : production,
    ),
    subscriptions: plans.map((subscriptionPlan) => ({ subscriptionPlan })),
  };
}

describe('calculateProductionLimitsFromUser (Mis Producciones - RNF-06)', () => {
  const ENV_KEYS = [
    'PRODUCTION_FREE_LIBRE_BLOGS',
    'PRODUCTION_FREE_AGENDA_BLOGS',
    'PRODUCTION_FREE_GROUP_BLOGS',
    'PRODUCTION_FREE_FILES_PER_BLOG',
    'PRODUCTION_FILES_PER_BLOG_LIMIT_ENABLED',
  ];

  afterEach(() => {
    ENV_KEYS.forEach((key) => delete process.env[key]);
  });

  it('sin suscripciones aplica el piso del plan gratuito (1 libre + 1 agenda + 1 grupo + 10)', () => {
    const limits = calculateProductionLimitsFromUser(userWith([], []), logger);

    expect(limits.totalLibreBlogLimit).toBe(1);
    expect(limits.totalAgendaBlogLimit).toBe(1);
    expect(limits.totalPersonalBlogLimit).toBe(2);
    expect(limits.totalGroupBlogLimit).toBe(1);
    expect(limits.filesPerBlogLimit).toBe(10);
    expect(limits.libreBlogsAvailable).toBe(1);
    expect(limits.agendaBlogsAvailable).toBe(1);
    expect(limits.groupBlogsAvailable).toBe(1);
  });

  it('planes anteriores a MP (sin las dimensiones) caen al piso gratuito', () => {
    const legacyPlan = { postsLibresCount: 5, postsAgendaCount: 2 };
    const limits = calculateProductionLimitsFromUser(
      userWith([], [legacyPlan, legacyPlan]),
      logger,
    );

    expect(limits.totalLibreBlogLimit).toBe(1);
    expect(limits.totalAgendaBlogLimit).toBe(1);
    expect(limits.totalGroupBlogLimit).toBe(1);
    expect(limits.filesPerBlogLimit).toBe(10);
  });

  it('acumula blogs de grupo y archivos entre suscripciones (PLN-02)', () => {
    const limits = calculateProductionLimitsFromUser(
      userWith(
        [],
        [
          { groupBlogsCount: 3, filesPerBlogCount: 50 },
          { groupBlogsCount: 2, filesPerBlogCount: 25 },
        ],
      ),
      logger,
    );

    expect(limits.totalGroupBlogLimit).toBe(5);
    expect(limits.filesPerBlogLimit).toBe(75);
  });

  it('acumula los cupos de blogs libres y de agenda entre suscripciones, como los anuncios', () => {
    const limits = calculateProductionLimitsFromUser(
      userWith(
        [],
        [
          { personalBlogsLibreCount: 2, personalBlogsAgendaCount: 1 },
          { personalBlogsLibreCount: 3, personalBlogsAgendaCount: 4 },
        ],
      ),
      logger,
    );

    expect(limits.totalLibreBlogLimit).toBe(5);
    expect(limits.totalAgendaBlogLimit).toBe(5);
    expect(limits.totalPersonalBlogLimit).toBe(10);
  });

  it('cuenta blogs libres, de agenda y de grupo por separado (PLN-04)', () => {
    const limits = calculateProductionLimitsFromUser(
      userWith(
        [
          { ownerType: 'User', behaviourType: 'libre' },
          { ownerType: 'User', behaviourType: 'agenda' },
          'Group',
          'Group',
        ],
        [
          {
            personalBlogsLibreCount: 1,
            personalBlogsAgendaCount: 2,
            groupBlogsCount: 3,
          },
        ],
      ),
      logger,
    );

    expect(limits.libreBlogCount).toBe(1);
    expect(limits.agendaBlogCount).toBe(1);
    expect(limits.personalBlogCount).toBe(2);
    expect(limits.groupBlogCount).toBe(2);
    expect(limits.libreBlogsAvailable).toBe(0);
    expect(limits.agendaBlogsAvailable).toBe(1);
    expect(limits.personalBlogsAvailable).toBe(1);
    expect(limits.groupBlogsAvailable).toBe(1);
  });

  it('un blog personal sin comportamiento cuenta según su alcance', () => {
    const limits = calculateProductionLimitsFromUser(
      userWith(
        [
          { ownerType: 'User', visibility: 'friends' },
          { ownerType: 'User', visibility: 'public' },
          { ownerType: 'User' },
        ],
        [],
      ),
      logger,
    );

    expect(limits.agendaBlogCount).toBe(1);
    expect(limits.libreBlogCount).toBe(2);
  });

  it('los pisos gratuitos de blogs libres y de agenda se configuran por env', () => {
    process.env.PRODUCTION_FREE_LIBRE_BLOGS = '3';
    process.env.PRODUCTION_FREE_AGENDA_BLOGS = '0';

    const limits = calculateProductionLimitsFromUser(userWith([], []), logger);

    expect(limits.totalLibreBlogLimit).toBe(3);
    expect(limits.totalAgendaBlogLimit).toBe(0);
    expect(limits.agendaBlogsAvailable).toBe(0);
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

  it('el límite de archivos por blog está apagado salvo que se active el flag', () => {
    expect(
      calculateProductionLimitsFromUser(userWith([], []), logger)
        .filesPerBlogLimitEnabled,
    ).toBe(false);

    process.env.PRODUCTION_FILES_PER_BLOG_LIMIT_ENABLED = 'true';
    expect(
      calculateProductionLimitsFromUser(userWith([], []), logger)
        .filesPerBlogLimitEnabled,
    ).toBe(true);
  });
});
